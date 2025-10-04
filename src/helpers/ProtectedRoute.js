// src/helpers/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../services/auth.service';

// allowedRoles is an array like ['ROLE_ADMIN', 'ROLE_FACULTY']
const ProtectedRoute = ({ allowedRoles }) => {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Check if user has one of the allowed roles
  const hasRequiredRole = currentUser.roles.some(role => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    // Logged in but wrong role, redirect to home/dashboard or an unauthorized page
    // Redirecting to home is simpler for now
    console.warn(`User ${currentUser.username} does not have required roles: ${allowedRoles}`);
    return <Navigate to="/" replace />;
    // Or: return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized, render the child route content
  return <Outlet />;
};

export default ProtectedRoute;