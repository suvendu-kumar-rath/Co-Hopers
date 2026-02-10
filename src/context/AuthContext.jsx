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
                // Try sessionStorage first, then localStorage as fallback
                let token = sessionStorage.getItem('authToken');
                let userData = sessionStorage.getItem('userData');
                
                // If not in sessionStorage, check localStorage
                if (!token) {
                    token = localStorage.getItem('authToken');
                    userData = localStorage.getItem('userData');
                    
                    // If found in localStorage, restore to sessionStorage
                    if (token && userData) {
                        sessionStorage.setItem('authToken', token);
                        sessionStorage.setItem('userData', userData);
                    }
                }
                
                if (token && userData) {
                    const parsedUser = JSON.parse(userData);
                    console.log('[AuthContext] Restored user session:', parsedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } else {
                    console.log('[AuthContext] No valid session found');
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
            console.log('[AuthContext] Logging in user:', userData);
            
            // Store user data and token in both sessionStorage and localStorage
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    // Logout function
    const logout = () => {
        try {
            console.log('[AuthContext] Logging out user');
            
            // Clear stored data from both sessionStorage and localStorage
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
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

    // Update user data
    const updateUser = (userData) => {
        try {
            console.log('[AuthContext] Updating user data:', userData);
            
            // Update user data in storage
            sessionStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setUser(userData);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        getToken,
        updateUser
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
