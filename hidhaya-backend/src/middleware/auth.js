const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

      // Check if it's a guest token
      if (decoded.isGuest) {
        req.user = {
          _id: decoded.guestId,
          isGuest: true
        };
        req.guestId = decoded.guestId;
      } else {
        req.user = await User.findById(decoded.id).select("-password");
      }
    } catch (error) {
      console.error("JWT Verification failed:", error.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

// Optional auth - sets user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

      if (decoded.isGuest) {
        req.user = {
          _id: decoded.guestId,
          isGuest: true
        };
        req.guestId = decoded.guestId;
      } else {
        req.user = await User.findById(decoded.id).select("-password");
      }
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

// Premium only route guard
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.isPremium && !req.user.isGuest) {
    return res.status(403).json({
      message: "Premium subscription required for this feature",
      upgradeUrl: "/premium"
    });
  }

  next();
};

module.exports = { auth, optionalAuth, requirePremium };