import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import swal from 'sweetalert';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('jwt') !== null;
  let isAdmin = false;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    isAdmin = user && user.role === 'admin';
  } catch (e) {
    isAdmin = false;
  }

  const handleContribute = () => {
    if (isAdmin) {
      navigate('/problems_post');
    } else {
      swal({
        title: 'ADMIN ONLY!',
        text: 'Only Admin can contribute!',
        icon: 'error',
      });
    }
  };

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
        {/* Right: Auth/Actions */}
        <div className="flex items-center gap-4 mt-2 md:mt-0 md:order-3 ml-auto">
          <Link to="/problems" className="hover:text-blue-600 font-semibold">Problems</Link>
          <Link to="/leaderboard" className="hover:text-blue-600 font-semibold">Leaderboard</Link>
          {isLoggedIn && (
            <button
              onClick={handleContribute}
              className="bg-gradient-to-r from-purple-500 to-pink-400 text-white px-4 py-2 rounded font-semibold shadow hover:scale-105 transition"
            >
              Contribute
            </button>
          )}
          {isLoggedIn ? (
            <Link to="/profile" className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-4 py-2 rounded font-semibold shadow hover:scale-105 transition">
              Profile
            </Link>
          ) : (
            <>
              <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded font-semibold shadow hover:scale-105 transition">
                <Link to="/signup">SignUp</Link>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-4 py-2 rounded font-semibold shadow hover:scale-105 transition">
                <Link to="/login">Login</Link>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 