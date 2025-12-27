'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
}

interface ChatInterfaceProps {
    conversationId: string;
    anthropicApiKey: string;
    onPlanGenerated: (plan: any) => void;
}

export default function ChatInterface({
    conversationId,
    anthropicApiKey,
    onPlanGenerated,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversation history
    useEffect(() => {
        loadConversation();
    }, [conversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversation = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/ai/conversations/${conversationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMessages(data.conversation.messages || []);
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setLoading(true);

        // Optimistically add user message
        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMessage]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/ai/conversations/${conversationId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: userMessage,
                        anthropicApiKey,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Add AI response
                const aiMessage: Message = {
                    id: data.messageId,
                    role: 'assistant',
                    content: data.content,
                    createdAt: new Date().toISOString(),
                };

                setMessages((prev) => [
                    ...prev.filter((m) => m.id !== tempMessage.id),
                    { ...tempMessage, id: data.messageId || tempMessage.id },
                    aiMessage,
                ]);

                // Handle plan generation
                if (data.plan) {
                    onPlanGenerated(data.plan);
                }
            } else {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to send message');
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert(`Error: ${error.message}`);
            // Remove temp message on error
            setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="glass-card flex flex-col h-[700px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                        <p className="text-lg">Start chatting with your AI assistant!</p>
                        <p className="text-sm mt-2">Describe what you want to build or fix</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : message.role === 'system'
                                        ? 'bg-yellow-900/30 border border-yellow-700 text-yellow-200'
                                        : 'bg-gray-800 text-gray-100'
                                }`}
                        >
                            {message.role === 'assistant' ? (
                                <div className="prose prose-invert max-w-none">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            )}

                            <p className="text-xs opacity-70 mt-2">
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                            <span className="text-gray-300">AI is thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-4">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Describe what you want to build or fix..."
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                        rows={2}
                        disabled={loading}
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
