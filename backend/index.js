require('dotenv').config();
const express = require('express');

const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');


const app = express();

// CORS configuration - most liberal for testing
app.use(cors({
  origin: true,
  credentials: true
}));

// Handle preflight requests
app.options('*', cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Test CORS route
app.get('/test-cors', (req, res) => {
  res.json({ msg: 'CORS is working' });
});

// Import the real aiCodeReview function
const { aiCodeReview, aiHint, aiBoilerplate } = require('./aiCodeReview');

app.post("/ai-review", async (req, res) => {
    const { code, type, problem, language } = req.body;
    try {
        let result;
        if (type === "review") {
            if (!code) return res.status(404).json({ success: false, error: "Empty code!" });
            result = await aiCodeReview(code);
        } else if (type === "hint") {
            if (!problem) return res.status(404).json({ success: false, error: "No problem description!" });
            result = await aiHint(problem);
        } else if (type === "boilerplate") {
            if (!problem || !language) return res.status(404).json({ success: false, error: "No problem or language!" });
            result = await aiBoilerplate(problem, language);
        } else {
            return res.status(400).json({ error: "Invalid type" });
        }
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: "Error in AI assist, error: " + error.message });
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-judge', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/problems', require('./routes/problems.js'));
app.use('/api/submissions', require('./routes/submissions.js'));
app.use('/api/daily-problem', require('./routes/dailyProblem.js'));

app.get('/', (req, res) => {
  res.json({ message: 'Online Judge API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
