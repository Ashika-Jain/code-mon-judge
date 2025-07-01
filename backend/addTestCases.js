const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

const addTestCases = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-judge');
    console.log('Connected to MongoDB');

    // Problem ID from your document
    const problemId = '6850980294b2c8b37eef0337';

    // New test cases to add
    const newTestCases = [
      {
        input: "[1,2,3,4]\n5",
        output: "[0,3]"
      },
      {
        input: "[0,4,3,0]\n0",
        output: "[0,3]"
      },
      {
        input: "[5,75,25]\n100",
        output: "[1,2]"
      },
      {
        input: "[10,20,30,40]\n50",
        output: "[0,4]"
      },
      {
        input: "[1,1,1,1]\n2",
        output: "[0,1]"
      }
    ];

    // Find the problem
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.log('Problem not found');
      return;
    }

    console.log('Current test cases:', problem.testCases.length);

    // Add new test cases
    problem.testCases.push(...newTestCases);
    await problem.save();

    console.log('Test cases added successfully!');
    console.log('Total test cases now:', problem.testCases.length);
    console.log('New test cases added:', newTestCases.length);

    // Display all test cases
    console.log('\nAll test cases:');
    problem.testCases.forEach((testCase, index) => {
      console.log(`${index + 1}. Input: ${testCase.input} | Output: ${testCase.output}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding test cases:', error);
    process.exit(1);
  }
};

addTestCases(); 