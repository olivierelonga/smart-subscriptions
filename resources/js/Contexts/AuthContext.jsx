import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app load
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const response = await api.get('/user');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('auth_token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        // Get CSRF cookie first
        await api.get('/sanctum/csrf-cookie');
        
        const response = await api.post('/login', { email, password });
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const register = async (name, email, password, password_confirmation) => {
        await api.get('/sanctum/csrf-cookie');
        
        const response = await api.post('/register', {
            name,
            email,
            password,
            password_confirmation,
        });
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('auth_token');
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};