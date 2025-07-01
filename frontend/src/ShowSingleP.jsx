import React, { useState, useEffect } from "react";
import "./ShowSingleP.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Checkmark } from 'react-checkmark';
import axiosInstance from './utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

function ShowSingleP({ user_id, prob_id, name, description, difficulty, tags, submissions }) {
  const navigate = useNavigate();
  const [probsolved, setProbsolved] = useState("NOT ATTEMPTED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function getDifficultyClass(difficulty) {
    switch (difficulty) {
      case "basic":
        return "basic-difficulty";
      case "easy":
        return "easy-difficulty";
      case "medium":
        return "medium-difficulty";
      case "hard":
        return "hard-difficulty";
      default:
        return "";
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${user_id}`, { withCredentials: true });
        const userData = response.data;
        const solvedProblems = userData.solvedProblems;
        const solvedProblemsMap = new Map(Object.entries(solvedProblems));

        if (solvedProblemsMap.has(prob_id)) {
          setProbsolved("DONE");
        } else {
          setProbsolved("NOT ATTEMPTED");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user_id && prob_id) {
      fetchUserData();
    }
  }, [user_id, prob_id]);

  const handleClick = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      
      if (!token) {
        console.log('ShowSingleP: No token found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      // Verify token before proceeding
      const verifyResponse = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!verifyResponse.data.valid) {
        console.log('ShowSingleP: Token invalid, redirecting to login');
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login', { replace: true });
        return;
      }

      // If token is valid, navigate to problem detail
      navigate(`/problems/${prob_id}`);
    } catch (error) {
      console.error('ShowSingleP: Error:', error);
      if (error.response?.status === 401) {
        console.log('ShowSingleP: Unauthorized, redirecting to login');
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login', { replace: true });
      } else {
        setError('Failed to access problem');
      }
    } finally {
      setLoading(false);
  }
  };

  return (
    <div className={`single-entry ${probsolved === "DONE" ? "done" : "not-attempted"}`}>
      <div className="name-entry">{name}</div>
      <div className="tags-entry">{tags}</div>
      <div className="submissions-entry">
        { (probsolved === "DONE" && <Checkmark size='24px' color='green' />)}
        {/* { (probsolved !== "DONE" && <Checkmark size='16px' color='blue' />)} */}
      </div>
      <div className={`difficulty-level ${getDifficultyClass(difficulty)}`}>{difficulty}</div>
      <div className="action">
        <button 
          className={`solve-button ${probsolved === "DONE" ? "done" : "not-attempted"}`} 
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Problem'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}

export default ShowSingleP;
