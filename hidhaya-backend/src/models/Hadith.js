const mongoose = require('mongoose');

const hadithSchema = new mongoose.Schema({
  book: { type: String, index: true },
  idInBook: { type: Number, index: true },
  chapterId: Number,
  chapterName: String,
  arabic: { type: String, index: true },
  english: { type: String, index: true },
  urdu: { type: String, index: true },
  hindi: { type: String, index: true },
  bengali: { type: String, index: true },
  narrator: String,
  grade: String,
  topics: [{ type: String, index: true }]
}, { timestamps: true });

hadithSchema.index({ english: 'text', urdu: 'text', hindi: 'text', bengali: 'text' });
hadithSchema.index({ book: 1, idInBook: 1 });
hadithSchema.index({ topics: 1 });

module.exports = mongoose.model('Hadith', hadithSchema);