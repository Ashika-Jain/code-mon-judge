const mongoose = require('mongoose');
require('dotenv').config();

// Debug print

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Kafka consumer connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
const { Kafka } = require('kafkajs');
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

const kafka = new Kafka({
  clientId: 'code-judge-worker',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'judge-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'submissions', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const submission = JSON.parse(message.value.toString());
      console.log('Received submission:', submission);

      // Fetch problem details
      const problem = await Problem.findById(submission.problemId);
      if (!problem) {
        console.log('Problem not found for submission:', submission.problemId);
        return;
      }

      // Create temp file
      const filePath = createTempFile(submission.code, submission.language);
      let status = 'accepted';
      let passedCases = 0;
      let errorMessage = '';
      let totalTestCases = problem.testCases.length;

      try {
        await compileCode(filePath, submission.language);
        for (const testCase of problem.testCases) {
          try {
            const output = await runCode(filePath, submission.language, testCase.input);
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
      if (submission.language === 'cpp' && fs.existsSync(`${filePath}.out`)) {
        safeUnlink(`${filePath}.out`);
      }

      // Update submission in DB (if _id is present)
      if (submission._id) {
        // Ensure _id is a string or ObjectId
        const id = typeof submission._id === 'object' && submission._id.$oid
          ? submission._id.$oid
          : submission._id;
        console.log('Type of _id:', typeof id, id);
        try {
          const result = await Submission.findByIdAndUpdate(
            id,
            {
              status,
              verdict: status, // Add verdict for frontend compatibility
              testCasesPassed: passedCases,
              totalTestCases,
              errorMessage
            },
            { new: true }
          );
          if (result) {
            console.log('Judged submission and updated DB:', id, 'Status:', status);
          } else {
            console.log('Submission not found in DB for _id:', id);
          }
        } catch (err) {
          console.error('Error updating submission in DB:', err);
        }
      } else {
        console.log('No _id in submission, skipping DB update. Judging result:', status);
      }
    },
  });
};

run().catch(console.error);