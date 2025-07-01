import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    console.log('Logout: Starting logout process...');

    // Clear localStorage items
    console.log('Logout: Clearing localStorage items');
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');

    // Clear cookies
    console.log('Logout: Clearing cookies');
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    console.log('Logout: Redirecting to login page');
    navigate('/login', { replace: true });
  };

  return logout;
};

export default useLogout; 