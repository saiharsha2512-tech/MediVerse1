import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiMic, FiMicOff, FiDownload, FiTrash2, FiMoon, FiSun } from 'react-icons/fi';
import { LuBrainCircuit } from 'react-icons/lu';
import { AiOutlineWarning } from 'react-icons/ai';
import { RiRobot2Line } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import styles from './AICheck.module.css';
import { useAuth } from '../../context/AuthContext';

const quickSymptoms = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Chest Pain', 'Dizziness', 'Body Ache',
  'Back Pain', 'Stomach Pain', 'Sore Throat', 'Anxiety', 'Stress'
];

const followUpSuggestions = [
  'Tell me more', 'Should I see a doctor?', 'Home remedies', 'Possible causes', 'Prevention tips'
];

const emergencyKeywords = [
  'chest pain', 'breathing difficulty', 'stroke', 'heart attack', 'unconscious', 'severe bleeding', 'seizure'
];

const AICheck = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [healthTips, setHealthTips] = useState([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('aiDarkMode') === 'true');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const { user } = useAuth();
  
  const userId = user ? user._id : 'mock-user-123';
  const userName = user ? (user.name || user.phoneNumber || 'User') : 'Guest';

  useEffect(() => {
    localStorage.setItem('aiDarkMode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-theme-override');
    } else {
      document.body.classList.remove('dark-theme-override');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark-theme-override');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchHistory();
    fetchHealthTips();
    initSpeechRecognition();
  }, []);

  useEffect(() => {
    scrollToBottom();
    checkEmergency(inputValue);
  }, [messages, isTyping, inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/ai/history/${userId}`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([
          {
            _id: 'welcome',
            role: 'assistant',
            message: `Hello ${userName}! I'm your AI Health Assistant powered by MediVerse. I can help you understand your symptoms and provide preliminary health guidance. How are you feeling today?`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching AI history:", error);
      toast.error('Failed to load chat history');
    }
  };

  const fetchHealthTips = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ai/tips');
      if (res.data) setHealthTips(res.data);
    } catch (error) {
      console.error("Error fetching health tips:", error);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/ai/history/${userId}`);
      setMessages([{
        _id: 'welcome',
        role: 'assistant',
        message: `Chat history cleared. How can I help you today?`,
        createdAt: new Date().toISOString()
      }]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error('Failed to clear history');
    }
  };

  const checkEmergency = (text) => {
    const lowerText = text.toLowerCase();
    const hasEmergency = emergencyKeywords.some(keyword => lowerText.includes(keyword));
    setIsEmergency(hasEmergency);
  };

  const initSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error('Voice input failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (textOrEvent) => {
    let msgText = inputValue;
    
    if (textOrEvent && textOrEvent.preventDefault) {
      textOrEvent.preventDefault();
    } else if (typeof textOrEvent === 'string') {
      msgText = textOrEvent;
    }
    
    if (!msgText.trim()) return;

    const userMsg = {
      _id: Date.now().toString(),
      role: 'user',
      message: msgText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const endpoint = isRecording ? '/api/ai/voice' : '/api/ai/chat'; // Using voice endpoint if it was from voice, otherwise chat
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        userId,
        message: userMsg.message
      });
      
      setIsTyping(false);
      if (res.data && res.data.assistantMessage) {
        setMessages(prev => [...prev, res.data.assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      toast.error('Failed to get response from AI');
    }
  };

  const handleChipClick = (symptom) => {
    const newVal = inputValue ? `${inputValue}, ${symptom}` : symptom;
    setInputValue(newVal);
  };

  const handleFollowUpClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('MediVerse AI Health Assistant - Chat History', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableData = messages.map(msg => [
      formatTime(msg.createdAt),
      msg.role === 'user' ? 'You' : 'MediVerse AI',
      msg.message
    ]);

    doc.autoTable({
      startY: 36,
      head: [['Time', 'Sender', 'Message']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [88, 86, 214] }, // MediVerse purple
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' }
      }
    });

    doc.save('MediVerse_AI_Chat.pdf');
    toast.success('Chat history downloaded as PDF');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`${styles.pageContainer} ${darkMode ? styles.darkMode : ''}`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconContainer}>
            <LuBrainCircuit className={styles.headerIcon} />
          </div>
          <div className={styles.titleInfo}>
            <h2>AI Health Assistant</h2>
            <p>Powered by MediVerse AI</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => setDarkMode(!darkMode)} className={styles.iconBtn} title="Toggle Dark Mode">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <button onClick={downloadPDF} className={styles.iconBtn} title="Download Chat PDF">
              <FiDownload />
            </button>
            <button onClick={clearHistory} className={styles.iconBtn} title="Clear Chat History">
              <FiTrash2 />
            </button>
          </div>
        </div>
        
        <div className={styles.disclaimerCard}>
          <AiOutlineWarning className={styles.warningIcon} />
          <div className={styles.disclaimerText}>
            <h4>Important Disclaimer</h4>
            <p>This AI assistant provides general health information only and does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.</p>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {isEmergency && (
          <div className={styles.emergencyCard}>
            <AiOutlineWarning className={styles.emergencyIcon} />
            <div className={styles.emergencyText}>
              <h4>⚠ Emergency Symptoms Detected</h4>
              <p>Please seek immediate medical attention or contact emergency services.</p>
            </div>
          </div>
        )}

        <div className={styles.symptomsSection}>
          <h3 className={styles.sectionTitle}>Quick Symptoms</h3>
          <div className={styles.chipsContainer}>
            {quickSymptoms.map((symptom, index) => (
              <button 
                key={index} 
                className={styles.symptomChip}
                onClick={() => handleChipClick(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.chatContainerWrapper}>
          <div className={styles.chatArea}>
            <div className={styles.messagesList}>
              {messages.map((msg, index) => {
                const isLastAssistantMessage = index === messages.length - 1 && msg.role === 'assistant';
                
                return (
                  <div key={msg._id} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper}`}>
                    {msg.role === 'assistant' && (
                      <div className={styles.messageHeader}>
                        <RiRobot2Line className={styles.assistantAvatar} />
                        <span className={styles.assistantName}>MediVerse AI</span>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className={styles.messageHeaderUser}>
                        <span className={styles.userName}>{userName}</span>
                        <div className={styles.userAvatarWrapper}>
                          <span className={styles.userAvatarInitials}>{userName.charAt(0)}</span>
                        </div>
                      </div>
                    )}
                    <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                      <p>{msg.message}</p>
                      <span className={styles.timestamp}>{formatTime(msg.createdAt)}</span>
                    </div>
                    
                    {/* Follow-up chips only after the latest assistant message */}
                    {isLastAssistantMessage && !isTyping && (
                      <div className={styles.followUpContainer}>
                        {followUpSuggestions.map((sugg, i) => (
                          <button 
                            key={i} 
                            className={styles.followUpChip}
                            onClick={() => handleFollowUpClick(sugg)}
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {isTyping && (
                <div className={`${styles.messageWrapper} ${styles.assistantWrapper}`}>
                  <div className={styles.messageHeader}>
                    <RiRobot2Line className={styles.assistantAvatar} />
                    <span className={styles.assistantName}>MediVerse AI</span>
                  </div>
                  <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
                    <div className={styles.typingIndicator}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form className={styles.inputArea} onSubmit={handleSendMessage}>
            <button 
              type="button" 
              className={`${styles.voiceBtn} ${isRecording ? styles.recording : ''}`}
              onClick={toggleRecording}
              title={isRecording ? "Stop Recording" : "Start Voice Input"}
            >
              {isRecording ? <FiMicOff /> : <FiMic />}
            </button>
            <input 
              type="text" 
              placeholder="Describe your symptoms..." 
              className={styles.textInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button type="submit" className={styles.sendButton} disabled={!inputValue.trim()}>
              <FiSend />
            </button>
          </form>
        </div>

        <div className={styles.healthTipsCard}>
          <h3 className={styles.tipsTitle}>Health Tips</h3>
          {healthTips.length > 0 ? (
            <ul className={styles.tipsList}>
              {healthTips.map((t, idx) => (
                <li key={idx}><strong>{t.category}:</strong> {t.tip}</li>
              ))}
            </ul>
          ) : (
            <p>Loading health tips...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICheck;
