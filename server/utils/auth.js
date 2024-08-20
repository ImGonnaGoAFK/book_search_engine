const jwt = require('jsonwebtoken');
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function (req, res, next) {
    let token = req.query.token || req.headers.authorization;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = token.split(' ')[1].trim();
    }

    if (!token) {
      console.log('No token provided');
      return next();
    }

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      console.log('Decoded user data:', req.user);
    } catch (error) {
      console.error('Invalid token:', error.message);
    }

    return next();
  },

  signToken: function ({ username, email, _id }) {
    const payload = { _id, username, email };
    return jwt.sign(payload, secret, { expiresIn: expiration });
  },
};
