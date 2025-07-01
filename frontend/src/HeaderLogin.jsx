import React from 'react';
import './HeaderLogin.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import Logo from './assets/logo2.png';
import useLogout from './hooks/useLogout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

function Header() {
  const navigate = useNavigate();
  const logout = useLogout();

  const isLoggedIn = localStorage.getItem('jwt') !== null;

  async function go_to_contributionPage() {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        swal({
          title: "No User Found",
          text: "Authenticate yourself to continue.",
          icon: "warning"
        }).then(() => {
          navigate("/login");
        });
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/check_if_admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Admin check response:', response.data);

      if (!response.data.authorized) {
        swal({
          title: "No User Found",
          text: "Authenticate yourself to continue.",
          icon: "warning"
        }).then(() => {
          navigate("/login");
        });
        return;
      }

      if (response.data.role === "admin") {
          swal({
          text: "You are navigating as an admin! Do you want to continue?"
        }).then(() => {
            navigate("/problems_post");
          });
      } else {
          swal({
            title: "ADMIN ONLY!",
            text: "Only Admin can contribute!",
            icon: "error",
          });
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      swal({
        title: "Error",
        text: "Failed to verify user permissions. Please try again.",
        icon: "error",
      });
    }
  }

  return (
    <div className="headerf">
        <img className="logo_banner" src={Logo} alt="NOT FOUND" />
      <div className="auth-buttons">
        <button className="contribute" onClick={go_to_contributionPage}>
          Contribute
        </button>

        {!isLoggedIn ? (
          <>
        <button className="login-button">
          <Link to="/signup">SignUp</Link>
        </button>
            <button className="signup-button">
              <Link to="/login">Login</Link>
            </button>
          </>
        ) : (
          <button className="logout-button" onClick={logout}>
          Logout
        </button>
        )}
      </div>
    </div>
  );
}

export default Header;
