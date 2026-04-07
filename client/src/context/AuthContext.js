import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS, ADMITTED_STUDENTS } from '../data/mockData';

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

    // Verify a school-issued Admission ID before allowing signup
    const verifyAdmissionId = (admissionId) => {
        const record = ADMITTED_STUDENTS.find(
            s => s.admissionId === admissionId.trim().toUpperCase()
        );
        if (!record) return { ok: false, error: 'Admission ID not found. Please contact the Admissions Office.' };
        if (record.registered) return { ok: false, error: 'An account already exists for this Admission ID. Please log in.' };
        return { ok: true, record };
    };

    const signup = (data, admissionRecord) => {
        const newUser = {
            id: Date.now(),
            role: 'student',
            username: data.username,
            name: admissionRecord.name,
            email: data.email,
            studentId: `SLGS-${Date.now().toString().slice(-6)}`,
            form: admissionRecord.form,
            house: 'Johnson',
            dob: admissionRecord.dob,
            guardian: admissionRecord.guardian,
            photo: null,
        };
        // Mark the admission record as registered (mutates in-memory list)
        admissionRecord.registered = true;
        admissionRecord.studentId  = newUser.studentId;
        setUser(newUser);
        localStorage.setItem('slgs_user', JSON.stringify(newUser));
        return { ok: true, user: newUser };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('slgs_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, verifyAdmissionId }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
