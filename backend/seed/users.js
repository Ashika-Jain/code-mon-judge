const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    firstname: 'Admin',
    lastname: 'User',
    role: 'admin',
    problemsSolved: [],
    submissions: [],
    solvedProblems: {},
    basicP: 0,
    easyP: 0,
    mediumP: 0,
    hardP: 0,
    problemsSolved: 0,
    submissions: 0
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    firstname: 'John',
    lastname: 'Doe',
    role: 'user',
    problemsSolved: [],
    submissions: [],
    solvedProblems: {},
    basicP: 0,
    easyP: 0,
    mediumP: 0,
    hardP: 0,
    problemsSolved: 0,
    submissions: 0
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'user123',
    firstname: 'Jane',
    lastname: 'Smith',
    role: 'user',
    problemsSolved: [],
    submissions: [],
    solvedProblems: {},
    basicP: 0,
    easyP: 0,
    mediumP: 0,
    hardP: 0,
    problemsSolved: 0,
    submissions: 0
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online-judge', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing users
    await User.deleteMany({});

    // Insert new users
    await User.insertMany(users);

    console.log('Users seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers(); 