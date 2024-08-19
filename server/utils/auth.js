const jwt = require("jsonwebtoken");

require('dotenv').config();

// Set token secret and expiration date
const secret = process.env.JWT_SECRET || 'fallbackSecret';
const expiration = process.env.JWT_EXPIRATION || '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    let token = req.query.token || req.headers.authorization;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1].trim();
    }

    const context = { user: null };
    if (!token) {
      return context;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      context.user = data;
    } catch (error) {
      console.error("Invalid token:", error.message);
    }

    return context;
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    if (!secret) {
      throw new Error("JWT secret is undefined or empty!");
    }
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
