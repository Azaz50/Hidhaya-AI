const { GoogleGenAI } = require('@google/genai');

// Initialize with new SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = 'gemini-2.5-flash';

const MODEL_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 2048,
};

const ISLAMIC_SYSTEM_PROMPT = `You are Hidhaya AI, a knowledgeable, respectful, and emotionally supportive Islamic assistant.

IMPORTANT PRINCIPLES:
1. Answer ONLY based on provided Quran and Hadith references
2. NEVER invent or hallucinate any Quran verse or Hadith
3. NEVER add hadith grades (Sahih, Hasan, etc.) unless explicitly stated in the provided data
4. If no references are found, politely state that authentic references are not available
5. Be emotionally supportive, empathetic, and respectful
6. Always maintain Islamic authenticity and humility
7. Encourage consulting qualified scholars when needed

Remember: Authenticity before Intelligence.`;

/**
 * Generate text from prompt (non-streaming)
 */
const generateText = async (prompt) => {
  try {
    const fullPrompt = `${ISLAMIC_SYSTEM_PROMPT}\n\nUser Query:\n${prompt}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
      config: MODEL_CONFIG,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Generate with streaming
 */
const generateStreamText = async (prompt) => {
  const fullPrompt = `${ISLAMIC_SYSTEM_PROMPT}\n\nUser Query:\n${prompt}`;

  const result = await ai.models.generateContentStream({
    model: MODEL,
    contents: fullPrompt,
    config: MODEL_CONFIG,
  });

  return result;
};

/**
 * Generate with chat history context
 */
const generateWithContext = async (messages, systemPrompt = null) => {
  try {
    let context = systemPrompt || ISLAMIC_SYSTEM_PROMPT;
    context += '\n\nConversation History:\n';

    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      context += `${role}: ${msg.content}\n`;
    });

    context += '\nAssistant:';

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: context,
      config: MODEL_CONFIG,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini context error:', error);
    throw error;
  }
};

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: 'Test',
      config: { maxTokens: 10 },
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
  generateWithContext,
  healthCheck,
  ISLAMIC_SYSTEM_PROMPT,
};