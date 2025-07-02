const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// Helper function to create a temporary file
const createTempFile = (code, language) => {
  const extension = {
    cpp: '.cpp',
    java: '.java',
    python: '.py'
  }[language];

  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const fileName = `temp_${Date.now()}${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, code);
  return filePath;
};

// Helper function to compile code
const compileCode = (filePath, language) => {
  return new Promise((resolve, reject) => {
    const compileCommands = {
      cpp: `g++ ${filePath} -o ${filePath}.out`,
      java: `javac ${filePath}`,
      python: 'echo "Python is interpreted"'
    };

    exec(compileCommands[language], (error, stdout, stderr) => {
      if (error && language !== 'python') {
        reject(new Error(`Compilation error: ${stderr}`));
      } else {
        resolve();
      }
    });
  });
};

// Helper function to run code
const runCode = (filePath, language, input) => {
  return new Promise((resolve, reject) => {
    const runCommands = {
      cpp: `${filePath}.out`,
      java: `java -cp ${path.dirname(filePath)} ${path.basename(filePath, '.java')}`,
      python: `python ${filePath}`
    };

    const process = exec(runCommands[language], { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed || error.signal === 'SIGTERM' || error.message.includes('timed out')) {
          reject(new Error('Time limit exceeded'));
        } else {
          reject(new Error(`Runtime error: ${stderr || error.message}`));
        }
      } else {
        resolve(stdout.trim());
      }
    });

    if (input) {
      process.stdin.write(input);
    }
    process.stdin.end();
  });
};

const safeUnlink = (path) => {
  try {
    if (fs.existsSync(path)) fs.unlinkSync(path);
  } catch (err) {
    if (err.code !== 'EPERM') {
      console.error('Error deleting file:', path, err);
    }
    // Ignore EPERM (Windows file lock issue)
  }
};

// Submit code
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code, language, input, mode } = req.body;
    const userId = req.user.id;
    console.log('MODE RECEIVED:', mode);

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Handle "run" mode and return immediately
    if (mode === "run") {
      try {
        const filePath = createTempFile(code, language);
        await compileCode(filePath, language);

        let output;
        if (input && input.trim() !== "") {
          output = await runCode(filePath, language, input);
        } else {
          const sampleTestCase = problem.testCases[0];
          output = await runCode(filePath, language, sampleTestCase.input);
        }

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (language === 'cpp' && fs.existsSync(`${filePath}.out`)) {
          fs.unlinkSync(`${filePath}.out`);
        }

        return res.json({ output });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // Otherwise, treat as a real submission (mode: "submit" or missing)
    // Create submission
    const submission = new Submission({
      problemId,
      userId,
      code,
      language,
      totalTestCases: problem.testCases.length
    });

    // Save submission
    await submission.save();

    // Process submission
    try {
      const filePath = createTempFile(code, language);
      await compileCode(filePath, language);

      let passedCases = 0;
      let failed = false;
      for (const testCase of problem.testCases) {
        try {
          const output = await runCode(filePath, language, testCase.input);
          if (output.trim() === testCase.output.trim()) {
            passedCases++;
          } else {
            submission.status = 'wrong_answer';
            submission.testCasesPassed = passedCases;
            await submission.save();
            safeUnlink(filePath);
            if (language === 'cpp') safeUnlink(`${filePath}.out`);
            // Only send safe fields
            return res.json({
              _id: submission._id,
              status: submission.status,
              testCasesPassed: submission.testCasesPassed,
              totalTestCases: submission.totalTestCases,
              errorMessage: submission.errorMessage || ''
            });
          }
        } catch (error) {
          if (error.message === 'Time limit exceeded') {
            submission.status = 'time_limit_exceeded';
            submission.errorMessage = error.message;
          } else {
            submission.status = 'runtime_error';
            submission.errorMessage = error.message;
          }
          await submission.save();
          safeUnlink(filePath);
          if (language === 'cpp') safeUnlink(`${filePath}.out`);
          // Only send safe fields
          return res.json({
            _id: submission._id,
            status: submission.status,
            testCasesPassed: submission.testCasesPassed,
            totalTestCases: submission.totalTestCases,
            errorMessage: submission.errorMessage || ''
          });
        }
      }

      submission.testCasesPassed = passedCases;
      submission.status = 'accepted';
      await submission.save();

      // Mark daily problem as done if this is today's daily problem
      try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        // Get all problems to match daily logic
        const allProblems = await Problem.find();
        if (allProblems.length > 0) {
          const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
          const dailyProblem = allProblems[dayOfYear % allProblems.length];
          console.log('Checking daily problem marking:', {
            todayStr,
            submittedProblemId: problemId,
            expectedDailyProblemId: dailyProblem?._id
          });
          if (dailyProblem && String(dailyProblem._id) === String(problemId)) {
            const user = await User.findById(userId);
            if (user && !user.dailyProblemHistory.some(e => e.date === todayStr)) {
              user.dailyProblemHistory.push({ date: todayStr, problemId });
              await user.save();
              console.log('Saved dailyProblemHistory (auto mark):', user.dailyProblemHistory);
            }
          }
        }
      } catch (err) {
        console.error('Error marking daily problem as done:', err);
      }

      safeUnlink(filePath);
      if (language === 'cpp') safeUnlink(`${filePath}.out`);

      // Only send safe fields
      return res.json({
        _id: submission._id,
        status: submission.status,
        testCasesPassed: submission.testCasesPassed,
        totalTestCases: submission.totalTestCases,
        errorMessage: submission.errorMessage || ''
      });
    } catch (error) {
      submission.status = 'compilation_error';
      submission.errorMessage = error.message;
      await submission.save();
      return res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// Get problem submissions
exports.getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ problemId: req.params.problemId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
}; 