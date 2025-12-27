'use client';

import { useState } from 'react';
import { Check, X, Loader2, Play, AlertCircle, FileCode } from 'lucide-react';
import WorkflowDiffViewer from './WorkflowDiffViewer';

interface PlanApprovalProps {
    plan: any;
    onApprove: () => void;
    onReject: () => void;
}

export default function PlanApproval({ plan, onApprove, onReject }: PlanApprovalProps) {
    const [testing, setTesting] = useState(false);
    const [applying, setApplying] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const testPlan = async () => {
        setTesting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/ai/plans/${plan.id}/test`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                }
            );

            if (response.ok) {
                const results = await response.json();
                setTestResults(results);
            } else {
                const error = await response.json();
                throw new Error(error.error?.message || 'Test failed');
            }
        } catch (error: any) {
            alert(`Test error: ${error.message}`);
        } finally {
            setTesting(false);
        }
    };

    const approvePlan = async () => {
        setApplying(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/ai/plans/${plan.id}/approve`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                alert('✅ Plan applied successfully!');
                onApprove();
            } else {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to apply plan');
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setApplying(false);
        }
    };

    const rejectPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/ai/plans/${plan.id}/reject`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ reason: rejectReason }),
                }
            );

            if (response.ok) {
                onReject();
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const planData = plan.planData || {};

    return (
        <div className="space-y-6">
            {/* Plan Header */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileCode className="w-6 h-6 text-purple-500" />
                            Workflow Plan Generated
                        </h2>
                        <p className="text-gray-300 mt-2">{planData.description}</p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-200 font-medium">Pending Approval</span>
                    </div>
                </div>

                {/* Node Summary */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm">Nodes to Add/Modify</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {planData.nodes?.length || 0}
                        </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm">Status</p>
                        <p className="text-2xl font-bold text-purple-400 mt-1 capitalize">
                            {plan.status}
                        </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm">Test Status</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {testResults
                                ? testResults.success
                                    ? '✅ Passed'
                                    : '❌ Failed'
                                : 'Not Tested'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Workflow Diff Viewer */}
            <WorkflowDiffViewer
                original={plan.originalWorkflow}
                modified={plan.modifiedWorkflow}
            />

            {/* Test Results */}
            {testResults && (
                <div className={`glass-card p-6 border-2 ${testResults.success ? 'border-green-500' : 'border-red-500'
                    }`}>
                    <h3 className="text-xl font-bold text-white mb-4">
                        {testResults.success ? '✅ Test Passed' : '❌ Test Failed'}
                    </h3>

                    {testResults.error && (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-200">
                            <pre className="whitespace-pre-wrap text-sm">{testResults.error}</pre>
                        </div>
                    )}

                    {testResults.data && (
                        <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
                            <pre className="text-sm text-gray-300">
                                {JSON.stringify(testResults.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-4">
                    {/* Test Button */}
                    <button
                        onClick={testPlan}
                        disabled={testing}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {testing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Test Plan
                            </>
                        )}
                    </button>

                    {/* Approve Button */}
                    <button
                        onClick={approvePlan}
                        disabled={applying}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {applying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Approve & Apply
                            </>
                        )}
                    </button>

                    {/* Reject Button */}
                    <button
                        onClick={() => setShowRejectDialog(true)}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Reject
                    </button>
                </div>

                {/* Warning */}
                <div className="mt-4 flex items-start gap-2 text-yellow-200 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                        <strong>Important:</strong> Approving this plan will modify your n8n workflow.
                        A backup version will be created automatically, but please review carefully before applying.
                    </p>
                </div>
            </div>

            {/* Reject Dialog */}
            {showRejectDialog && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="glass-card p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Reject Plan</h3>

                        <p className="text-gray-300 mb-4">
                            Why are you rejecting this plan? (Optional)
                        </p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-purple-500"
                            rows={4}
                            placeholder="e.g., Missing error handling, wrong API endpoint..."
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    rejectPlan();
                                    setShowRejectDialog(false);
                                }}
                                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Confirm Reject
                            </button>

                            <button
                                onClick={() => setShowRejectDialog(false)}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
