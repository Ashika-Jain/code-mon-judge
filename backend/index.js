const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

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

// Test CORS route
app.get('/test-cors', (req, res) => {
  res.json({ msg: 'CORS is working' });
});

// Import the real aiCodeReview function
const { aiCodeReview } = require('./aiCodeReview');

app.post("/ai-review", async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const review = await aiCodeReview(code);
        res.json({ "review": review });
    } catch (error) {
        res.status(500).json({ error: "Error in AI review, error: " + error.message });
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

app.get('/', (req, res) => {
  res.json({ message: 'Online Judge API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
