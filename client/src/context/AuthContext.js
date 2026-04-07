import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('slgs_user');
        if (saved) {
            try { setUser(JSON.parse(saved)); } catch {}
        }
    }, []);

    const login = (username, password, role) => {
        const found = USERS.find(
            u => u.username === username.trim() &&
                 u.password === password &&
                 u.role === role
        );
        if (found) {
            const { password: _pw, ...safe } = found;
            setUser(safe);
            localStorage.setItem('slgs_user', JSON.stringify(safe));
            return { ok: true, user: safe };
        }
        return { ok: false, error: 'Invalid credentials. Please try again.' };
    };

    const signup = (data) => {
        // In a real app this would call an API. For the demo we just log in the new user.
        const newUser = {
            id: Date.now(),
            role: 'student',
            username: data.username,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            studentId: `SLGS-${Date.now().toString().slice(-6)}`,
            form: data.form || 'JSS 1',
            house: 'Johnson',
            photo: null,
        };
        setUser(newUser);
        localStorage.setItem('slgs_user', JSON.stringify(newUser));
        return { ok: true, user: newUser };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('slgs_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
