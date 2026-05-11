const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestId: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: true,
    enum: ['quran', 'hadith']
  },
  reference: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  translation: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'english'
  }
}, {
  timestamps: true
});

// Indexes
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ guestId: 1, createdAt: -1 });
bookmarkSchema.index({ type: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;