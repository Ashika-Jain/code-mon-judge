import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../utils/axiosConfig";
import ShowSingleP from "../ShowSingleP";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const ProblemsList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                console.log('ProblemsList: Starting to fetch problems');
                const token = localStorage.getItem('jwt');
                
                if (!token) {
                    console.log('ProblemsList: No token found, redirecting to login');
                    navigate('/login', { replace: true });
                    return;
                }

                console.log('ProblemsList: Making API request to fetch problems');
                const response = await axiosInstance.get(`${API_BASE_URL}/api/problems`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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
                if (err.response?.status === 401) {
                    console.log('ProblemsList: Unauthorized, redirecting to login');
                    navigate('/login', { replace: true });
                }
            }
        };

        fetchProblems();
    }, [navigate]);

    const handleProblemClick = (problemId) => {
        console.log('ProblemsList: Navigating to problem:', problemId);
        navigate(`/problems/${problemId}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Problems</h1>
            <div className="grid gap-4">
                {problems.map((problem) => (
                    <div
                        key={problem._id}
                        onClick={() => handleProblemClick(problem._id)}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {problem.difficulty}
                            </span>
                            <span className="text-gray-600">
                                Created by: {problem.createdBy?.username || 'Unknown'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProblemsList; 