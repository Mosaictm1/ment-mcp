'use client';

import { useMemo } from 'react';
import { Plus, Minus, Edit } from 'lucide-react';

interface WorkflowDiffViewerProps {
    original: any;
    modified: any;
}

export default function WorkflowDiffViewer({ original, modified }: WorkflowDiffViewerProps) {
    const diff = useMemo(() => {
        if (!original || !modified) return { added: [], removed: [], modified: [] };

        const originalNodes = original.nodes || [];
        const modifiedNodes = modified.nodes || [];

        const originalNodeIds = new Set(originalNodes.map((n: any) => n.id));
        const modifiedNodeIds = new Set(modifiedNodes.map((n: any) => n.id));

        const added = modifiedNodes.filter((n: any) => !originalNodeIds.has(n.id));
        const removed = originalNodes.filter((n: any) => !modifiedNodeIds.has(n.id));
        const modifiedList: any[] = [];

        modifiedNodes.forEach((modNode: any) => {
            const origNode = originalNodes.find((n: any) => n.id === modNode.id);
            if (origNode && JSON.stringify(origNode) !== JSON.stringify(modNode)) {
                modifiedList.push({ original: origNode, modified: modNode });
            }
        });

        return { added, removed, modified: modifiedList };
    }, [original, modified]);

    if (!original && !modified) {
        return (
            <div className="glass-card p-6">
                <p className="text-gray-400">No workflow data available</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Workflow Changes</h3>

            <div className="space-y-4">
                {/* Added Nodes */}
                {diff.added.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                        <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Added Nodes ({diff.added.length})
                        </h4>

                        <div className="space-y-3">
                            {diff.added.map((node: any) => (
                                <div
                                    key={node.id}
                                    className="bg-gray-800/50 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-white font-medium">{node.name}</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Type: {node.type}
                                            </p>
                                        </div>

                                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                            NEW
                                        </span>
                                    </div>

                                    {node.parameters && (
                                        <details className="mt-3">
                                            <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                                                View Configuration
                                            </summary>

                                            <pre className="mt-2 text-xs bg-gray-900 p-3 rounded overflow-x-auto text-gray-300">
                                                {JSON.stringify(node.parameters, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modified Nodes */}
                {diff.modified.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                        <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Modified Nodes ({diff.modified.length})
                        </h4>

                        <div className="space-y-3">
                            {diff.modified.map((item: any, index: number) => (
                                <div
                                    key={item.modified.id || index}
                                    className="bg-gray-800/50 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-white font-medium">
                                                {item.modified.name}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Type: {item.modified.type}
                                            </p>
                                        </div>

                                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                                            MODIFIED
                                        </span>
                                    </div>

                                    <details className="mt-3">
                                        <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                                            View Before/After Comparison
                                        </summary>

                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-2">Before:</p>
                                                <pre className="text-xs bg-red-900/20 border border-red-700 p-3 rounded overflow-x-auto text-gray-300">
                                                    {JSON.stringify(item.original.parameters, null, 2)}
                                                </pre>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 mb-2">After:</p>
                                                <pre className="text-xs bg-green-900/20 border border-green-700 p-3 rounded overflow-x-auto text-gray-300">
                                                    {JSON.stringify(item.modified.parameters, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Removed Nodes */}
                {diff.removed.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                        <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                            <Minus className="w-5 h-5" />
                            Removed Nodes ({diff.removed.length})
                        </h4>

                        <div className="space-y-3">
                            {diff.removed.map((node: any) => (
                                <div
                                    key={node.id}
                                    className="bg-gray-800/50 rounded-lg p-4 opacity-75"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-white font-medium line-through">
                                                {node.name}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Type: {node.type}
                                            </p>
                                        </div>

                                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                                            REMOVED
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Changes */}
                {diff.added.length === 0 && diff.modified.length === 0 && diff.removed.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        <p>No changes detected</p>
                    </div>
                )}
            </div>
        </div>
    );
}
