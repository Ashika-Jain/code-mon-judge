const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const authController = require('../controllers/authController');
const dayjs = require('dayjs');
const mongoose = require('mongoose');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstname, lastname } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      firstname,
      lastname,
      role: 'user'
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.SECRET_KEY || 'your-super-secret-jwt-key-123456789',
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user.email);
    console.log('Stored password:', user.password);
    console.log('Attempting to compare with password:', password);

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', user.email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.SECRET_KEY || 'your-super-secret-jwt-key-123456789',
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send response with user data and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/verify
// @desc    Verify JWT token
// @access  Public
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your-super-secret-jwt-key-123456789');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.json({ valid: false });
    }

    res.json({ 
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.json({ valid: false });
  }
});

// @route   GET /auth/check
// @desc    Check authentication status
// @access  Private
router.get('/check', auth, async (req, res) => {
  if (req.user) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Google OAuth routes
// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', authController.googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', authController.googleCallback);

// @route   POST /api/auth/google/token
// @desc    Handle Google OAuth token and create/login user
// @access  Public
router.post('/google/token', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Verify the token with Google
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
    
    if (!googleResponse.ok) {
      return res.status(400).json({ message: 'Invalid access token' });
    }

    const googleUser = await googleResponse.json();
    
    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.isGoogleUser = true;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId: googleUser.id,
        email: googleUser.email,
        username: googleUser.name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 5),
        firstname: googleUser.given_name || googleUser.name.split(' ')[0],
        lastname: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
        avatar: googleUser.picture,
        isGoogleUser: true,
        role: 'user'
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.SECRET_KEY || 'your-super-secret-jwt-key-123456789',
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send response with user data and token
    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });

  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user's profile with stats and recent submissions
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Stats
    const stats = {
      solved: user.problemsSolved || 0,
      submissions: user.submissions || 0,
      accuracy: user.submissions ? Math.round((user.problemsSolved / user.submissions) * 100) + '%' : '0%'
    };

    // Recent submissions (last 5)
    const submissions = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('problemId');

    const recentSubmissions = submissions.map(sub => ({
      id: sub._id,
      problem: sub.problemId?.title || 'Unknown',
      status: sub.status === 'accepted' ? 'Accepted' : sub.status === 'wrong_answer' ? 'Wrong Answer' : sub.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      date: sub.createdAt.toISOString().slice(0, 10)
    }));

    // Badges (simple example)
    const badges = [];
    if (user.submissions > 0) badges.push({ type: 'first_submission', label: 'First Submission' });
    if (user.problemsSolved >= 10) badges.push({ type: 'ten_solved', label: '10 Problems Solved' });

    // Daily streak and today's daily problem solved
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const historyDates = Array.isArray(user.dailyProblemHistory) ? user.dailyProblemHistory.map(e => e.date) : [];
    // Calculate streak
    function getStreak(days) {
      if (!days.length) return 0;
      const sorted = [...days].sort();
      let streak = 0;
      let current = new Date(todayStr);
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i] === current.toISOString().slice(0, 10)) {
          streak++;
          current.setDate(current.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    }
    const streak = getStreak(historyDates);
    const dailyProblemSolvedToday = historyDates.includes(todayStr);

    res.json({
      username: user.username,
      email: user.email,
      avatar: '', // Add avatar URL if available
      stats,
      badges,
      recentSubmissions,
      streak,
      dailyProblemSolvedToday,
      dailyProblemHistory: user.dailyProblemHistory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/profile/daily
// @desc    Mark daily problem as done for the user
// @access  Private
router.post('/profile/daily', auth, async (req, res) => {
  const { date, problemId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.dailyProblemHistory.some(e => e.date === date)) {
      user.dailyProblemHistory.push({ date, problemId });
      await user.save();
      console.log('Saved dailyProblemHistory (manual mark):', user.dailyProblemHistory);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activity heatmap endpoint (last 6 months, accepted submissions)
router.get('/activity-heatmap', auth, async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    const userId = req.user.id;
    const today = dayjs().startOf('day');
    const sixMonthsAgo = today.subtract(6, 'month');

    // Get all accepted submissions for this user in the last 6 months
    const submissions = await Submission.find({
      userId,
      status: 'accepted',
      createdAt: { $gte: sixMonthsAgo.toDate(), $lte: today.toDate() }
    });

    // Map: date string (YYYY-MM-DD) -> count
    const activity = {};
    submissions.forEach(sub => {
      const dateStr = dayjs(sub.createdAt).format('YYYY-MM-DD');
      activity[dateStr] = (activity[dateStr] || 0) + 1;
    });

    res.json(activity);
  } catch (err) {
    console.error('Heatmap error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Yearly activity heatmap endpoint (accepted submissions)
router.get('/activity-heatmap-year', auth, async (req, res) => {
  const userId = req.user.id;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    const data = await require('../models/Submission').aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'accepted', createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to { 'YYYY-MM-DD': count }
    const result = {};
    data.forEach(d => {
      const date = `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`;
      result[date] = d.count;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if user is admin
router.get('/check_if_admin', auth, async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.json({ isAdmin: true });
    } else {
      return res.json({ isAdmin: false });
    }
  } catch (err) {
    res.status(500).json({ isAdmin: false, error: err.message });
  }
});

// Leaderboard endpoint
router.get('/leaderboard', async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    const Problem = require('../models/Problem');
    const User = require('../models/User');

    // Get all accepted submissions, populate problem difficulty
    const submissions = await Submission.find({ status: 'accepted' })
      .populate('problemId', 'difficulty')
      .populate('userId', 'username firstname lastname email');

    // Map: userId -> { username, points, solvedProblems: Set }
    const userMap = {};
    submissions.forEach(sub => {
      const userId = sub.userId._id.toString();
      const username = sub.userId.username || sub.userId.email || 'Unknown';
      const name = sub.userId.firstname ? `${sub.userId.firstname} ${sub.userId.lastname || ''}`.trim() : username;
      const problemId = sub.problemId._id.toString();
      const difficulty = sub.problemId.difficulty;
      if (!userMap[userId]) {
        userMap[userId] = { userId, username, name, points: 0, solvedProblems: new Set() };
      }
      // Only count unique problems per user
      if (!userMap[userId].solvedProblems.has(problemId)) {
        let pts = 1;
        if (difficulty === 'Medium') pts = 2;
        if (difficulty === 'Hard') pts = 3;
        userMap[userId].points += pts;
        userMap[userId].solvedProblems.add(problemId);
      }
    });

    // Convert to array and sort by points desc
    const leaderboard = Object.values(userMap)
      .map(u => ({ userId: u.userId, username: u.username, name: u.name, points: u.points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50); // Top 50

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 