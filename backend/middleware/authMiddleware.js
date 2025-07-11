const jwt = require("jsonwebtoken");
const User = require('../models/User');
const dotenv = require("dotenv");

dotenv.config();

const requireAuth = async (req, res, next) => {
    console.log('AUTH HEADERS:', req.headers); // Debug log
    // Prefer Authorization header over cookie
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || require('../secKey.json').SECRET_KEY);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { requireAuth };