import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize Axios defaults
    // Use environment variable for API URL (set VITE_API_URL in .env)
    // Safely append /api if not present in the user-provided URL
    const envUrl = import.meta.env.VITE_API_URL;
    const baseURL = envUrl
        ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
        : 'http://localhost:5001/api';

    axios.defaults.baseURL = baseURL;

    useEffect(() => {
        const checkLoggedIn = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                    // Set default header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                } catch (error) {
                    console.error("Failed to parse user info:", error);
                    localStorage.removeItem('userInfo');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password, role, providerProfile) => {
        try {
            const { data } = await axios.post('/auth/register', { name, email, password, role, providerProfile });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];
        // Optional: redirect to home usually handled by component logic, 
        // but typically logout just clears state and the UI reacts.
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
