/**
 * Kids Mode Controller
 * Provides simple, child-friendly responses about Islamic topics
 */

const { generateText } = require('../config/gemini');

// Pre-defined kid-friendly topics and responses
const KIDS_TOPICS = [
  { id: 'allah', topic: 'Allah', icon: '🟢', question: 'Who is Allah?' },
  { id: 'prophet', topic: 'Prophet Muhammad', icon: '🕌', question: 'Who was Prophet Muhammad?' },
  { id: 'prayer', topic: 'Prayer (Salat)', icon: '🙌', question: 'How do we pray?' },
  { id: 'quran', topic: 'Quran', icon: '📖', question: 'What is the Quran?' },
  { id: 'dua', topic: 'Duas & Prayers', icon: "🤲", question: 'Teach me a Dua' },
  { id: 'hajj', topic: 'Hajj', icon: '🕋', question: 'What is Hajj?' },
  { id: 'ramadan', topic: 'Ramadan', icon: '🌙', question: 'What is Ramadan?' },
  { id: 'zakat', topic: 'Zakat', icon: '💚', question: 'What is Zakat?' },
  { id: 'manners', topic: 'Good Manners', icon: '😊', question: 'Good manners in Islam' },
  { id: 'stories', topic: 'Islamic Stories', icon: '📚', question: 'Tell me a story from Islamic history' },
  { id: 'animals', topic: 'Animals in Islam', icon: '🐪', question: 'What animals are special in Islam?' },
  { id: 'jannah', topic: 'Jannah (Paradise)', icon: '🌈', question: 'What is Jannah?' }
];

// Kids mode system prompt
const KIDS_PROMPT = `You are a friendly Islamic teacher for children. Your responses must be:
- Very simple and easy to understand (for ages 5-12)
- Short sentences with common words
- Positive and encouraging
- Include fun facts or examples kids can relate to
- Use emojis to make it engaging
- Never mention anything scary, difficult topics, or controversial subjects
- Focus on: Allah's love, Prophet Muhammad's kindness, good manners, duas, prayers, Islamic stories, and basic beliefs

Keep responses under 150 words. Make it feel like a friendly conversation with a caring teacher.`;

// Kids chat
exports.kidsChat = async (req, res) => {
  try {
    const { question } = req.body;
    const { language = 'english' } = req.query;

    if (!question || question.trim().length < 2) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Build prompt for kids mode
    const fullPrompt = `${KIDS_PROMPT}

Language: ${language}

Child's question: ${question}

Please give a simple, child-friendly answer:`;

    try {
      const response = await generateText(fullPrompt);

      res.json({
        question,
        response,
        mode: 'kids',
        language
      });
    } catch (error) {
      console.error("Kids chat AI error:", error);
      // Fallback to a simple response if AI fails
      res.json({
        question,
        response: "That's a great question! Let's learn about it together. Ask me about Allah, Prophet Muhammad, prayer, or Islamic stories!",
        mode: 'kids',
        language
      });
    }

  } catch (error) {
    console.error("Kids chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get available topics
exports.getTopics = async (req, res) => {
  try {
    res.json({
      topics: KIDS_TOPICS,
      message: "These are great topics for kids to learn about!"
    });
  } catch (error) {
    console.error("Get topics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};