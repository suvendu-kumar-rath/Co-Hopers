import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in when the app loads
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const token = sessionStorage.getItem('authToken');
                const userData = sessionStorage.getItem('userData');
                
                if (token && userData) {
                    setUser(JSON.parse(userData));
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Login function
    const login = (userData, token) => {
        try {
            // Store user data and token
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    // Logout function
    const logout = () => {
        try {
            // Clear stored data
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
            
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Get auth token
    const getToken = () => {
        return sessionStorage.getItem('authToken');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        getToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
