require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-judge';

async function addAdmin() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = 'admin@google.com'; // Change as needed
  const password = 'asd';  // Change as needed
  const username = 'admin';
  const firstname = 'Admin';
  const lastname = 'User';

  // Check if admin already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const admin = new User({
    username,
    email,
    password,
    firstname,
    lastname,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin user created:', email);
  process.exit(0);
}

addAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
