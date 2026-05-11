const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  forgotPassword,
  deleteAccount,
  createGuestUser,
  getMe,
  logout
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/guest", createGuestUser);
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/me", auth, getMe);
router.post("/logout", auth, logout);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.patch("/preferences", auth, updatePreferences);
router.post("/change-password", auth, changePassword);
router.delete("/account", auth, deleteAccount);

module.exports = router;