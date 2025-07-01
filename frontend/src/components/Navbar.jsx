import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome } from 'react-icons/fa';
import userPng from '../assets/user.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
console.log('Navbar API_BASE_URL:', API_BASE_URL);

const Navbar = ({ onSearch }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const url = `${API_BASE_URL}/auth/check`;
        console.log('Calling auth check at:', url);
        const response = await axios.get(url, { withCredentials: true });
        console.log('Auth check response:', response.data);
        if (response.data.isAuthenticated) {
          setIsLoggedIn(true);
          setUsername(response.data.user.username);
        } else {
          setIsLoggedIn(false);
          setUsername('');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
        setUsername('');
      }
    };
    checkAuth();

    // Listen for storage changes (login/logout in other tabs or programmatically)
    const handleStorage = () => checkAuth();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      setIsLoggedIn(false);
      setUsername('');
      localStorage.setItem('authChanged', Date.now());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  console.log('Navbar render: isLoggedIn:', isLoggedIn, 'username:', username);

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-blue-100 shadow text-gray-800 py-3 px-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Left: Home & Logo */}
        <div className="flex items-center gap-2 mb-2 md:mb-0 md:order-1">
          <button onClick={() => navigate('/')} className="p-2 rounded hover:bg-blue-100 transition" title="Home">
            <FaHome size={20} />
          </button>
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ml-2">Code Mon</Link>
        </div>
        {/* Right: User/Logout/Actions */}
        <div className="flex items-center gap-4 mt-2 md:mt-0 md:order-3 ml-auto">
          <Link to="/problems" className="hover:text-blue-600 font-semibold">Problems</Link>
          {isLoggedIn && (
            <>
              <Link to="/upload" className="hover:text-blue-600 font-semibold">Upload Problem</Link>
              <Link to="/submissions" className="hover:text-blue-600 font-semibold">Submissions</Link>
            </>
          )}
          <Link to="/profile" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center gap-2 px-4 py-2 rounded shadow transition ml-2">
            <img src={userPng} alt="Profile" className="w-6 h-6 rounded-full bg-white" />
            Profile
          </Link>
          {isLoggedIn ? (
            <>
              <span className="text-gray-600">Welcome, {username}</span>
              <Link to="/myaccount" className="hover:text-blue-600 font-semibold">My Account</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-semibold shadow"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 