import { createContext, useEffect, useState } from 'react';
import { getUserFromToken } from '../services/userService';
import { login, register as registerUser } from '../services/authService';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const fetchUser = async () => {
        if (localStorage.getItem('access_token')) {
            try {
                const response = await getUserFromToken();
                if (response.status === 200) {
                    setUser(response.data.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        setLoading(false);
    };

    const handleLogin = async (data) => {
        try {
            const response = await login(data.email, data.password);

            if (response && response.status === 200) {
                localStorage.setItem('access_token', response.data.data.access_token);
                setUser(response.data.data.user);
            }
        } catch (e) {
            return e.status;
        }
    };

    const handleRegister = async (data) => {
        try {
            const response = await registerUser(data.email, data.fullname, data.password);
            if (response && response.status === 201) {
                return response.status;
            }
        } catch (e) {
            return e.response.data.errors;
        }
    };

    const logout = async () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };
    useEffect(() => {
        fetchUser();
    }, []);
    return (
        <AuthContext.Provider value={{ user, loading, setUser, fetchUser, logout, handleLogin, handleRegister }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
