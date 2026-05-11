const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  dailyQuestionCount: { type: Number, default: 0 },
  lastQuestionDate: { type: Date, default: Date.now },
  preferences: {
    language: { type: String, enum: ['english', 'hindi', 'urdu', 'bengali', 'roman_urdu'], default: 'english' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    notifications: { type: Boolean, default: true },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  guestId: { type: String },
  isGuest: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Reset daily question count if it's a new day
userSchema.methods.resetDailyCount = async function () {
  const today = new Date().toDateString();
  const lastDate = this.lastQuestionDate ? this.lastQuestionDate.toDateString() : null;

  if (lastDate !== today) {
    this.dailyQuestionCount = 0;
    this.lastQuestionDate = new Date();
    await this.save();
  }
};

// Check if user can ask more questions
userSchema.methods.canAskQuestion = async function () {
  await this.resetDailyCount();

  const limit = this.isPremium ? Infinity : 20;
  return this.dailyQuestionCount < limit;
};

userSchema.methods.incrementQuestionCount = async function () {
  await this.resetDailyCount();
  this.dailyQuestionCount += 1;
  await this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;