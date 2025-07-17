import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import axios from 'axios';
import CodeEditor from "../CodeEditor";
import Navbar from './Navbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const defaultTemplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // your code goes here
    return 0;
}`,
  python: `# Write your code here
def main():
    pass

if __name__ == "__main__":
    main()` ,
  java: `public class Main {
    public static void main(String[] args) {
        // your code goes here
    }
}`
};

const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [submissionError, setSubmissionError] = useState(null);
    const [aiReview, setAiReview] = useState('');
    const [aiHint, setAiHint] = useState('');
    const [loadingAI, setLoadingAI] = useState(null); // null | 'review' | 'hint' | 'boilerplate'
    const [input, setInput] = useState('');
    const [customOutput, setCustomOutput] = useState('');
    const [runStatus, setRunStatus] = useState('idle');
    const [verdict, setVerdict] = useState(null);
    const [polling, setPolling] = useState(false);
    const [theme, setTheme] = useState('light');
    const [verdictMessage, setVerdictMessage] = useState('');
    // Track previous language for template switching
    const [prevLanguage, setPrevLanguage] = useState(language);
    const [similarityInfo, setSimilarityInfo] = useState(null);

    console.log('=== ProblemDetail Component ===');
    console.log('1. Current location:', location.pathname);
    console.log('2. Problem ID:', id);

    // Remove this useEffect that checks authentication and redirects to /login

    // Remove authentication check for fetching problem details
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/problems/${id}`);
                setProblem(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load problem details');
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    useEffect(() => {
        // Only set template if code is empty or matches the previous template
        const prevTemplate = defaultTemplates[prevLanguage] || '';
        if (!code.trim() || code.trim() === prevTemplate.trim()) {
            setCode(defaultTemplates[language] || '');
        }
        setPrevLanguage(language);
        // eslint-disable-next-line
    }, [language]);

    const handleRun = async (e) => {
        e.preventDefault();
        setRunStatus('running');
        setCustomOutput('');
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/submissions/submit`,
                {
                    problemId: id,
                    code: code.trim(),
                    language: language.toLowerCase(),
                    input: input || "",
                    mode: "run"
                }
            );
            if (response.data && response.data.output) {
                setCustomOutput(response.data.output);
            } else if (response.data && response.data.message) {
                setCustomOutput(response.data.message);
            } else {
                setCustomOutput('');
            }
            setRunStatus('success');
        } catch (err) {
            setRunStatus('error');
            setCustomOutput(err.response?.data?.message || 'Failed to run code. Please try again.');
        }
    };

    const pollForVerdict = (submissionId, token) => {
        setPolling(true);
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/submissions/${submissionId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                if (response.data && response.data.status && response.data.status !== 'pending') {
                    setVerdict(response.data.status);
                    setPolling(false);
                    clearInterval(interval);
                }
            } catch (err) {
                setPolling(false);
                clearInterval(interval);
            }
        }, 2000);
    };

    // Remove auth check for viewing, only check for submit
    const handleSubmit = async (e) => {
        console.log('Submit button clicked!');
        e.preventDefault();
        console.log('JWT before submit:', localStorage.getItem('jwt'));
        const token = localStorage.getItem('jwt');
        if (!token) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
            return;
        }

        if (!code.trim()) {
            setSubmissionError('Please enter your code');
            setSubmissionStatus('error');
            return;
        }

        setSubmissionStatus('submitting');
        setSubmissionError(null);
        setCustomOutput('');
        setSimilarityInfo(null); // Reset similarity info on new submit

        try {
            // Verify token again before submission
            const verifyResponse = await axiosInstance.get(`${API_BASE_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!verifyResponse.data.valid) {
                console.log('Token invalid before submission, redirecting to login');
                console.log('Removing JWT');
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
                return;
            }

            const response = await axiosInstance.post(
                `${API_BASE_URL}/api/submissions/submit`,
                {
                    problemId: id,
                    code: code.trim(),
                    language: language.toLowerCase(),
                    input: '', // Always empty for submit
                    mode: "submit"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // --- Similarity Feedback Integration ---
            if (typeof response.data.flagged !== 'undefined' && typeof response.data.similarity !== 'undefined') {
                setSimilarityInfo({
                    flagged: response.data.flagged,
                    similarity: response.data.similarity
                });
                console.log('Similarity info set:', response.data.flagged, response.data.similarity);
            } else {
                setSimilarityInfo(null);
                console.log('Similarity info not set, response:', response.data);
            }
            // --- End Similarity Feedback Integration ---

            // Start polling for verdict
            if (response.data && response.data.submissionId) {
                pollForVerdict(response.data.submissionId, token);
            }

            // Check the backend's status field
            setVerdictMessage(response.data?.errorMessage || '');
            if (response.data && response.data.status === 'accepted') {
                setSubmissionStatus('success');
               // window.location.reload(); // Force reload to update daily problem status
            } else if (response.data && response.data.status === 'wrong_answer') {
                setSubmissionStatus('wrong');
            } else if (response.data && response.data.status === 'runtime_error') {
                setSubmissionStatus('runtime_error');
            } else if (response.data && response.data.status === 'time_limit_exceeded') {
                setSubmissionStatus('time_limit_exceeded');
            } else {
                setSubmissionStatus('error');
            }
            setCustomOutput('');
        } catch (err) {
            setSubmissionStatus('error');
            setCustomOutput('');
            setVerdictMessage('');
            setSimilarityInfo(null);
            
            if (err.response?.status === 401) {
                console.log('Unauthorized for submission, redirecting to login');
                console.log('Removing JWT');
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
                document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
            } else {
                setSubmissionError(err.response?.data?.message || 'Failed to submit solution. Please try again.');
            }
        }
    };

    const fetchAI = async (type) => {
        setLoadingAI(type);
        try {
            const payload = {
                code,
                type,
                problem: problem?.description || '',
                language
            };
            const { data } = await axios.post(`${API_BASE_URL}/ai-review`, payload);
            if (type === "review") setAiReview(data.result);
            if (type === "hint") setAiHint(data.result);
            if (type === "boilerplate") {
                setCode(data.result); // Set the editor value to the boilerplate
            }
        } catch (error) {
            if (type === "review") setAiReview('Error: ' + error.message);
            if (type === "hint") setAiHint('Error: ' + error.message);
            // No need to set aiBoilerplate error
        }
        setLoadingAI(null);
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <Navbar />
            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Problem Description */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="rounded-xl shadow-lg p-6 mb-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 backdrop-blur-md border border-blue-200/40">
                            <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow">{problem?.title || problem?.name}</h1>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {problem?.tags?.split(',').map(tag => (
                                    <span key={tag} className="bg-white/60 px-3 py-1 rounded-full text-xs font-semibold shadow hover:bg-white/80 transition text-blue-700">{tag}</span>
                                ))}
                            </div>
                            <span className={`inline-block mt-4 px-4 py-1 rounded-full text-white font-semibold shadow-lg ${problem?.difficulty === 'Easy' ? 'bg-green-400' : problem?.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'}`}>{problem?.difficulty}</span>
                        </div>
                        {/* Problem Statement */}
                        <div className="bg-white/90 rounded-2xl shadow-lg p-8 space-y-6 border border-blue-100">
                            <h2 className="text-2xl font-bold text-blue-700">Problem Statement</h2>
                            <p className="text-gray-700 whitespace-pre-line">{problem?.description}</p>
                            <div>
                                <h3 className="font-semibold text-purple-700">Constraints</h3>
                                <p className="text-gray-600 whitespace-pre-line">{problem?.constraints}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-blue-600">Sample Input</h4>
                                    <pre className="bg-blue-50 p-3 rounded-lg border border-blue-100">{problem?.showtc}</pre>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-600">Sample Output</h4>
                                    <pre className="bg-purple-50 p-3 rounded-lg border border-purple-100">{problem?.showoutput}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Editor, Input/Output, Actions, Review */}
                    <div className="space-y-6">
                        {/* Language & Theme Selectors */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div>
                                <label className="mr-2 font-medium text-blue-700">Language:</label>
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="border rounded px-2 py-1 shadow focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="python">Python</option>
                                </select>
                            </div>
                            <div>
                                <label className="mr-2 font-medium text-purple-700">Theme:</label>
                                <select
                                    value={theme}
                                    onChange={e => setTheme(e.target.value)}
                                    className="border rounded px-2 py-1 shadow focus:ring-2 focus:ring-purple-300"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>
                        {/* Code Editor */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 border border-blue-100 transition hover:shadow-2xl">
                            <CodeEditor
                                value={code}
                                language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
                                onChange={setCode}
                                height="350px"
                                theme={theme}
                            />
                        </div>
                        {/* Custom Input & Output */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl shadow p-4 border border-blue-100">
                                <label className="block font-medium mb-2 text-blue-700">Custom Input</label>
                                <CodeEditor
                                    value={input}
                                    language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
                                    onChange={setInput}
                                    height="120px"
                                    theme={theme}
                                />
                            </div>
                            <div className="bg-white rounded-2xl shadow p-4 border border-purple-100">
                                <label className="block font-medium mb-2 text-purple-700">Output</label>
                                <CodeEditor
                                    value={customOutput}
                                    language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : 'javascript'}
                                    onChange={() => {}}
                                    height="120px"
                                    readOnly={true}
                                    theme={theme}
                                />
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={handleRun}
                                disabled={runStatus === 'running'}
                                className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-2 rounded shadow transition disabled:bg-gray-400"
                            >
                                {runStatus === 'running' ? 'Running...' : 'Run'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submissionStatus === 'submitting'}
                                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-4 py-2 rounded shadow transition disabled:bg-gray-400"
                            >
                                {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                        {/* Verdict/Feedback */}
                        {submissionStatus && (
                            <div className="mt-4 p-4 rounded bg-gradient-to-r from-green-50 to-blue-50 border border-blue-100 shadow">
                                <h3 className="font-semibold mb-2 text-blue-700">Verdict / Feedback</h3>
                                {console.log('Rendering similarityInfo:', similarityInfo)}
                                {similarityInfo && (
                                    <div className={"mb-2 p-2 rounded " + (similarityInfo.flagged ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300") }>
                                        {similarityInfo.flagged ? (
                                            <>⚠️ Your code is very similar to previous submissions! Similarity: {Math.round(similarityInfo.similarity * 100)}%</>
                                        ) : (
                                            <>Similarity with previous submissions: {Math.round(similarityInfo.similarity * 100)}%</>
                                        )}
                                    </div>
                                )}
                                {submissionStatus === 'success' && <div className="text-green-700">Solution submitted successfully!</div>}
                                {submissionStatus === 'wrong' && <div className="text-red-700">Wrong answer! Your solution did not pass all test cases.</div>}
                                {submissionStatus === 'runtime_error' && <div className="text-orange-700">Runtime error occurred while running your code.</div>}
                                {submissionStatus === 'time_limit_exceeded' && <div className="text-orange-700">Time limit exceeded.</div>}
                                {verdictMessage && <div className="text-red-700">{verdictMessage}</div>}
                                {submissionError && <div className="text-red-700">{submissionError}</div>}
                            </div>
                        )}
                        {polling && <p>Judging your submission...</p>}
                        {verdict && <p>{verdict}</p>}
                        {/* AI Review */}
                        <div className="mt-4 p-4 rounded bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 shadow">
                            <h3 className="font-semibold mb-2 text-purple-700">AI Review</h3>
                            <div className="text-gray-800 whitespace-pre-wrap min-h-[40px]">{aiReview}</div>
                        </div>
                        <div className="mt-4 p-4 rounded bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 shadow">
                            <h3 className="font-semibold mb-2 text-green-700">AI Hint</h3>
                            <div className="text-gray-800 whitespace-pre-wrap min-h-[40px]">{aiHint}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Floating AI FAB Buttons */}
            <style>{`
            .ai-fab-container {
              position: fixed;
              bottom: 32px;
              right: 32px;
              display: flex;
              flex-direction: column;
              gap: 16px;
              z-index: 1000;
            }
            .ai-fab-btn {
              display: flex;
              align-items: center;
              gap: 8px;
              font-weight: 600;
              font-size: 1rem;
              border-radius: 12px;
              padding: 12px 24px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.12);
              background: #181c2f;
              border: 2px solid transparent;
              cursor: pointer;
              transition: transform 0.1s, box-shadow 0.1s, border-color 0.2s;
            }
            .ai-fab-btn:active {
              transform: scale(0.97);
            }
            .ai-fab-review {
              border-color: #5b6ee1;
              color: #5b6ee1;
            }
            .ai-fab-boilerplate {
              border-color: #2ecc40;
              color: #2ecc40;
            }
            .ai-fab-hint {
              border-color: #f1c40f;
              color: #f1c40f;
            }
            .ai-fab-btn:hover {
              box-shadow: 0 8px 32px rgba(91,110,225,0.15);
              background: #23284a;
            }
            `}</style>
            <div className="ai-fab-container">
              <button
                className="ai-fab-btn ai-fab-review"
                onClick={() => fetchAI("review")}
                disabled={loadingAI === "review" || !code.trim()}
              >
                <span role="img" aria-label="robot">🤖</span> AI Review
              </button>
              <button
                className="ai-fab-btn ai-fab-boilerplate"
                onClick={() => fetchAI("boilerplate")}
                disabled={loadingAI === "boilerplate"}
              >
                <span role="img" aria-label="test-tube">🧪</span> AI Boilerplate
              </button>
              <button
                className="ai-fab-btn ai-fab-hint"
                onClick={() => fetchAI("hint")}
                disabled={loadingAI === "hint"}
              >
                <span role="img" aria-label="lightbulb">💡</span> AI Hint
              </button>
            </div>
        </div>
    );
};

export default ProblemDetail; 