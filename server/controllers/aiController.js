const Conversation = require('../models/Conversation');
const HealthTip = require('../models/HealthTip');
const { generateChatResponse } = require('../services/openaiService');

// @desc    Process chat message and get AI response
// @route   POST /api/ai/chat
// @access  Public
const chatWithAI = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    // Save user message to DB
    const userMessage = await Conversation.create({
      userId,
      role: 'user',
      message
    });

    // Fetch previous context
    const history = await Conversation.find({ userId }).sort({ createdAt: 1 }).limit(10); // get last 10 messages for context

    // Get AI Response
    let aiResponseText;
    try {
      aiResponseText = await generateChatResponse(message, history);
    } catch (error) {
      aiResponseText = "I'm sorry, I am currently experiencing technical difficulties connecting to my AI core. Please try again later.";
    }

    // Save assistant message to DB
    const assistantMessage = await Conversation.create({
      userId,
      role: 'assistant',
      message: aiResponseText
    });

    res.status(201).json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({ message: 'Server error processing AI chat' });
  }
};

// @desc    Process voice message (text transcript) and get AI response
// @route   POST /api/ai/voice
// @access  Public
const handleVoiceChat = async (req, res) => {
  // Voice transcribed text is treated the same as chat text here
  return chatWithAI(req, res);
};

// @desc    Get chat history for a user
// @route   GET /api/ai/history/:userId
// @access  Public
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch conversations sorted chronologically
    const history = await Conversation.find({ userId }).sort({ createdAt: 1 });
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching AI history:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
};

// @desc    Delete chat history for a user
// @route   DELETE /api/ai/history/:userId
// @access  Public
const deleteChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    await Conversation.deleteMany({ userId });
    res.status(200).json({ message: 'Chat history deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI history:', error);
    res.status(500).json({ message: 'Server error deleting chat history' });
  }
};

// @desc    Get random health tips
// @route   GET /api/ai/tips
// @access  Public
const getRandomHealthTips = async (req, res) => {
  try {
    // If we have health tips in DB, use them
    let tips = await HealthTip.aggregate([{ $sample: { size: 5 } }]);
    
    if (tips.length === 0) {
      // Seed default tips if empty
      const defaultTips = [
        { category: 'Hydration', tip: 'Drink at least 2 liters of water daily.' },
        { category: 'Exercise', tip: 'Exercise 30 minutes every day.' },
        { category: 'Sleep', tip: 'Sleep 7-8 hours consistently.' },
        { category: 'Nutrition', tip: 'Include fruits and vegetables in meals.' },
        { category: 'Mental Wellness', tip: 'Practice deep breathing or meditation for 10 minutes a day.' }
      ];
      await HealthTip.insertMany(defaultTips);
      tips = await HealthTip.aggregate([{ $sample: { size: 5 } }]);
    }

    res.json(tips);
  } catch (error) {
    console.error('Error fetching health tips:', error);
    res.status(500).json({ message: 'Server error fetching health tips' });
  }
};

module.exports = {
  chatWithAI,
  handleVoiceChat,
  getChatHistory,
  deleteChatHistory,
  getRandomHealthTips
};
