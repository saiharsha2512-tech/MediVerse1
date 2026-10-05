const { OpenAI } = require('openai');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

const SYSTEM_PROMPT = `You are the MediVerse AI Health Assistant.
Your goal is to provide preliminary health guidance, explain symptoms in simple language, suggest safe general self-care, and encourage appropriate medical care.

CRITICAL RULES:
- Never give a definitive medical diagnosis.
- If symptoms could be serious, recommend consulting a qualified healthcare professional.
- If symptoms are severe (such as chest pain, breathing difficulty, stroke symptoms, severe bleeding, seizure, or loss of consciousness), advise immediate emergency medical attention.
- Keep responses concise, empathetic, and professional.
- Do not recommend prescription medicines or give medication dosages unless clearly framed as information to discuss with a clinician.`;

const generateChatResponse = async (userMessage, history = []) => {
  if (!apiKey || !openai) {
    throw new Error('OPENAI_API_KEY is not configured on the backend.');
  }

  try {
    const input = [
      { role: 'developer', content: SYSTEM_PROMPT },
      ...history
        .filter(msg => msg && msg.message)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.message
        })),
      { role: 'user', content: userMessage }
    ];

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input,
      max_output_tokens: 300
    });

    if (!response.output_text) {
      throw new Error('OpenAI returned an empty response.');
    }

    return response.output_text.trim();
  } catch (error) {
    console.error('OpenAI API Error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    throw new Error('Failed to communicate with AI service.');
  }
};

module.exports = {
  generateChatResponse
};
