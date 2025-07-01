const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');

// Submit code
router.post('/submit', auth, submissionController.submitCode);

// Get user's submissions
router.get('/user', auth, submissionController.getUserSubmissions);

// Get problem submissions
router.get('/problem/:problemId', auth, submissionController.getProblemSubmissions);

module.exports = router; 