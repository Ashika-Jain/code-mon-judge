const mongoose = require('mongoose');
require('dotenv').config();

const DBConnection = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-judge';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error while connectint to MongoDB: ', error);
        process.exit(1);
    }
};

module.exports = DBConnection;
