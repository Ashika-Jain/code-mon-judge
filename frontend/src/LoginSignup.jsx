import React, { useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import "./LoginSignup.css"
import Swal from 'sweetalert2';
import image from './assets/two.png'
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

function LoginSignup() {
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [cookies, setCookie] = useCookies(['jwt']); 

  const navigate = useNavigate(); 
  const data_send_to_backend = {
    username,
    firstname,
    lastname,
    email,
    password,
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, data_send_to_backend, { withCredentials: true });
      const data = await res.data;
      
      if (data.errors) {
        setEmailError(data.errors.email || '');
        setPasswordError(data.errors.password || '');
        return;
      }

      if (data.token) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set the JWT token as a cookie
        document.cookie = `jwt=${data.token}; path=/; secure; sameSite=None`;
        
        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Successfully Signed Up!',
          text: 'Your account has been created. Welcome to Code Mon!',
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          stopKeydownPropagation: true
        });

        // Navigate after the message is shown
        navigate('/problems');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response && err.response.status === 400) {
        const data = err.response.data;
        setEmailError(data.errors?.email || '');
        setPasswordError(data.errors?.password || '');
        
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: data.msg || 'Please check your information and try again.',
          confirmButtonText: 'Try Again'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  function navigate_to_login(){
    navigate('/login');
  }

  return (
    <div className="auth-wrapper">
      <form className="farm" onSubmit={submit}>
        <div className="sign_farm">SignUp</div>
        <div className="container-auth">
          <label className='auth-label'>Username:</label>
          <input className='entry-auth'
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            value={username}
            required
          />
          <div className="username error"></div>
          <br />
          <label className='auth-label'>First Name:</label>
          <input className='entry-auth'
            type="text"
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="Enter your first name"
            value={firstname}
            required
          />
          <div className="firstname error"></div>
          <br />
          <label className='auth-label'>Last Name:</label>
          <input className='entry-auth'
            type="text"
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Enter your last name"
            value={lastname}
            required
          />
          <div className="lastname error"></div>
          <br />
          <label className='auth-label'>Email Id:</label>
          <input className='entry-auth'
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            value={email}
          />
          <div className="email error">{emailError}</div>
          <br />
          <label className='auth-label'>Password:</label>
          <input className='entry-auth'
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            value={password}
            required
          />
          <div className="password error">{passwordError}</div>
          <br />
          <input className='sub-btn' type="submit" value="Submit" />
        </div>
      </form>
      <div className='old_user' onClick={navigate_to_login} >New to <span className='old_user_hai_kya'  > Code Mon ?  </span> <span className='go_to_login'> Login</span> </div>
    </div>
  );
}

export default LoginSignup;
