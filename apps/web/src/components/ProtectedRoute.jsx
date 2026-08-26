import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
    const { isAuthed, loading } = useAuth();

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading…</div>;
    }

    if (!isAuthed) return <Navigate to={redirectTo} replace />;

    return children;
};

export default ProtectedRoute;
export { ProtectedRoute };
