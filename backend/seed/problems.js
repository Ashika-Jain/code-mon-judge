const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sampleProblems = [
  {
    title: "Two Sum",
    name: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]`,
    difficulty: "Easy",
    tags: "Array, Hash Table",
    hints: "Try using a hash map to store the numbers you've seen so far",
    constraints: "2 <= nums.length <= 104\n-109 <= nums[i] <= 109\n-109 <= target <= 109",
    showtc: "nums = [2,7,11,15], target = 9",
    showoutput: "[0,1]",
    inputLink: "https://example.com/two-sum-input.txt",
    outputLink: "https://example.com/two-sum-output.txt",
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]"
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]"
      },
      {
        input: "[3,3]\n6",
        output: "[0,1]"
      }
    ]
  },
  {
    title: "Palindrome Number",
    name: "Palindrome Number",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.
An integer is a palindrome when it reads the same forward and backward.

Example 1:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

Example 2:
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

Example 3:
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.`,
    difficulty: "Easy",
    tags: "Math, String",
    hints: "Try converting the number to a string and comparing characters",
    constraints: "-231 <= x <= 231 - 1",
    showtc: "x = 121",
    showoutput: "true",
    inputLink: "https://example.com/palindrome-input.txt",
    outputLink: "https://example.com/palindrome-output.txt",
    testCases: [
      {
        input: "121",
        output: "true"
      },
      {
        input: "-121",
        output: "false"
      },
      {
        input: "10",
        output: "false"
      }
    ]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    name: "Longest Substring Without Repeating Characters",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.`,
    difficulty: "Medium",
    tags: "String, Hash Table, Sliding Window",
    hints: "Try using a sliding window approach with a hash set",
    constraints: "0 <= s.length <= 5 * 104\ns consists of English letters, digits, symbols and spaces",
    showtc: "s = 'abcabcbb'",
    showoutput: "3",
    inputLink: "https://example.com/longest-substring-input.txt",
    outputLink: "https://example.com/longest-substring-output.txt",
    testCases: [
      {
        input: "abcabcbb",
        output: "3"
      },
      {
        input: "bbbbb",
        output: "1"
      },
      {
        input: "pwwkew",
        output: "3"
      }
    ]
  }
];

const seedProblems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-judge');
    console.log('Connected to MongoDB');

    // Create an admin user if it doesn't exist
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      // Create new admin user
      admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',  // Will be hashed by the pre-save hook
        firstname: 'Admin',
        lastname: 'User',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created');
    } else {
      // Update existing admin user's password
      admin.password = 'admin123';  // Will be hashed by the pre-save hook
      await admin.save();
      console.log('Admin user password updated');
    }

    // Add admin as creator for all problems
    const problemsWithCreator = sampleProblems.map(problem => ({
      ...problem,
      createdBy: admin._id,
      submissions: []
    }));

    // Clear existing problems and insert new ones
    await Problem.deleteMany({});
    await Problem.insertMany(problemsWithCreator);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedProblems(); 