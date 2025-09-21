const jwt = require("jsonwebtoken");
require('dotenv').config()

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // looks like "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded; // now you can access req.user.id, req.user.email
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


