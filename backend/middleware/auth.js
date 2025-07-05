const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // Get token from header or cookie
    let token = null;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token in header, check cookie
    if (!token && req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your-super-secret-jwt-key-123456789');
    
    // Get user ID from decoded token (handle different payload structures)
    const userId = decoded.userId || decoded.id || decoded.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    
    // Get user from database
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 