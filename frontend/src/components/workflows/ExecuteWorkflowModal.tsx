'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2, CheckCircle2, AlertCircle, Webhook, Link2, Sparkles, ChevronDown, ChevronRight, Code2, ArrowRight } from 'lucide-react';
import { getWorkflow } from '@/lib/api';

interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodes?: unknown[];
}

interface WebhookInfo {
    url: string;
    path: string;
    httpMethod: string;
}

interface InputField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    required: boolean;
    description?: string;
    default?: string;
}

interface NodeOutput {
    nodeName: string;
    nodeType: string;
    data: unknown;
    error?: string;
}

interface ExecuteWorkflowModalProps {
    workflow: Workflow;
    credentialId: string;
    instanceUrl: string;
    onClose: () => void;
    onExecute: (workflowId: string, data?: Record<string, unknown>) => Promise<{ success: boolean; executionId?: string; error?: string; data?: unknown }>;
}

export default function ExecuteWorkflowModal({ workflow, credentialId, instanceUrl, onClose, onExecute }: ExecuteWorkflowModalProps) {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [useWebhook, setUseWebhook] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [detectedWebhook, setDetectedWebhook] = useState<WebhookInfo | null>(null);
    const [inputFields, setInputFields] = useState<InputField[]>([]);
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [useJsonMode, setUseJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('{}');
    const [result, setResult] = useState<{ success: boolean; executionId?: string; error?: string; nodeOutputs?: NodeOutput[] } | null>(null);
    const [parseError, setParseError] = useState('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [workflowNodes, setWorkflowNodes] = useState<Array<{ id: string; name: string; type: string }>>([]);

    // Auto-detect webhook and input fields from workflow nodes
    useEffect(() => {
        const detectWorkflowConfig = async () => {
            setIsLoadingDetails(true);
            try {
                const res = await getWorkflow(workflow.id, credentialId);
                if (res.data && res.data.nodes) {
                    const nodes = res.data.nodes as Array<{ id: string; name: string; type: string; parameters?: Record<string, any>; webhookId?: string }>;

                    // Store nodes for output display
                    setWorkflowNodes(nodes.map(n => ({ id: n.id, name: n.name, type: n.type })));

                    // Look for Webhook nodes
                    const webhookNode = nodes.find((node) =>
                        node.type === 'n8n-nodes-base.webhook' ||
                        node.type === '@n8n/n8n-nodes-langchain.webhook' ||
                        node.type.toLowerCase().includes('webhook')
                    );

                    if (webhookNode) {
                        const params = webhookNode.parameters || {};
                        const path = params.path || webhookNode.webhookId || webhookNode.id;
                        const httpMethod = params.httpMethod || 'POST';

                        const cleanInstanceUrl = instanceUrl.replace(/\/$/, '');
                        const webhookPath = path.startsWith('/') ? path.slice(1) : path;
                        const fullUrl = `${cleanInstanceUrl}/webhook/${webhookPath}`;

                        setDetectedWebhook({
                            url: fullUrl,
                            path: webhookPath,
                            httpMethod
                        });
                        setWebhookUrl(fullUrl);
                        setUseWebhook(true);

                        // Try to detect expected input fields from webhook configuration
                        const detectedFields: InputField[] = [];

                        // Check for defined body parameters or schema
                        if (params.options?.rawBody === false || !params.options?.rawBody) {
                            // Webhook expects JSON body, try to infer fields
                            // Look at the next node to see what data it expects
                            // For now, add common fields
                        }

                        // Check for query parameters setup
                        if (params.responseMode === 'onReceived' || params.responseMode === 'lastNode') {
                            // Standard webhook setup
                        }

                        setInputFields(detectedFields);
                    }

                    // Look for Set node or Function node that might define inputs
                    const setNode = nodes.find((node) =>
                        node.type === 'n8n-nodes-base.set' ||
                        node.type === 'n8n-nodes-base.code'
                    );

                    if (setNode && setNode.parameters) {
                        // Try to extract field definitions
                        const fields: InputField[] = [];

                        if (setNode.parameters.values) {
                            const values = setNode.parameters.values as any;
                            if (values.string) {
                                values.string.forEach((v: any) => {
                                    if (v.name && v.name.startsWith('$input.')) {
                                        fields.push({
                                            name: v.name.replace('$input.', ''),
                                            type: 'string',
                                            required: false
                                        });
                                    }
                                });
                            }
                        }

                        if (fields.length > 0) {
                            setInputFields(fields);
                        }
                    }

                    // If no fields detected, add some common ones
                    if (inputFields.length === 0) {
                        // Check if any node references specific input keys
                        const nodeStrings = JSON.stringify(nodes);
                        const commonInputs = ['message', 'query', 'text', 'input', 'data', 'content', 'prompt'];
                        const detectedInputs: InputField[] = [];

                        commonInputs.forEach(inputName => {
                            if (nodeStrings.includes(`"${inputName}"`) || nodeStrings.includes(`$json.${inputName}`)) {
                                detectedInputs.push({
                                    name: inputName,
                                    type: 'string',
                                    required: false,
                                    description: `Input for ${inputName}`
                                });
                            }
                        });

                        if (detectedInputs.length > 0) {
                            setInputFields(detectedInputs);
                        }
                    }
                }
            } catch (error) {
                console.log('Failed to load workflow details');
            }
            setIsLoadingDetails(false);
        };

        detectWorkflowConfig();
    }, [workflow.id, credentialId, instanceUrl]);

    const handleInputChange = (name: string, value: string) => {
        setInputValues(prev => ({ ...prev, [name]: value }));
    };

    const buildInputData = (): Record<string, unknown> => {
        if (useJsonMode) {
            try {
                return JSON.parse(jsonInput);
            } catch {
                return {};
            }
        }

        const data: Record<string, unknown> = {};
        Object.entries(inputValues).forEach(([key, value]) => {
            if (value.trim()) {
                // Try to parse as number or boolean
                if (value === 'true') data[key] = true;
                else if (value === 'false') data[key] = false;
                else if (!isNaN(Number(value)) && value.trim() !== '') data[key] = Number(value);
                else data[key] = value;
            }
        });
        return data;
    };

    const handleExecute = async () => {
        setParseError('');
        setResult(null);

        const data = buildInputData();

        if (useJsonMode) {
            try {
                JSON.parse(jsonInput);
            } catch (e) {
                setParseError('Invalid JSON format');
                return;
            }
        }

        setIsExecuting(true);

        if (useWebhook && webhookUrl) {
            try {
                const response = await fetch(webhookUrl, {
                    method: detectedWebhook?.httpMethod || 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const responseData = await response.json().catch(() => ({}));

                    // Parse node outputs if available
                    const nodeOutputs: NodeOutput[] = [];
                    if (responseData && typeof responseData === 'object') {
                        // If response contains execution data
                        if (responseData.data) {
                            Object.entries(responseData.data).forEach(([key, value]) => {
                                nodeOutputs.push({
                                    nodeName: key,
                                    nodeType: 'output',
                                    data: value
                                });
                            });
                        } else {
                            // The response itself is the output
                            nodeOutputs.push({
                                nodeName: 'Response',
                                nodeType: 'webhook-response',
                                data: responseData
                            });
                        }
                    }

                    setResult({
                        success: true,
                        executionId: responseData.executionId || 'webhook-triggered',
                        nodeOutputs
                    });
                } else {
                    setResult({
                        success: false,
                        error: `Webhook returned status ${response.status}: ${response.statusText}`
                    });
                }
            } catch (error: any) {
                if (error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
                    setResult({
                        success: true,
                        executionId: 'webhook-sent',
                        nodeOutputs: [{
                            nodeName: 'Note',
                            nodeType: 'info',
                            data: 'Webhook was triggered but response could not be read due to CORS. Check n8n for execution details.'
                        }]
                    });
                } else {
                    setResult({
                        success: false,
                        error: error.message || 'Failed to call webhook'
                    });
                }
            }
        } else {
            const execResult = await onExecute(workflow.id, data);
            setResult(execResult);

            if (!execResult.success && execResult.error?.includes('API execution')) {
                setUseWebhook(true);
            }
        }

        setIsExecuting(false);
    };

    const toggleNodeExpand = (nodeName: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeName)) {
                newSet.delete(nodeName);
            } else {
                newSet.add(nodeName);
            }
            return newSet;
        });
    };

    const renderNodeOutput = (output: NodeOutput, index: number) => {
        const isExpanded = expandedNodes.has(output.nodeName);
        const dataString = typeof output.data === 'object' ? JSON.stringify(output.data, null, 2) : String(output.data);

        return (
            <div key={index} className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                    onClick={() => toggleNodeExpand(output.nodeName)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: output.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
                            {output.error ? (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-white">{output.nodeName}</p>
                            <p className="text-xs text-white/40">{output.nodeType}</p>
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">
                                <pre className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-48"
                                    style={{ background: 'rgba(0, 0, 0, 0.3)', color: output.error ? '#f87171' : '#86efac' }}>
                                    {dataString}
                                </pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    style={{
                        background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.98) 0%, rgba(13, 13, 18, 0.98) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: workflow.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
                                <Play className="w-5 h-5" style={{ color: workflow.active ? '#22c55e' : '#666' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{workflow.name}</h3>
                                <p className="text-xs text-white/40">{workflowNodes.length} nodes · {workflow.active ? 'Active' : 'Inactive'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <X className="w-5 h-5 text-white/40" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                        {isLoadingDetails ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
                                <p className="text-sm text-white/40">Analyzing workflow configuration...</p>
                            </div>
                        ) : result ? (
                            <div className="py-4">
                                {result.success ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <motion.div
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                                            >
                                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                                            </motion.div>
                                            <h4 className="text-lg font-semibold text-white mb-1">
                                                {useWebhook ? 'Webhook Triggered!' : 'Workflow Executed!'}
                                            </h4>
                                            <p className="text-sm text-white/50">
                                                {result.executionId && result.executionId !== 'webhook-triggered' && result.executionId !== 'webhook-sent'
                                                    ? `Execution ID: ${result.executionId}`
                                                    : 'Workflow is running'}
                                            </p>
                                        </div>

                                        {/* Node Outputs */}
                                        {result.nodeOutputs && result.nodeOutputs.length > 0 && (
                                            <div className="mt-6">
                                                <h5 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                                                    <Code2 className="w-4 h-4" />
                                                    Response Data
                                                </h5>
                                                <div className="space-y-2">
                                                    {result.nodeOutputs.map((output, index) => renderNodeOutput(output, index))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-center mt-6">
                                            <button
                                                onClick={onClose}
                                                className="px-6 py-2.5 rounded-xl font-medium transition-all"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                        >
                                            <AlertCircle className="w-8 h-8 text-red-400" />
                                        </motion.div>
                                        <h4 className="text-lg font-semibold text-white mb-2">Execution Failed</h4>
                                        <p className="text-sm text-red-400 mb-4">{result.error}</p>

                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setResult(null)}
                                                className="px-6 py-2.5 rounded-xl font-medium transition-all"
                                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}
                                            >
                                                Try Again
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="px-6 py-2.5 rounded-xl font-medium transition-all"
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.7)' }}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Auto-detected Webhook Banner */}
                                {detectedWebhook && (
                                    <div className="mb-5 p-4 rounded-xl"
                                        style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Sparkles className="w-4 h-4 text-green-400" />
                                            <span className="text-sm font-medium text-green-400">Webhook Auto-Detected</span>
                                        </div>
                                        <p className="text-xs text-green-300/70">
                                            {detectedWebhook.httpMethod} {detectedWebhook.path}
                                        </p>
                                    </div>
                                )}

                                {/* Execution Mode Toggle */}
                                <div className="mb-5">
                                    <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                                        <button
                                            onClick={() => setUseWebhook(false)}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${!useWebhook ? 'bg-green-500/20 text-green-400' : 'text-white/40 hover:text-white/60'
                                                }`}
                                        >
                                            <Play className="w-4 h-4" />
                                            API
                                        </button>
                                        <button
                                            onClick={() => setUseWebhook(true)}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${useWebhook ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/60'
                                                }`}
                                        >
                                            <Webhook className="w-4 h-4" />
                                            Webhook
                                            {detectedWebhook && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Webhook URL Input */}
                                {useWebhook && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                                            <Link2 className="w-4 h-4" />
                                            Webhook URL
                                            {detectedWebhook && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400">
                                                    Auto
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="url"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            placeholder="https://your-n8n.app.n8n.cloud/webhook/..."
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
                                        />
                                    </div>
                                )}

                                {/* Input Mode Toggle */}
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-white/70">Input Data</label>
                                    <button
                                        onClick={() => setUseJsonMode(!useJsonMode)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                        style={{ background: useJsonMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: useJsonMode ? '#a78bfa' : 'rgba(255, 255, 255, 0.5)' }}
                                    >
                                        <Code2 className="w-3.5 h-3.5" />
                                        {useJsonMode ? 'JSON Mode' : 'Switch to JSON'}
                                    </button>
                                </div>

                                {useJsonMode ? (
                                    /* JSON Input Mode */
                                    <div className="mb-4">
                                        <textarea
                                            value={jsonInput}
                                            onChange={(e) => setJsonInput(e.target.value)}
                                            placeholder='{"key": "value"}'
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors font-mono text-sm resize-none"
                                        />
                                        {parseError && <p className="mt-2 text-sm text-red-400">{parseError}</p>}
                                    </div>
                                ) : (
                                    /* Dynamic Input Fields */
                                    <div className="space-y-4 mb-4">
                                        {inputFields.length > 0 ? (
                                            inputFields.map((field) => (
                                                <div key={field.name}>
                                                    <label className="block text-sm font-medium text-white/60 mb-2 capitalize">
                                                        {field.name.replace(/_/g, ' ')}
                                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                                    </label>
                                                    {field.type === 'boolean' ? (
                                                        <select
                                                            value={inputValues[field.name] || ''}
                                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-green-500/50 transition-colors"
                                                        >
                                                            <option value="" className="bg-[#0a0a0f]">Select...</option>
                                                            <option value="true" className="bg-[#0a0a0f]">True</option>
                                                            <option value="false" className="bg-[#0a0a0f]">False</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type === 'number' ? 'number' : 'text'}
                                                            value={inputValues[field.name] || ''}
                                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                            placeholder={field.description || `Enter ${field.name}...`}
                                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                                                        />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            /* Default single input field */
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-white/60 mb-2">
                                                        Message / Input
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={inputValues['message'] || ''}
                                                        onChange={(e) => handleInputChange('message', e.target.value)}
                                                        placeholder="Enter your message or input..."
                                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
                                                    />
                                                </div>
                                                <p className="text-xs text-white/30">
                                                    💡 Tip: Switch to JSON mode for complex inputs
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {!workflow.active && (
                                    <div className="mb-4 p-4 rounded-xl flex items-start gap-3"
                                        style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.15)' }}>
                                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-yellow-400">Workflow is inactive</p>
                                            <p className="text-xs text-yellow-400/60">Activate in n8n to enable triggers</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!result && !isLoadingDetails && (
                        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-6 rounded-xl font-medium transition-colors"
                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.6)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecute}
                                disabled={isExecuting || (useWebhook && !webhookUrl)}
                                className="flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                style={{
                                    background: useWebhook
                                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    boxShadow: useWebhook
                                        ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                                        : '0 4px 20px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                {isExecuting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        {useWebhook ? <Webhook className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        {useWebhook ? 'Trigger' : 'Execute'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
