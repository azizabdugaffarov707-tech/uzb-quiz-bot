const TelegramBot = require('node-telegram-bot-api');

// ========= SOZLAMALAR (SETTINGS) =========
const GROQ_API_KEY = process.env.GROQ_API_KEY; 
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || '@EnglishGrammarChannell';
const INTERVAL_MS = 10 * 60 * 1000; 

const TOPICS = [
  "Present Simple vs Present Continuous",
  "Past Simple vs Past Continuous",
  "Present Perfect vs Past Simple",
  "Future Tenses (will, going to, present continuous)",
  "Conditionals (Zero, First, Second, Third)",
  "Passive Voice",
  "Reported Speech",
  "Modal Verbs (can, could, should, must, might)",
  "Gerunds and Infinitives",
  "Prepositions of Time and Place",
  "Phrasal Verbs",
  "Relative Clauses (who, which, that)",
  "Articles (a, an, the, zero article)",
  "Quantifiers (some, any, much, many, a few)",
  "Question Tags",
  "Adjectives and Adverbs (Comparatives, Superlatives)",
  "Causative Form (have/get something done)"
];
// =========================================

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

async function generateQuizFromAI() {
  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  
  const systemPrompt = `You are an expert English grammar teacher. Generate a single, challenging English grammar multiple-choice question.
IMPORTANT: The grammar topic for this specific question MUST BE EXACTLY about: "${randomTopic}". Ensure the question is highly unique and not repeated.
DO NOT include any text like "IELTS" or "points". 
CRITICAL INSTRUCTION FOR OPTIONS: DO NOT prefix options with letters or numbers like A), B), 1., 2.. Just provide the exact word or phrase!
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
}`;

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
        temperature: 0.9,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let aiText = data.choices[0].message.content.trim();
    return JSON.parse(aiText);
  } catch (error) {
    console.error('Groq API xatosi:', error.message);
    return null;
  }
}

async function sendQuizToChannel() {
  console.log(`[${new Date().toLocaleTimeString()}] Yangi test yaratilmoqda...`);
  
  const quizData = await generateQuizFromAI();

  if (!quizData) {
    console.log('Test yaratishda xatolik bo\'ldi.');
    return;
  }

  // --- JAVOBLARNI TASODIFIY ARALASHTIRISH (SHUFFLE) ---
  let options = quizData.options;
  let correctText = options[quizData.correct_option_id];

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  quizData.correct_option_id = options.indexOf(correctText);
  quizData.options = options;
  // ----------------------------------------------------

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
    console.log(`[${new Date().toLocaleTimeString()}] Test muvaffaqiyatli kanalga yuborildi!`);
  } catch (error) {
    console.error('Telegramga yuborishda xatolik:', error.message);
  }
}

// ================= ASOSIY JARAYON =================
console.log('Bot ishga tushdi. Har 10 daqiqada tasodifiy mavzuda test yuboriladi...');
sendQuizToChannel();
setInterval(sendQuizToChannel, INTERVAL_MS);

// ========= HOSTING UCHUN HTTP SERVER (PORT BINDING) =========
const http = require('http');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Bot muvaffaqiyatli ishlamoqda! 🚀');
});
server.listen(PORT, () => {
  console.log(`Web server ${PORT}-portda ishga tushdi.`);
});
