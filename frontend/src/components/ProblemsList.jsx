import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../utils/axiosConfig";
import ShowSingleP from "../ShowSingleP";
import Navbar from './Navbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ProblemsList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState({ Easy: true, Medium: true, Hard: true });

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                console.log('ProblemsList: Starting to fetch problems');
                const token = localStorage.getItem('jwt');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                console.log('ProblemsList: Making API request to fetch problems');
                const response = await axiosInstance.get(`${API_BASE_URL}/api/problems`, {
                    headers
                });
                console.log('ProblemsList: Received problems data:', response.data);
                setProblems(response.data);
                setLoading(false);
            } catch (err) {
                console.error('ProblemsList: Error fetching problems:', err);
                console.error('Error details:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });
                setError('Failed to fetch problems. Please try again later.');
                setLoading(false);
            }
        };
        fetchProblems();
    }, [navigate]);

    const handleProblemClick = (problemId) => {
        console.log('ProblemsList: Navigating to problem:', problemId);
        navigate(`/problems/${problemId}`);
    };

    const handleDifficultyChange = (level) => {
        setDifficultyFilter(prev => ({ ...prev, [level]: !prev[level] }));
    };

    const handleNavbarSearch = (query) => {
        setSearch(query);
    };

    const filteredProblems = problems.filter(problem =>
        ((problem.title && problem.title.toLowerCase().includes(search.toLowerCase())) ||
        (problem.tags && problem.tags.toLowerCase().includes(search.toLowerCase())) ||
        (problem.difficulty && problem.difficulty.toLowerCase().includes(search.toLowerCase()))) &&
        difficultyFilter[problem.difficulty]
    );

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Filter Block */}
                <div className="bg-white rounded-xl shadow p-6 border border-gray-200 h-fit mb-8 md:mb-0">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Filter by Difficulty</h2>
                    <div className="space-y-2">
                        {['Easy', 'Medium', 'Hard'].map(level => (
                            <label key={level} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={difficultyFilter[level]}
                                    onChange={() => handleDifficultyChange(level)}
                                    className="accent-blue-500 w-4 h-4 rounded border-gray-300"
                                />
                                <span className={`font-semibold ${
                                    level === 'Easy' ? 'text-green-600' :
                                    level === 'Medium' ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Problems List */}
                <div className="md:col-span-3">
                    <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Problems</h1>
                    <input
                        type="text"
                        placeholder="Search problems by title, tag, or difficulty..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full mb-6 px-4 py-2 rounded-lg border border-blue-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="grid gap-6">
                        {filteredProblems.map((problem) => (
                            <div
                                key={problem._id}
                                onClick={() => handleProblemClick(problem._id)}
                                className="bg-white/90 rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl border border-blue-100 transition group"
                            >
                                <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-700 transition">{problem.title}</h2>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow ${
                                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {problem.difficulty}
                                    </span>
                                    {problem.tags && problem.tags.split(',').map(tag => (
                                        <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold shadow">{tag}</span>
                                    ))}
                                    <span className="text-gray-600 ml-auto">
                                        Created by: {problem.createdBy?.username || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemsList; 