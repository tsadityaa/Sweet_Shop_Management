'use strict';

const { verifyAccessToken } = require('../utils/tokens');

function auth(required = true) {
  return function (req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      let token = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
      }

      if (!token) {
        if (!required) {
          return next();
        }
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = { auth };
