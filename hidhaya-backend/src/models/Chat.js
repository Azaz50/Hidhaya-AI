const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  references: [{
    type: { type: String, enum: ["quran", "hadith"] },
    text: String, source: String, english: String, urdu: String, hindi: String, bengali: String, grade: String
  }],
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  guestId: { type: String, required: false },
  title: { type: String, default: '' },
  language: { type: String, default: 'english' },
  messages: [messageSchema],
  isBookmarked: { type: Boolean, default: false },
  metadata: {
    confidence: { type: String, enum: ['high', 'medium', 'low', 'none'], default: 'none' },
    detectedConcepts: [String],
    regeneratedAt: Date
  }
}, { timestamps: true });

// Indexes for efficient querying
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ guestId: 1, createdAt: -1 });
chatSchema.index({ isBookmarked: 1 });
chatSchema.index({ query: 'text' });
chatSchema.index({ response: 'text' });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;