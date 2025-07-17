const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { sendSubmission } = require('../kafka/producer');
const jwt = require('jsonwebtoken');
const checkCodeSimilarity = require('../utils/similarity');

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
    let userId = null;
    const useKafka = process.env.USE_KAFKA === 'true';
    if (mode === 'submit') {
      // Manually extract and verify JWT
      let token = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
      }
      if (!token) {
        return res.status(401).json({ message: 'Authentication required to submit solutions.' });
      }
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY || require('../secKey.json').SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }
      userId = decoded.userId;
      // Save submission to DB first
      const submissionDoc = new Submission({
        problemId,
        userId,
        code,
        language,
        totalTestCases: 0 // You can update this if needed
      });
      await submissionDoc.save();

      // --- Similarity Check Integration ---
      console.log('Before similarity check (submissionDoc flow)');
      const previousSubmissions = await Submission.find({
        problemId,
        userId: { $ne: userId }
      }).select('code -_id');
      console.log('Previous submissions found:', previousSubmissions.length);
      const previousCodes = previousSubmissions.map(sub => sub.code);
      const similarityResult = await checkCodeSimilarity(code, previousCodes);
      console.log('Similarity result:', similarityResult);
      let flagged = false;
      let similarity = null;
      if (similarityResult) {
        similarity = similarityResult.max_similarity;
        if (similarity > 0.8) flagged = true;
      }
      // Update submission with similarity info
      submissionDoc.flagged = flagged;
      submissionDoc.similarity = similarity;
      try {
        await submissionDoc.save();
        console.log('Submission saved with similarity info (submissionDoc flow)');
      } catch (err) {
        console.error('Error saving submissionDoc with similarity info:', err);
      }
      // --- End Similarity Check Integration ---

      // Use Kafka in local dev, otherwise judge synchronously
      if (useKafka) {
        // Enqueue submission to Kafka with _id
        const submission = {
          _id: submissionDoc._id,
          userId,
          code,
          language,
          problemId,
          input,
          // ...other fields as needed
        };
        console.log('Sending to Kafka:', submission); // Debug log
        await sendSubmission(submission);
        return res.status(202).json({ message: 'Submission queued for judging.', submissionId: submissionDoc._id });
      } else {
        // Synchronous judging (production/deployment)
        // Get problem details
        const problem = await Problem.findById(problemId);
        if (!problem) {
          return res.status(404).json({ message: 'Problem not found' });
        }
        // Judge logic (same as your old code)
        const filePath = createTempFile(code, language);
        let status = 'accepted';
        let passedCases = 0;
        let errorMessage = '';
        let totalTestCases = problem.testCases.length;
        try {
          await compileCode(filePath, language);
          for (const testCase of problem.testCases) {
            try {
              const output = await runCode(filePath, language, testCase.input);
              if (output.trim() === testCase.output.trim()) {
                passedCases++;
              } else {
                status = 'wrong_answer';
                errorMessage = 'Wrong answer';
                break;
              }
            } catch (err) {
              if (err.message === 'Time limit exceeded') {
                status = 'time_limit_exceeded';
                errorMessage = err.message;
              } else {
                status = 'runtime_error';
                errorMessage = err.message;
              }
              break;
            }
          }
        } catch (err) {
          status = 'compilation_error';
          errorMessage = err.message;
        }
        safeUnlink(filePath);
        if (language === 'cpp' && fs.existsSync(`${filePath}.out`)) {
          safeUnlink(`${filePath}.out`);
        }
        // Update submission in DB
        await Submission.findByIdAndUpdate(
          submissionDoc._id,
          {
            status,
            testCasesPassed: passedCases,
            totalTestCases,
            errorMessage
          }
        );
        return res.status(200).json({
          _id: submissionDoc._id,
          status,
          testCasesPassed: passedCases,
          totalTestCases,
          errorMessage,
          flagged: submissionDoc.flagged,
          similarity: submissionDoc.similarity
        });
      }
    }
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

    // --- Similarity Check Integration ---
    console.log('Before similarity check (submission flow)');
    const previousSubmissions = await Submission.find({
      problemId,
      userId: { $ne: userId }
    }).select('code -_id');
    console.log('Previous submissions found:', previousSubmissions.length);
    const previousCodes = previousSubmissions.map(sub => sub.code);
    const similarityResult = await checkCodeSimilarity(code, previousCodes);
    console.log('Similarity result:', similarityResult);
    let flagged = false;
    let similarity = null;
    if (similarityResult) {
      similarity = similarityResult.max_similarity;
      if (similarity > 0.8) flagged = true;
    }
    submission.flagged = flagged;
    submission.similarity = similarity;
    try {
      await submission.save();
      console.log('Submission saved with similarity info (submission flow)');
    } catch (err) {
      console.error('Error saving submission with similarity info:', err);
    }
    // --- End Similarity Check Integration ---

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
              errorMessage: submission.errorMessage || '',
              flagged: submission.flagged,
              similarity: submission.similarity
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
            errorMessage: submission.errorMessage || '',
            flagged: submission.flagged,
            similarity: submission.similarity
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
        errorMessage: submission.errorMessage || '',
        flagged: submission.flagged,
        similarity: submission.similarity
      });
    } catch (error) {
      submission.status = 'compilation_error';
      submission.errorMessage = error.message;
      await submission.save();
      return res.status(400).json({ message: error.message, flagged: submission.flagged, similarity: submission.similarity });
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

// Get a single submission by ID for verdict polling
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 