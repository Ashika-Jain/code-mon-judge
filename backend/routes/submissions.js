const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { requireAuth } = require('../middleware/authMiddleware');

// Submit code (auth handled in controller for 'submit' mode only)
router.post('/submit', submissionController.submitCode);

// Get user's submissions
router.get('/user', requireAuth, submissionController.getUserSubmissions);

// Get problem submissions
router.get('/problem/:problemId', requireAuth, submissionController.getProblemSubmissions);

// Get a single submission by ID for verdict polling
router.get('/:id', requireAuth, submissionController.getSubmissionById);

module.exports = router; 