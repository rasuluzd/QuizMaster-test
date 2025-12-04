import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();

    // If user is authenticated, render child routes (Outlet)
    // If not, redirect to Login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;