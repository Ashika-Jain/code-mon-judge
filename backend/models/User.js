const mongoose = require('mongoose');
const { isEmail } = require("validator");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    problemsSolved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    solvedProblems: {
        type: Map,
        of: String,
        default:{},
    },
    basicP: {
        type: Number,
        default: 0
    },
    easyP: {
        type: Number,
        default: 0
    },
    mediumP: {
        type: Number,
        default: 0
    },
    hardP: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    submissions: {
        type: Number,
        default: 0
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing passwords in model method...');
        console.log('Candidate password:', candidatePassword);
        console.log('Stored hashed password:', this.password);
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;