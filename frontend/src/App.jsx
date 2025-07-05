import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './utils/axiosConfig'; // Import axios configuration
import LoginSignup from './LoginSignup';
import SLoginSignup from './SLoginSignup';
import SubmissionHistory from './SubmissionHistory';
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

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<SLoginSignup/>} />
            <Route path="/signup" element={<LoginSignup/>} />
            <Route path="/problems" element={<ProblemsList/>} />
            <Route path="/problems/:id" element={<ProblemDetail/>} />
            <Route path="/submission_history/:id" element={<SubmissionHistory/>} />
            <Route path="/myaccount" element={<Myaccount/>} />
            <Route path="/account" element={<UserAccount />} />
            {/* Protected Routes */}
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/problems_post" element={
              <ProtectedRoute>
                <Contribute />
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
