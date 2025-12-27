'use client';

import { useState } from 'react';
import { Eye, EyeOff, Key, Check, X } from 'lucide-react';

interface ApiKeyInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
    const [showKey, setShowKey] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    const validateKey = (key: string) => {
        // Basic validation: Anthropic keys start with 'sk-ant-'
        const isValidFormat = key.startsWith('sk-ant-') && key.length > 20;
        setIsValid(isValidFormat);
        return isValidFormat;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        if (newValue) {
            validateKey(newValue);
        } else {
            setIsValid(null);
        }
    };

    const handleClear = () => {
        onChange('');
        setIsValid(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
                <Key className="inline w-4 h-4 mr-2" />
                Anthropic API Key
            </label>

            <div className="relative">
                <input
                    type={showKey ? 'text' : 'password'}
                    value={value}
                    onChange={handleChange}
                    placeholder="sk-ant-..."
                    className={`w-full px-4 py-3 pr-24 bg-gray-800 border rounded-lg text-white focus:outline-none transition-colors ${isValid === true
                            ? 'border-green-500 focus:border-green-400'
                            : isValid === false
                                ? 'border-red-500 focus:border-red-400'
                                : 'border-gray-700 focus:border-purple-500'
                        }`}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Validation Icon */}
                    {isValid === true && (
                        <Check className="w-5 h-5 text-green-500" />
                    )}
                    {isValid === false && (
                        <X className="w-5 h-5 text-red-500" />
                    )}

                    {/* Show/Hide Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {showKey ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>

                    {/* Clear Button */}
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-400">
                <p className="flex items-start gap-2">
                    <span className="mt-1">ℹ</span>
                    <span>
                        Your API key is stored only in your browser session and is never saved to our database.
                        Get your key from{' '}
                        <a
                            href="https://console.anthropic.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 underline"
                        >
                            Anthropic Console
                        </a>
                    </span>
                </p>
            </div>

            {isValid === false && (
                <div className="text-sm text-red-400 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Invalid API key format. Keys should start with "sk-ant-"
                </div>
            )}
        </div>
    );
}
