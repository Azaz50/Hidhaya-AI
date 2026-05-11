const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Chat = require("../models/Chat");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

// User Registration
exports.register = async (req, res) => {
  const { name, email, password, preferredLanguage } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      preferences: {
        language: preferredLanguage || 'english',
        theme: 'light'
      }
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        preferences: user.preferences,
        dailyQuestionCount: user.dailyQuestionCount,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user (me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      preferences: user.preferences,
      dailyQuestionCount: user.dailyQuestionCount,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout (client-side token removal, but we can track it)
exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get chat statistics
    const totalChats = await Chat.countDocuments({ userId: user._id });
    const bookmarkedChats = await Chat.countDocuments({
      userId: user._id,
      isBookmarked: true
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      preferences: user.preferences,
      createdAt: user.createdAt,
      stats: {
        totalChats,
        bookmarkedChats
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      preferences: user.preferences,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { language, theme, notifications, kidsMode } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences
    if (language) {
      user.preferences.language = language;
    }
    if (theme) {
      user.preferences.theme = theme;
    }
    if (notifications !== undefined) {
      user.preferences.notifications = notifications;
    }
    if (kidsMode !== undefined) {
      user.preferences.kidsMode = kidsMode;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      message: "Preferences updated successfully"
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password (generate reset token)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token (simplified - in production use a proper reset flow)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send email with reset link
    // For now, return success
    res.json({
      message: "If the email exists, a reset link has been sent",
      // Remove this in production:
      debugToken: resetToken
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    // Delete user's chats first
    await Chat.deleteMany({ userId: req.user._id });

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Guest User Creation
exports.createGuestUser = async (req, res) => {
  try {
    // Generate a guest user ID
    const guestId = crypto.randomBytes(8).toString('hex');
    const guestToken = jwt.sign(
      { guestId, isGuest: true },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.json({
      guestId,
      token: guestToken,
      message: "Guest session created",
      expiresIn: "7 days"
    });
  } catch (error) {
    console.error("Create guest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};