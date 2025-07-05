import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './utils/axiosConfig'; // Import axios configuration
import LoginSignup from './LoginSignup';
import SLoginSignup from './SLoginSignup';
import SubmissionHistory from './SubmissionHistory'
import Home from './Home';
import ProblemsList from './components/ProblemsList';
import Contribute from './Contribute';
import ProblemDetail from './components/ProblemDetail';
import Myaccount from './Myaccount';
import UserAccount from './components/UserAccount';
import Upload from './Upload';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './components/ProfilePage';

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

// Debug Google OAuth configuration
console.log('=== Google OAuth Configuration Debug ===');
console.log('Google Client ID:', GOOGLE_CLIENT_ID);
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  NODE_ENV: import.meta.env.NODE_ENV
});

// Validate Google Client ID
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id') {
  console.error('❌ Google Client ID is not properly configured!');
  console.error('Please set VITE_GOOGLE_CLIENT_ID in your .env file');
} else {
  console.log('✅ Google Client ID is configured');
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<SLoginSignup/>} />
            <Route path="/signup" element={<LoginSignup/>} />
            
            {/* Protected Routes */}
            <Route path="/myaccount" element={
              <ProtectedRoute>
                <Myaccount/>
              </ProtectedRoute>
            } />
            <Route path='/problems' element={
              <ProblemsList/>
            } />
            <Route path="/problems_post" element={
              <ProtectedRoute>
                <Contribute/>
              </ProtectedRoute>
            } />
            <Route path="/submission_history/:id" element={
              <ProtectedRoute>
                <SubmissionHistory/>
              </ProtectedRoute>
            } />
            <Route path="/submissions" element={
              <ProtectedRoute>
                <SubmissionHistory/>
              </ProtectedRoute>
            } />
            <Route path="/problems/:id" element={
              <ProtectedRoute>
                <ProblemDetail/>
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <UserAccount />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
