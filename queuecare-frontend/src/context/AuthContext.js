import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
const decodeJwtPayload = (token) => {
    if (!token)
        return null;
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64)
            .split('')
            .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join(''));
        return JSON.parse(json);
    }
    catch (error) {
        console.warn('Unable to parse JWT payload:', error);
        return null;
    }
};
const isJwtExpired = (token) => {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number')
        return false;
    return Date.now() >= payload.exp * 1000;
};
/**
 * Create Auth Context
 */
export const AuthContext = createContext(undefined);
/**
 * Auth Context Provider Component
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    /**
     * Initialize auth state from localStorage on mount
     */
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');
                if (storedToken && storedUser) {
                    if (isJwtExpired(storedToken)) {
                        console.warn('Stored auth token has expired. Clearing local storage.');
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('auth_user');
                        setToken(null);
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                    else {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            setToken(storedToken);
                            setUser(parsedUser);
                            setIsAuthenticated(true);
                        }
                        catch (parseErr) {
                            // Invalid JSON in localStorage
                            console.error('Error parsing stored user:', parseErr);
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('auth_user');
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error initializing auth:', err);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
            finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, []);
    /**
     * Login handler
     */
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                let errorMessage = 'Login failed. Please try again.';
                try {
                    const errData = await response.json();
                    errorMessage = errData.message || errorMessage;
                }
                catch {
                    // Response body is not valid JSON
                    errorMessage = `Login failed (${response.status}). Please try again.`;
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
        }
        catch (err) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            console.error('Login error:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    /**
     * Register handler
     */
    const register = useCallback(async (email, password, firstName, lastName, role, phone) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName, role, phone }),
            });
            if (!response.ok) {
                let errorMessage = 'Registration failed. Please try again.';
                try {
                    const errData = await response.json();
                    errorMessage = errData.message || errorMessage;
                }
                catch {
                    // Response body is not valid JSON
                    errorMessage = `Registration failed (${response.status}). Please try again.`;
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
        }
        catch (err) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            console.error('Register error:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    /**
     * Logout handler
     */
    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setError(null);
        try {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
        }
        catch (err) {
            console.error('Logout endpoint error:', err);
        }
    }, [token]);
    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    /**
     * Context value
     */
    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
        setToken,
        setLoading,
        setError,
        clearError,
        isAuthenticated,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
/**
 * useAuth — Custom hook to consume Auth Context
 * Must be used inside <AuthProvider>
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export default AuthContext;
