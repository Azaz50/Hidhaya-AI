const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  guestId: { type: String, required: false },
  query: { type: String, required: true },
  title: { type: String, default: '' },
  response: { type: String, required: true },
  language: {
    type: String,
    default: 'english'
  },
  references: [{
    type: {
      type: String,
      enum: ["quran", "hadith"]
    },
    text: String,
    source: String,
    english: String,
    urdu: String,
    hindi: String,
    bengali: String,
    grade: String,
    matchLayer: String
  }],
  isBookmarked: { type: Boolean, default: false },
  metadata: {
    confidence: { type: String, enum: ['high', 'medium', 'low', 'none'], default: 'none' },
    detectedConcepts: [String],
    detectedEmotion: { type: String, default: 'neutral' },
    processingTime: Number,
    matchLayers: [String],
    regeneratedAt: Date,
    totalDocuments: Number
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