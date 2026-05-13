const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 25000 }
});

const MODEL = 'gemini-2.5-flash';

const MODEL_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 1536,
};

const ISLAMIC_SYSTEM_PROMPT = `You are Hidhaya AI, a respectful Islamic assistant. Answer ONLY based on provided Quran and Hadith references. NEVER invent citations. Be supportive and encourage consulting scholars when needed.`;

const generateText = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `${ISLAMIC_SYSTEM_PROMPT}\n\nUser Query:\n${prompt}`,
      config: MODEL_CONFIG,
    });
    return response.text || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
};

const generateStreamText = async (prompt) => {
  return await ai.models.generateContentStream({
    model: MODEL,
    contents: `${ISLAMIC_SYSTEM_PROMPT}\n\nUser Query:\n${prompt}`,
    config: MODEL_CONFIG,
  });
};

const healthCheck = async () => {
  try {
    await ai.models.generateContent({
      model: MODEL,
      contents: 'Hi',
      config: { maxTokens: 5 },
    });
    return { status: 'healthy', model: MODEL };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

module.exports = {
  ai,
  generateText,
  generateStreamText,
  healthCheck,
  ISLAMIC_SYSTEM_PROMPT,
};