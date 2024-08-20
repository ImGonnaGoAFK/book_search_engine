const jwt = require("jsonwebtoken");
// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    let token = req.query.token || req.headers.authorization;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = token.split(" ")[1].trim();
    }

    if (!token) {
      return req;
    }

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded.data;
    } catch (error) {
      console.error("Invalid token:", error.message);
    }
    
    return req;
    
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    if (!secret) {
      throw new Error("JWT secret is undefined or empty!");
    }
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
