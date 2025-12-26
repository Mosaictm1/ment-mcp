'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, setAccessToken, getAccessToken, logout as apiLogout } from './api';

interface User {
    id: string;
    email: string;
    name: string | null;
    subscriptionTier: 'free' | 'supporter' | 'enterprise';
    apiCallsToday: number;
    apiCallsLimit: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        const result = await getProfile();
        if (result.data) {
            setUser(result.data);
        } else {
            setUser(null);
            setAccessToken(null);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (accessToken: string, refreshToken: string) => {
        setAccessToken(accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        await refreshUser();
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
