const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

// Get all problems
router.get('/', auth, async (req, res) => {
  try {
    const problems = await Problem.find()
      .select('-testCases')
      .populate('createdBy', 'username');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single problem
router.get('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'username');
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new problem
router.post('/', auth, async (req, res) => {
  const problem = new Problem({
    title: req.body.title,
    description: req.body.description,
    difficulty: req.body.difficulty,
    testCases: req.body.testCases,
    createdBy: req.user.id
  });

  try {
    const newProblem = await problem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a problem
router.patch('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }

    Object.assign(problem, req.body);
    const updatedProblem = await problem.save();
    res.json(updatedProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a problem
router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }

    await problem.remove();
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add test cases to a problem
router.post('/:id/testcases', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user is admin or problem creator
    if (problem.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this problem' });
    }

    const { testCases } = req.body;
    
    if (!Array.isArray(testCases)) {
      return res.status(400).json({ message: 'testCases must be an array' });
    }

    // Validate test cases structure
    for (const testCase of testCases) {
      if (!testCase.input || !testCase.output) {
        return res.status(400).json({ message: 'Each test case must have input and output' });
      }
    }

    // Add new test cases to existing ones
    problem.testCases.push(...testCases);
    await problem.save();

    res.json({ 
      message: 'Test cases added successfully',
      totalTestCases: problem.testCases.length,
      addedTestCases: testCases.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Replace all test cases for a problem
router.put('/:id/testcases', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user is admin or problem creator
    if (problem.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this problem' });
    }

    const { testCases } = req.body;
    
    if (!Array.isArray(testCases)) {
      return res.status(400).json({ message: 'testCases must be an array' });
    }

    // Validate test cases structure
    for (const testCase of testCases) {
      if (!testCase.input || !testCase.output) {
        return res.status(400).json({ message: 'Each test case must have input and output' });
      }
    }

    // Replace all test cases
    problem.testCases = testCases;
    await problem.save();

    res.json({ 
      message: 'Test cases updated successfully',
      totalTestCases: problem.testCases.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 