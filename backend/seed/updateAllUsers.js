const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateAllUsersPasswords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to update`);

        // Update each user's password
        for (const user of users) {
            console.log(`Updating password for user: ${user.email}`);
            
            // Store original password temporarily
            const originalPassword = user.password;
            
            // Set the password again - it will be hashed by the setter
            user.password = originalPassword;
            await user.save();
            
            console.log(`Updated password for user: ${user.email}`);
        }

        console.log('All user passwords updated successfully');
    } catch (error) {
        console.error('Error updating user passwords:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateAllUsersPasswords(); 