'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ai/ChatInterface';
import PlanApproval from '@/components/ai/Plan Approval';
import ApiKeyInput from '@/components/ai/ApiKeyInput';

interface N8nInstance {
    id: string;
    name: string;
    instanceUrl: string;
}

interface Workflow {
    id: string;
    name: string;
    active: boolean;
}

export default function AIWorkflowsPage() {
    const router = useRouter();
    const [instances, setInstances] = useState<N8nInstance[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<string>('');
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [anthropicApiKey, setAnthropicApiKey] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [pendingPlan, setPendingPlan] = useState<any>(null);

    // Load instances on mount
    useEffect(() => {
        fetchInstances();
    }, []);

    // Load workflows when instance selected
    useEffect(() => {
        if (selectedInstance) {
            fetchWorkflows(selectedInstance);
        }
    }, [selectedInstance]);

    const fetchInstances = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/n8n/instances`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInstances(data.instances || []);
                if (data.instances?.length > 0) {
                    setSelectedInstance(data.instances[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch instances:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkflows = async (instanceId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/mcp/tool`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tool: 'get_workflows',
                        credentialId: instanceId,
                        params: {},
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setWorkflows(data.result?.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch workflows:', error);
        }
    };

    const startConversation = async () => {
        if (!selectedInstance || !anthropicApiKey) {
            alert('Please select an instance and provide your Anthropic API key');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/ai/conversations`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        instanceId: selectedInstance,
                        workflowId: selectedWorkflow || undefined,
                        title: selectedWorkflow
                            ? `Improve "${workflows.find(w => w.id === selectedWorkflow)?.name}"`
                            : 'New Workflow Assistant',
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setConversationId(data.conversation.id);
            }
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🤖 AI Workflow Assistant
                    </h1>
                    <p className="text-gray-300">
                        Build and fix workflows with AI-powered assistance
                    </p>
                </div>

                {/* Configuration Panel */}
                {!conversationId && (
                    <div className="glass-card p-6 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Get Started</h2>

                        {/* Instance Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select n8n Instance
                            </label>
                            <select
                                value={selectedInstance}
                                onChange={(e) => setSelectedInstance(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="">Choose an instance...</option>
                                {instances.map((instance) => (
                                    <option key={instance.id} value={instance.id}>
                                        {instance.name} ({instance.instanceUrl})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Workflow Selection (Optional) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select Workflow (Optional)
                            </label>
                            <select
                                value={selectedWorkflow}
                                onChange={(e) => setSelectedWorkflow(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                                disabled={!selectedInstance}
                            >
                                <option value="">Create new workflow...</option>
                                {workflows.map((workflow) => (
                                    <option key={workflow.id} value={workflow.id}>
                                        {workflow.name} {workflow.active ? '(Active)' : '(Inactive)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* API Key Input */}
                        <ApiKeyInput value={anthropicApiKey} onChange={setAnthropicApiKey} />

                        {/* Start Button */}
                        <button
                            onClick={startConversation}
                            disabled={!selectedInstance || !anthropicApiKey}
                            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            Start AI Assistant
                        </button>
                    </div>
                )}

                {/* Chat Interface */}
                {conversationId && !pendingPlan && (
                    <ChatInterface
                        conversationId={conversationId}
                        anthropicApiKey={anthropicApiKey}
                        onPlanGenerated={setPendingPlan}
                    />
                )}

                {/* Plan Approval */}
                {pendingPlan && (
                    <PlanApproval
                        plan={pendingPlan}
                        onApprove={() => {
                            setPendingPlan(null);
                        }}
                        onReject={() => {
                            setPendingPlan(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
