const mongoose = require('mongoose');

const quranSchema = new mongoose.Schema({
  chapter: { type: Number, index: true },
  verse: { type: Number, index: true },
  text: { type: String, index: true },
  english: { type: String, index: true },
  urdu: { type: String, index: true },
  hindi: { type: String, index: true },
  bengali: { type: String, index: true },
  romanUrdu: { type: String },
  topics: [{ type: String, index: true }]
}, { timestamps: true });

quranSchema.index({ english: 'text', urdu: 'text', hindi: 'text', bengali: 'text' });
quranSchema.index({ topics: 1 });

module.exports = mongoose.model('Quran', quranSchema);