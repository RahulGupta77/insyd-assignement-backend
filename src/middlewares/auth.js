const jwt = require("jsonwebtoken");
const { User } = require("../models");

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, "ThisIsSecretToken");

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { userAuth };
