const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// GET /api/daily-problem/today
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const problems = await Problem.find();
    if (!problems.length) return res.status(404).json({ message: 'No problems found' });
    const problem = problems[dayOfYear % problems.length];
    res.json({
      id: problem._id,
      title: problem.title,
      link: `/problems/${problem._id}`,
      description: problem.description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 