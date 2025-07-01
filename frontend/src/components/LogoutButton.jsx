import React from 'react';
import useLogout from '../hooks/useLogout';

const LogoutButton = () => {
  const logout = useLogout();

  return (
    <button 
      onClick={logout}
      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton; 