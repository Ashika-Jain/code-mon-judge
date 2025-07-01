const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminUser = await User.findOne({ email: 'admin@example.com' });
        if (!adminUser) {
            console.log('Admin user not found');
            return;
        }

        // Set the password directly - it will be hashed by the setter
        adminUser.password = 'admin123';
        await adminUser.save();

        console.log('Admin password updated successfully');
    } catch (error) {
        console.error('Error updating admin password:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateAdminPassword(); 