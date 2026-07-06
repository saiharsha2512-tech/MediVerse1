const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateChatResponse = async (userMessage, history = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are the MediVerse AI Health Assistant. 
Your goal is to provide preliminary health guidance, analyze symptoms, suggest hydration, suggest rest, and suggest healthy habits.
CRITICAL RULES:
- You must NEVER give a final medical diagnosis.
- If symptoms might indicate something more serious, ALWAYS recommend consulting a healthcare professional or doctor.
- If symptoms are severe (e.g., chest pain, breathing difficulty, stroke symptoms, severe bleeding), advise the user to seek IMMEDIATE emergency medical attention.
- Keep your responses concise, empathetic, and professional.`
      },
      // Optionally map previous history here if needed
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.message
      })),
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.5,
      max_tokens: 250,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to communicate with AI service.");
  }
};

module.exports = {
  generateChatResponse
};
