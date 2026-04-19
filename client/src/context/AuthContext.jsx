import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');

            if (accessToken) {
                try {
                    // Try to get user info
                    const { data } = await api.get('/me');
                    setUser(data.data.user);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token invalid or expired
                    localStorage.removeItem('accessToken');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const register = async (username, email, password) => {
        try {
            const { data } = await api.post('/auth/register', {
                username,
                email,
                password
            });

            localStorage.setItem('accessToken', data.data.accessToken);
            setUser(data.data.user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', {
                email,
                password
            });

            localStorage.setItem('accessToken', data.data.accessToken);
            setUser(data.data.user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
