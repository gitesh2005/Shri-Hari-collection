const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer '))
      token = auth.split(' ')[1];

    if (!token)
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ success: false, message: 'User no longer exists' });

    req.user = user;   // attach user to request
    next();

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = protect;
