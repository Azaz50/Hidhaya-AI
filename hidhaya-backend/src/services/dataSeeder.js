/**
 * Data Seeder - Loads Quran and Hadith into MongoDB with indexes
 * Run: node src/services/dataSeeder.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Quran = require('../models/Quran');
const Hadith = require('../models/Hadith');

const HADITH_SOURCES = [
  'bukhari', 'muslim', 'ahmed', 'nasai', 'abudawud',
  'ibnmajah', 'aladab_almufrad', 'bulugh_almaram', 'malik',
  'mishkat_almasabih', 'nawawi40', 'qudsi40', 'riyad_assalihin',
  'shahwaliullah40', 'shamail_muhammadiah'
];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hidhaya_ai');
  console.log('✅ MongoDB Connected for seeding');
};

const seedQuran = async () => {
  const quranPath = path.join(__dirname, '../data/quran/quran.json');
  if (!fs.existsSync(quranPath)) {
    console.log('⚠️ Quran data not found');
    return;
  }

  const quranData = JSON.parse(fs.readFileSync(quranPath, 'utf8'));
  const quranDocs = [];

  for (const chapterKey in quranData) {
    const verses = quranData[chapterKey];
    if (Array.isArray(verses)) {
      for (const verse of verses) {
        quranDocs.push({
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text || '',
          english: verse.EnglishTarjuma || '',
          urdu: verse.UrduTarjuma || '',
          hindi: verse.HindiTarjuma || '',
          bengali: verse.BengaliTarjuma || '',
          romanUrdu: verse.RomanUrduTarjuma || '',
          topics: extractTopics(verse.EnglishTarjuma || '')
        });
      }
    }
  }

  // Clear and insert
  await Quran.deleteMany({});
  await Quran.insertMany(quranDocs);
  console.log(`✅ Seeded ${quranDocs.length} Quran verses`);
};

const seedHadith = async () => {
  const hadithDir = path.join(__dirname, '../data/hadith');
  let totalHadiths = 0;

  for (const source of HADITH_SOURCES) {
    const hadithPath = path.join(hadithDir, `${source}.json`);
    if (!fs.existsSync(hadithPath)) continue;

    try {
      const data = JSON.parse(fs.readFileSync(hadithPath, 'utf8'));
      let hadiths = [];
      if (Array.isArray(data)) hadiths = data;
      else if (data.hadiths) hadiths = data.hadiths;
      else for (const key of Object.keys(data)) { if (Array.isArray(data[key])) { hadiths = data[key]; break; } }

      const hadithDocs = hadiths.map(h => ({
        book: source,
        idInBook: h.idInBook || h.id || 1,
        chapterId: h.chapterId || h.chapter || 1,
        chapterName: h.chapterName || '',
        arabic: h.arabic || '',
        english: typeof h.english === 'object' ? (h.english.text || '') : (h.english || ''),
        urdu: typeof h.urdu === 'object' ? (h.urdu.text || '') : (h.urdu || ''),
        hindi: typeof h.hindi === 'object' ? (h.hindi.text || '') : (h.hindi || ''),
        bengali: typeof h.bengali === 'object' ? (h.bengali.text || '') : (h.bengali || ''),
        narrator: h.narrator || '',
        grade: h.grade || '',
        topics: extractTopics(
          (typeof h.english === 'object' ? h.english.text : h.english || '') + ' ' +
          (typeof h.urdu === 'object' ? h.urdu.text : h.urdu || '')
        )
      }));

      await Hadith.deleteMany({ book: source });
      await Hadith.insertMany(hadithDocs);
      totalHadiths += hadithDocs.length;
      console.log(`  ✅ ${source}: ${hadithDocs.length} hadiths`);
    } catch (e) {
      console.log(`  ⚠️ ${source}: Failed - ${e.message}`);
    }
  }

  console.log(`✅ Seeded ${totalHadiths} total hadiths`);
};

// Simple topic extraction
const extractTopics = (text) => {
  const topics = [];
  const keywords = {
    'sabr': ['patience', 'patient', 'sabr'],
    'shukr': ['gratitude', 'thanks', 'shukr'],
    'iman': ['faith', 'belief', 'iman'],
    'taqwa': ['piety', 'taqwa', 'god-consciousness'],
    'prayer': ['prayer', 'salat', 'namaz', 'dua'],
    'zakat': ['zakat', 'charity', 'sadaqah'],
    'fasting': ['fasting', 'ramadan', 'sawm'],
    'hajj': ['hajj', 'pilgrimage'],
    'shirk': ['shirk', 'polytheism'],
    'tawheed': ['tawheed', 'monotheism'],
    'forgiveness': ['forgiveness', 'repentance', 'tawbah'],
    'mercy': ['mercy', 'rahmah', 'compassion'],
    'anger': ['anger', 'angry', 'rage'],
    'honesty': ['honesty', 'truthful', 'sidiq'],
    'patience': ['patience', 'endurance'],
    'knowledge': ['knowledge', 'ilm', 'learn']
  };

  const lower = text.toLowerCase();
  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) topics.push(topic);
  }
  return topics;
};

const seed = async () => {
  try {
    await connectDB();
    console.log('🚀 Starting data seeding...\n');

    await seedQuran();
    await seedHadith();

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();