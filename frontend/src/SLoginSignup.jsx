import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from './utils/axiosConfig';
import './LoginSignup.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const SLoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Login Component: Current location state:', location.state);
  console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('=== Login Process Start ===');
      console.log('1. Current location state:', location.state);
      console.log('2. API URL:', `${API_BASE_URL}/api/auth/login`);
      console.log('3. Request payload:', { email, password: '***' });

      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('4. Login Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (response.data.token) {
        console.log('5. Token received, storing auth data');
        
        // Store token in localStorage
        localStorage.setItem('jwt', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('6. Stored in localStorage:', {
          jwt: localStorage.getItem('jwt') ? 'Present' : 'Not present',
          user: localStorage.getItem('user') ? 'Present' : 'Not present'
        });

        // Set cookie for cross-domain requests
        document.cookie = `jwt=${response.data.token}; path=/; max-age=86400; SameSite=Strict`;
        console.log('7. Current cookies:', document.cookie);

        // Trigger storage event for Navbar update
        localStorage.setItem('authChanged', Date.now());

        // Get the redirect path
        const from = location.state?.from || '/problems';
        console.log('8. Redirecting to:', from);
        
        // Small delay to ensure storage is complete
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        console.log('5. No token in response');
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('=== Login Error ===');
      console.error('1. Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: err.config
      });
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login with better error handling
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setError('');
        console.log('Google OAuth success, token:', tokenResponse);
        
        // Send the access token to your backend
        const response = await axiosInstance.post(
          `${API_BASE_URL}/api/auth/google/token`,
          { access_token: tokenResponse.access_token },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Google login response:', response.data);

        if (response.data.token) {
          // Store token in localStorage
          localStorage.setItem('jwt', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Set cookie for cross-domain requests
          document.cookie = `jwt=${response.data.token}; path=/; max-age=86400; SameSite=Strict`;
          
          // Trigger storage event for Navbar update
          localStorage.setItem('authChanged', Date.now());

          // Navigate to the intended page
          const from = location.state?.from || '/problems';
          navigate(from, { replace: true });
        } else {
          setError('Google login failed. No token received.');
        }
      } catch (error) {
        console.error('Google login error:', error);
        setError(error.response?.data?.message || 'Google login failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      setGoogleLoading(false);
      setError('Google login failed. Please check your configuration and try again.');
    },
    flow: 'implicit'
  });

  const navigate_to_signup = () => {
    console.log('Navigating to signup page');
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="my-4 flex items-center justify-center">
            <span className="text-gray-400">or</span>
          </div>
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className={`w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-100 ${
              googleLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {googleLoading ? (
              'Signing in with Google...'
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.36 46.1 31.41 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.93 0-10.29l-7.98-6.2C.89 16.09 0 19.94 0 24c0 4.06.89 7.91 2.69 11.2l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.05 15.53-5.59l-7.19-5.59c-2.01 1.35-4.59 2.14-8.34 2.14-6.38 0-11.87-3.63-14.33-8.8l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                Sign in with Google
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={navigate_to_signup}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SLoginSignup;
