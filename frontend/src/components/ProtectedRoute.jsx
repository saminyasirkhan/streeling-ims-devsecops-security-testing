
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user) {
        // Not logged in
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but not authorized for this specific role
        // For now, redirect to login, but could redirect to a 'Forbidden' page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
