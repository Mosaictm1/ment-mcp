'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { addN8nCredential, verifyN8nCredential, getN8nCredentials } from '@/lib/api';

export default function OnboardingPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [checkingCredentials, setCheckingCredentials] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        // Check if user already has n8n credentials
        if (isAuthenticated) {
            getN8nCredentials().then((res) => {
                if (res.data && res.data.credentials.length > 0) {
                    // User already has credentials, redirect to workflows
                    router.push('/dashboard/workflows');
                } else {
                    setCheckingCredentials(false);
                }
            }).catch(() => {
                setCheckingCredentials(false);
            });
        }
    }, [isLoading, isAuthenticated, router]);

    const handleAddInstance = async (instanceUrl: string, apiKey: string, name?: string) => {
        const result = await addN8nCredential(instanceUrl, apiKey, name);
        if (result.error) {
            return { success: false, error: result.error.message };
        }

        // Auto-verify the new credential
        if (result.data) {
            const verifyResult = await verifyN8nCredential(result.data.id);
            if (!verifyResult.data?.verified) {
                return { success: false, error: 'Could not verify connection to n8n instance. Please check your credentials.' };
            }
        }

        return { success: true };
    };

    const handleVerify = async (credentialId: string) => {
        const result = await verifyN8nCredential(credentialId);
        return { verified: result.data?.verified || false };
    };

    const handleComplete = () => {
        router.push('/dashboard/workflows');
    };

    if (isLoading || checkingCredentials) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }} />
                    <span className="text-white/40 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <OnboardingWizard
            onComplete={handleComplete}
            onAddInstance={handleAddInstance}
            onVerify={handleVerify}
        />
    );
}
