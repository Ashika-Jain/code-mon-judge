import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      try {
        // Log all authentication-related data
        console.log('=== ProtectedRoute: Authentication Check ===');
        console.log('1. Checking localStorage:');
        console.log('- JWT Token:', localStorage.getItem('jwt'));
        console.log('- User Data:', localStorage.getItem('user'));
        console.log('- All localStorage items:', { ...localStorage });
        
        console.log('\n2. Checking Cookies:');
        console.log('- All cookies:', document.cookie);
        
      const token = localStorage.getItem('jwt');
      if (!token) {
          console.log('\n3. No token found in localStorage');
          if (isMounted) {
            setAuthState({
              isAuthenticated: false,
              isLoading: false
            });
          }
        return;
      }

        console.log('\n3. Token found, verifying with backend');
        console.log('- Making request to:', `${API_BASE_URL}/api/auth/verify`);
        console.log('- Request headers:', {
          'Authorization': `Bearer ${token}`
        });

        const response = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('\n4. Verification response:');
        console.log('- Status:', response.status);
        console.log('- Data:', response.data);
        console.log('- Headers:', response.headers);

        if (isMounted) {
        if (response.data.valid) {
            console.log('\n5. Token is valid, allowing access');
            setAuthState({
              isAuthenticated: true,
              isLoading: false
            });
        } else {
            console.log('\n5. Token is invalid, clearing auth data');
            setAuthState({
              isAuthenticated: false,
              isLoading: false
            });
            // Clear auth data
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
            document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            console.log('\n6. Auth data cleared:');
            console.log('- localStorage after clearing:', { ...localStorage });
            console.log('- cookies after clearing:', document.cookie);
          }
        }
      } catch (error) {
        console.error('\n=== ProtectedRoute: Error during verification ===');
        console.error('- Error:', error);
        console.error('- Status:', error.response?.status);
        console.error('- Data:', error.response?.data);
        console.error('- Headers:', error.response?.headers);
        
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false
          });
          // Clear auth data
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
          document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          console.log('\nAuth data cleared after error:');
          console.log('- localStorage after error:', { ...localStorage });
          console.log('- cookies after error:', document.cookie);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    console.log('\n=== ProtectedRoute: Still checking authentication ===');
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    console.log('\n=== ProtectedRoute: Not authenticated, redirecting to login ===');
    return <Navigate to="/login" replace />;
  }

  // Render children only if authenticated
  console.log('\n=== ProtectedRoute: Authenticated, rendering protected content ===');
  return children;
};

export default ProtectedRoute; 