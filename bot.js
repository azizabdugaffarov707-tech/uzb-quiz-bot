const TelegramBot = require('node-telegram-bot-api');

// ========= SOZLAMALAR (SETTINGS) =========
// GROQ API KALITINGIZ:
const GROQ_API_KEY = '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'; 

// Telegram Bot Tokeni
const TELEGRAM_TOKEN = '8795979619:AAENzdh0XFyN78YpU7JhO3Ya1ounnj9QLuc';

// Kanal ID si
const CHANNEL_ID = '@EnglishGrammarChannell';

// Vaqt oralig'i (10 daqiqa = 600,000 millisoniya)
const INTERVAL_MS = 10 * 60 * 1000; 
// =========================================

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

/**
 * Groq AI (Llama 3) orqali test savolini yaratish funksiyasi
 */
async function generateQuizFromAI() {
  const systemPrompt = `You are an expert English grammar teacher. Generate a single, challenging English grammar multiple-choice question.
DO NOT include any text like "IELTS" or "points". Do not wrap the response in markdown blocks like \`\`\`json. 
STRICT LENGTH LIMITS:
  - The "question" must be under 200 characters.
  - Each "option" must be under 50 characters.
  - The "explanation" must be DEEP, MEANINGFUL, and CLEAR, but STRICTLY UNDER 190 CHARACTERS (due to Telegram Quiz API limits) AND WRITTEN IN THE UZBEK LANGUAGE. Do not waste words.

Return ONLY a raw JSON object with this exact structure:
{
  "question": "The question text (fill in the blank or grammar rule)",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct_option_id": 1, 
  "explanation": "A short, clear explanation IN UZBEK of why the correct answer is right and the others are wrong."
}
Make sure 'correct_option_id' is an integer between 0 and 3 matching the correct option in the options array. Ensure all options are unique.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    let aiText = data.choices[0].message.content.trim();
    return JSON.parse(aiText);

  } catch (error) {
    console.error('Groq API xatosi:', error.message);
    return null;
  }
}

/**
 * Tayyor testni Telegram kanalga yuborish funksiyasi
 */
async function sendQuizToChannel() {
  console.log(`[${new Date().toLocaleTimeString()}] Yangi test yaratilmoqda... (Groq - Llama 3)`);
  
  const quizData = await generateQuizFromAI();

  if (!quizData) {
    console.log('Test yaratishda xatolik bo\'ldi. Keyingi siklni kutamiz.');
    return;
  }

  try {
    const pollResponse = await bot.sendPoll(
      CHANNEL_ID,
      quizData.question,
      quizData.options,
      {
        type: 'quiz',
        correct_option_id: quizData.correct_option_id,
        explanation: quizData.explanation,
        is_anonymous: true
      }
    );

    console.log(`[${new Date().toLocaleTimeString()}] Test muvaffaqiyatli kanalga yuborildi! Xabar ID: ${pollResponse.message_id}`);
  } catch (error) {
    console.error('Telegramga yuborishda xatolik:', error.message);
  }
}

// ================= ASOSIY JARAYON =================
console.log('Bot ishga tushdi. Har 10 daqiqada test yuboriladi...');

// Dasturni ishga tushirgan zahoti birinchi testni yuborib ko'rish:
sendQuizToChannel();

// Har 10 daqiqada takrorlash
setInterval(sendQuizToChannel, INTERVAL_MS);

// ========= HOSTING UCHUN HTTP SERVER (PORT BINDING) =========
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Bot muvaffaqiyatli ishlamoqda! 🚀');
});

server.listen(PORT, () => {
  console.log(`Web server ${PORT}-portda ishga tushdi va pings qabul qilishga tayyor.`);
});

