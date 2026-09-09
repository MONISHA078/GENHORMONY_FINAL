import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0A0F]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If no user or token exists, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If page requires Admin role, but user is not Admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
