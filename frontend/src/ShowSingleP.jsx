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
    navigate(`/problems/${prob_id}`);
  };

  return (
    <div className={`single-entry ${probsolved === "DONE" ? "done" : "not-attempted"}`}>
      <div className="name-entry">{name}</div>
      <div className="tags-entry">{tags}</div>
      <div className="submissions-entry">
        { (probsolved === "DONE" && <Checkmark size='24px' color='green' />)}
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