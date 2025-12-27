'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ai/ChatInterface';
import PlanApproval from '@/components/ai/PlanApproval';
import Sidebar from '@/components/layout/Sidebar';

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
        if (!selectedInstance) {
            alert('Please select an n8n instance');
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
            <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 100%)' }}>
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)' }}>
            <Sidebar />
            <main className="flex-1 overflow-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
                        <span className="text-3xl">✨</span>
                        AI Workflow Assistant
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        Build and fix n8n workflows with AI-powered assistance
                    </p>
                </div>

                {/* Configuration Panel */}
                {!conversationId && (
                    <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <h2 className="text-lg font-medium text-white mb-6">Get Started</h2>

                        {/* Instance Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Select n8n Instance
                            </label>
                            <select
                                value={selectedInstance}
                                onChange={(e) => setSelectedInstance(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-white focus:outline-none focus:border-green-500/50 transition-colors"
                            >
                                <option value="" className="bg-[#0a0a0f]">Choose an instance...</option>
                                {instances.map((instance) => (
                                    <option key={instance.id} value={instance.id} className="bg-[#0a0a0f]">
                                        {instance.name} ({instance.instanceUrl})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Workflow Selection (Optional) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Select Workflow (Optional)
                            </label>
                            <select
                                value={selectedWorkflow}
                                onChange={(e) => setSelectedWorkflow(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-white focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50"
                                disabled={!selectedInstance}
                            >
                                <option value="" className="bg-[#0a0a0f]">Create new workflow...</option>
                                {workflows.map((workflow) => (
                                    <option key={workflow.id} value={workflow.id} className="bg-[#0a0a0f]">
                                        {workflow.name} {workflow.active ? '(Active)' : '(Inactive)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* AI Badge */}
                        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                                    <span className="text-lg">🤖</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Powered by Claude AI</p>
                                    <p className="text-xs text-white/40">AI usage included in your subscription plan</p>
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startConversation}
                            disabled={!selectedInstance}
                            className="w-full px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)'
                            }}
                        >
                            Start AI Assistant
                        </button>
                    </div>
                )}

                {/* Chat Interface */}
                {conversationId && !pendingPlan && (
                    <ChatInterface
                        conversationId={conversationId}
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
            </main>
        </div>
    );
}
