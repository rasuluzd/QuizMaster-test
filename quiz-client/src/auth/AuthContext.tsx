import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import type { ReactNode } from 'react';
import type { User } from '../types/user';
import type { LoginDto } from '../types/auth'; 

import * as AuthService from './AuthService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean; // 1. Add isLoading to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    
    // 2. Initialize loading to TRUE so we wait before rendering
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeAuth = () => {
            if (token) {
                try {
                    const decoded: User = jwtDecode(token);
                    // Check if token is expired
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setUser(decoded);
                    }
                } catch {
                    logout();
                }
            }
            // 3. Once check is done, stop loading
            setIsLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (credentials: LoginDto) => {
        try {
            const response = await AuthService.login(credentials);
            const newToken = response.token;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            
            const decoded: User = jwtDecode(newToken);
            setUser(decoded);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // 4. Show a loading screen (or blank) while checking token
    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};