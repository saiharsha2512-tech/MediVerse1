// Local MediVerse health assistant.
// No external AI provider or API key is required.

const generateChatResponse = async (userMessage, history = []) => {
  const message = String(userMessage || '').trim();
  const text = message.toLowerCase();

  if (!message) {
    return "Tell me what you're feeling, and I'll help you with some general health guidance.";
  }

  if (/^(hi|hello|hey|hii|good morning|good afternoon|good evening)\b/.test(text)) {
    return "Hi! I'm your MediVerse Health Assistant. Tell me about your symptoms or health concern, and I'll give you some general guidance.";
  }

  if (text.includes('chest pain') || text.includes('breathing difficulty') ||
      text.includes('difficulty breathing') || text.includes('severe bleeding') ||
      text.includes('unconscious') || text.includes('seizure') ||
      text.includes('stroke') || text.includes('heart attack')) {
    return "Some of the symptoms you mentioned can require urgent medical attention. Please seek immediate medical care or contact your local emergency service. I can provide general information, but I can't diagnose an emergency.";
  }

  if (text.includes('fever')) {
    return "For a fever, rest, drink plenty of fluids, and monitor your temperature. If the fever is very high, lasts for several days, or comes with severe symptoms, please consult a healthcare professional.";
  }

  if (text.includes('headache')) {
    return "For a mild headache, try resting in a quiet place, staying hydrated, and getting enough sleep. If headaches are severe, sudden, frequent, or accompanied by other concerning symptoms, please see a doctor.";
  }

  if (text.includes('cough') || text.includes('sore throat')) {
    return "For a mild cough or sore throat, stay hydrated, rest, and consider warm fluids. If symptoms become severe, persist, or you have trouble breathing, consult a healthcare professional.";
  }

  if (text.includes('stomach pain') || text.includes('nausea')) {
    return "For mild stomach discomfort or nausea, try small amounts of water or other clear fluids and eat light foods if you can tolerate them. Severe or persistent pain, repeated vomiting, or blood in vomit or stool should be assessed by a doctor.";
  }

  if (text.includes('dizziness')) {
    return "If you're feeling dizzy, sit or lie down somewhere safe and drink some water. Avoid driving or operating machinery until you feel better. If dizziness is severe, recurring, or happens with fainting, chest pain, weakness, or difficulty speaking, seek medical care promptly.";
  }

  if (text.includes('fatigue') || text.includes('tired')) {
    return "Fatigue can have many causes, including poor sleep, stress, dehydration, or illness. Try getting consistent sleep, staying hydrated, eating balanced meals, and taking reasonable breaks. If it persists or is worsening, consider talking with a doctor.";
  }

  if (text.includes('stress') || text.includes('anxiety')) {
    return "For stress or anxiety, try slow deep breathing, a short walk, regular sleep, and taking a break from screens. If anxiety is persistent, overwhelming, or affecting daily life, consider speaking with a qualified mental-health professional.";
  }

  if (text.includes('back pain') || text.includes('body ache')) {
    return "For mild muscle or back pain, gentle movement, rest, and avoiding activities that worsen the pain may help. If the pain is severe, follows an injury, persists, or comes with weakness or numbness, please consult a doctor.";
  }

  if (text.includes('sleep')) {
    return "For better sleep, keep a consistent bedtime, reduce caffeine late in the day, limit screens before bed, and keep your room comfortable and quiet. If sleep problems continue for weeks, consider discussing them with a healthcare professional.";
  }

  if (text.includes('water') || text.includes('hydration')) {
    return "Staying hydrated is important. Drink water regularly throughout the day and increase fluids when you're exercising or in hot weather. Your needs can vary depending on your health and activity level.";
  }

  if (text.includes('doctor') || text.includes('should i see')) {
    return "If your symptoms are persistent, worsening, severe, or interfering with normal activities, it's a good idea to consult a qualified healthcare professional. For emergency symptoms, seek immediate medical attention.";
  }

  if (text.includes('medicine') || text.includes('medication')) {
    return "I can provide general health information, but I shouldn't prescribe medicines or dosages. A doctor or pharmacist can recommend the appropriate medicine based on your symptoms, medical history, allergies, and other medications.";
  }

  if (history.length > 0) {
    return "Thanks for explaining that. Based on what you've shared, focus on rest, hydration, and monitoring your symptoms. If you tell me your main symptom, how long you've had it, and how severe it is, I can give more relevant general guidance.";
  }

  return "I understand. Tell me your main symptom, how long you've had it, and how severe it feels. I'll give you some general health guidance. Remember, I can't provide a medical diagnosis.";
};

module.exports = {
  generateChatResponse
};
