const express = require('express');
const { 
  chatWithAI, 
  handleVoiceChat,
  getChatHistory, 
  deleteChatHistory,
  getRandomHealthTips
} = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/voice', handleVoiceChat);
router.get('/history/:userId', getChatHistory);
router.delete('/history/:userId', deleteChatHistory);
router.get('/tips', getRandomHealthTips);

module.exports = router;
