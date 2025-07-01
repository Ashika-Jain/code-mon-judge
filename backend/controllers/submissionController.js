const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to create a temporary file
const createTempFile = (code, language) => {
  const extension = {
    cpp: '.cpp',
    java: '.java',
    python: '.py'
  }[language];

  const fileName = `temp_${Date.now()}${extension}`;
  const filePath = path.join(__dirname, '../uploads', fileName);
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
      java: `java ${filePath}`,
      python: `python ${filePath}`
    };

    const process = exec(runCommands[language], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Runtime error: ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });

    process.stdin.write(input);
    process.stdin.end();
  });
};

// Submit code
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code, language, input } = req.body;
    const userId = req.user.id;

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

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

      // If custom input is provided, run only with that input
      if (input && input.trim() !== "") {
        const output = await runCode(filePath, language, input);
        // Clean up temporary files
        fs.unlinkSync(filePath);
        if (language === 'cpp') {
          fs.unlinkSync(`${filePath}.out`);
        }
        return res.json({ customInput: input, output });
      }

      // Otherwise, run all test cases as usual
      let passedCases = 0;
      let failed = false;
      for (const testCase of problem.testCases) {
        try {
          const output = await runCode(filePath, language, testCase.input);
          console.log('Test case input:', testCase.input);
          console.log('Expected output:', testCase.output);
          console.log('Actual output:', output);
          console.log('Comparison:', output.trim() === testCase.output.trim());
          if (output.trim() === testCase.output.trim()) {
            passedCases++;
          } else {
            submission.status = 'wrong_answer';
            submission.testCasesPassed = passedCases;
            await submission.save();
            // Clean up temporary files
            fs.unlinkSync(filePath);
            if (language === 'cpp') {
              fs.unlinkSync(`${filePath}.out`);
            }
            return res.json(submission);
          }
        } catch (error) {
          submission.status = 'runtime_error';
          submission.errorMessage = error.message;
          await submission.save();
          // Clean up temporary files
          fs.unlinkSync(filePath);
          if (language === 'cpp') {
            fs.unlinkSync(`${filePath}.out`);
          }
          return res.json(submission);
        }
      }

      // Update submission status
      submission.testCasesPassed = passedCases;
      submission.status = 'accepted';
      await submission.save();

      // Clean up temporary files
      fs.unlinkSync(filePath);
      if (language === 'cpp') {
        fs.unlinkSync(`${filePath}.out`);
      }

      res.json(submission);
    } catch (error) {
      submission.status = 'compilation_error';
      submission.errorMessage = error.message;
      await submission.save();
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Error processing submission' });
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