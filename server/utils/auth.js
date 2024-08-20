const jwt = require("jsonwebtoken");
// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

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
      console.log("Using JWT Secret:", secret);
      const decoded = jwt.verify(token, secret);
      context.user = decoded;
    } catch (error) {
      console.error("Invalid token:", error.message);
      context.error = {
        message: "Authentication failed",
        code: "AUTH_FAILED"
      };
    }
    
    return context;
    
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    if (!secret) {
      throw new Error("JWT secret is undefined or empty!");
    }
    console.log("JWT Secret:", secret);
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
