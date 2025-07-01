import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js/auto";
import "./ProblemsList.css";
import { useNavigate } from "react-router-dom";
import User_img from "./assets/user.png";
import ShowSingleP from "./ShowSingleP";
import axiosInstance from "./utils/axiosConfig";
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';
Chart.register(ArcElement);

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [basicP, setBasicP] = useState(0);
  const [easyP, setEasyP] = useState(0);
  const [mediumP, setMediumP] = useState(0);
  const [hardP, setHardP] = useState(0);
  const navigate = useNavigate();
  const [solved_easy, setSolved_easy] = useState(0);
  const [solved_basic, setSolved_basic] = useState(0);
  const [solved_medium, setSolved_medium] = useState(0);
  const [solved_hard, setSolved_hard] = useState(0);
  const [userid, setUserid] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedTag, setSelectedTag] = useState(""); // State to hold selected tag

  const calculateWidth = (solved, total) => {
    return total === 0 ? "0%" : `${(solved / total) * 100}%`;
  };

  useEffect(() => {
    let isMounted = true;

    const verifyAndFetchProblems = async () => {
      try {
        console.log('=== ProblemsList: Starting Authentication Check ===');
        const token = localStorage.getItem('jwt');
        
        if (!token) {
          console.log('ProblemsList: No token found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        // First verify the token
        console.log('ProblemsList: Verifying token');
        const verifyResponse = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!verifyResponse.data.valid) {
          console.log('ProblemsList: Token invalid, redirecting to login');
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          navigate('/login', { replace: true });
          return;
        }

        console.log('ProblemsList: Token valid, fetching problems');
        const response = await axiosInstance.get(`${API_BASE_URL}/api/problems`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (isMounted) {
          console.log('ProblemsList: Received problems data:', response.data);
          setProblems(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('ProblemsList: Error:', error);
        if (isMounted) {
          if (error.response?.status === 401) {
            console.log('ProblemsList: Unauthorized, redirecting to login');
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            navigate('/login', { replace: true });
          } else {
            setError(error.response?.data?.message || 'Failed to fetch problems');
            setLoading(false);
          }
        }
      }
    };

    verifyAndFetchProblems();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    const get_by_tag = async () => {
      if (!selectedTag) {
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/query/problem/${selectedTag}`,
          {
            withCredentials: true,
          }
        );
        setProblems(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    get_by_tag();
  }, [selectedTag]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/problems`);
        setProblems(response.data);
        setLoading(false);

          let countBasic = 0;
          let countEasy = 0;
          let countMedium = 0;
          let countHard = 0;

        response.data.forEach((problem) => {
            switch (problem.difficulty) {
              case "basic":
                countBasic++;
                break;
              case "easy":
                countEasy++;
                break;
              case "medium":
                countMedium++;
                break;
              case "hard":
                countHard++;
                break;
              default:
                break;
            }
          });

          setBasicP(countBasic);
          setEasyP(countEasy);
          setMediumP(countMedium);
          setHardP(countHard);

        if (response.data.user_id) {
          setUserid(response.data.user_id);
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setError("Failed to fetch problems. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: ["Basic", "Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [basicP, easyP, mediumP, hardP],
        backgroundColor: ["#CCE8CC", "#AEE1AE", "#FF8360", "#E94233"],
        hoverBackgroundColor: ["#FFD54F", "#81C784", "#FF8A65", "#FF5252"],
      },
    ],
  };

  function moveHome() {
    navigate("/");
  }

  function openAccount() {
    navigate("/myaccount");
  }

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div>
      <div className="main_block">
        <div className="ProblemList">
          <div className="prob-container">
            <div className="tpart">
              <div className="heading_p">
                <button className="home-button" onClick={moveHome}>
                  <i className="fas fa-home"></i> Home
                </button>
                Top Coding Questions
              </div>
            </div>

            <div className="all_prob_list">
              <ul>
                {Array.isArray(problems) && problems.length > 0 ? (
                  problems.map((problem) => (
                    <Link
                      key={problem._id}
                      to={`/problems/${problem._id}`}
                      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <h2 className="text-xl font-semibold mb-2">{problem.name}</h2>
                      <p className="text-gray-600 mb-4">{problem.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Difficulty: {problem.difficulty}
                        </span>
                        <span className="text-sm text-gray-500">
                          Category: {problem.tags.join(', ')}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p>No problems found</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="side_block">
          <div className="pie-chart-container">
          <h4>Total Problems:</h4>
            <Pie data={data} />
          </div>

          {/*TAGS OPTION  */}
          <div className="tags_sec">
            <div className="tags_head">Filter by Tags</div>
            <div className="tags_input">
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "arrays"}
                  onChange={() => handleTagClick("arrays")}
                />
                ARRAYS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "Maths"}
                  onChange={() => handleTagClick("Maths")}
                />
                MATHS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "Hash-Map"}
                  onChange={() => handleTagClick("Hash-Map")}
                />
                HASH-MAP
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "Binary-Search"}
                  onChange={() => handleTagClick("Binary-Search")}
                />
                BINARY-SEARCH
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTag === "tree"}
                  onChange={() => handleTagClick("tree")}
                />
                TREE
              </label>
            </div>
          </div>

          <h3 className="bar_g">Progress Tracker</h3>
          <div className="solved-problems">
            <ul>
              <li className="bar basic-bar">
                <div
                  className="bar-inner basic-bar"
                  style={{ width: calculateWidth(solved_basic, basicP) }}
                ></div>
                <span className="count">
                  {solved_basic}/{basicP}
                </span>
              </li>
              <li className="bar easy-bar">
                <div
                  className="bar-inner easy-bar"
                  style={{ width: calculateWidth(solved_easy, easyP) }}
                ></div>
                <span className="count">
                  {solved_easy}/{easyP}
                </span>
              </li>
              <li className="bar medium-bar">
                <div
                  className="bar-inner medium-bar"
                  style={{ width: calculateWidth(solved_medium, mediumP) }}
                ></div>
                <span className="count">
                  {solved_medium}/{mediumP}
                </span>
              </li>
              <li className="bar hard-bar">
                <div
                  className="bar-inner hard-bar"
                  style={{ width: calculateWidth(solved_hard, hardP) }}
                ></div>
                <span className="count">
                  {solved_hard}/{hardP}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsList;
