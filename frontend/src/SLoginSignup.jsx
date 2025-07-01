import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from './utils/axiosConfig';
import './LoginSignup.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const SLoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
    const location = useLocation();

    console.log('Login Component: Current location state:', location.state);

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
