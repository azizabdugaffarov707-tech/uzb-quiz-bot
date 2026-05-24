# Telegram Grammar Quiz Bot

## Maqsadi
Bu bot **Groq** platformasidagi **Llama‑3.3‑70b‑versatile** modelidan foydalanib, ingliz grammatikasi bo‘yicha qisqa, **chuqur** va **o‘zbek tilida** izohli testlarni avtomatik tarzda yaratadi va belgilangan Telegram kanaliga yuboradi.

## Asosiy Texnologiyalar
- **Node.js** (v18+)
- **Telegram Bot API** (`node-telegram-bot-api`)
- **Groq AI** (HTTP `fetch` orqali `chat/completions`)

## Fayl tuzilishi
```
scratch/
│   bot.js          # Botning asosiy kodi
│   README.md       # Ushbu hujjat
│   package.json    # NPM paket tavsifi (agar mavjud bo‘lsa)
```

## Bot qanday ishlaydi?
1. **Sozlamalar** – API kalitlari, bot tokeni va kanal ID sini `bot.js` da belgilang.
2. **systemPrompt** – AI‑ga quyidagi talablar bilan prompt beriladi:
   - Savol ≤ 200 belg.
   - Har bir variant ≤ 50 belg.
   - Izoh **DEEP, MEANINGFUL, CLEAR**, **UZBEK** tilida, ≤ 190 belg.
3. `generateQuizFromAI()` funksiyasi Groq API‑ga so‘rov yuboradi va JSON javobni qaytaradi.
4. `sendQuizToChannel()` funksiyasi olingan `quizData` ni `bot.sendPoll` orqali kanalga yuboradi. Izoh “Lampochka” (light‑bulb) ikonkasida ko‘rsatiladi.
5. Bot ishga tushganda darhol birinchi testni yuboradi, keyin har **10 daqiqada** (`INTERVAL_MS`) takrorlaydi.

## O‘rnatish va ishga tushurish
```bash
# 1. Node.js o‘rnatilganligiga ishonch hosil qiling
node -v
# 2. Zarur paketlarni o‘rnatish (agar package.json mavjud bo‘lsa)
npm install node-telegram-bot-api
# 3. Botni ishga tushiring
node bot.js
```
> **Eslatma:** Botni ishlatishdan oldin `GROQ_API_KEY` va `TELEGRAM_TOKEN` ni o‘z kalitingiz bilan almashtiring.

## O‘zgartirishlar tarixi (Changelog)
| Vaqt | Qilmish o‘zgartirish | Tavsif |
|------|----------------------|-------|
| 2026‑05‑21 18:33 | `bot.js` faylini Groq API (Llama 3) ga moslashtirdik | API kaliti, model nomi, prompt qo‘shildi |
| 2026‑05‑21 18:34 | Botni har 10 daqiqada test yuborish uchun `setInterval` qo‘shdik |
| 2026‑05‑21 18:39 | Botning izohini **O‘zbek** tilida chiqarish uchun prompt yangilandi |
| 2026‑05‑21 18:42 | Telegram‑ning 200‑belgi limitiga mos ravishda izoh uzunligini **190 belg** ga qisqartirdik |
| 2026‑05‑21 18:44 | Test yuborish jarayonini qo‘lda `node bot.js` bilan ikki marta takrorladik (foydalanuvchi so‘rovi) |
| 2026‑05‑21 18:48 | README.md yaratilgan – loyiha tavsifi, ishlash prinsipi, o‘rnatish, changelog |

## Qanday foydalanish?
- Botni ishga tushiring (`node bot.js`).
- Kanalga avtomatik ravishda testlar yetib boradi.
- **Istalgan vaqtda** `node bot.js` ni yana ishga tushirib, qo‘shimcha test yuborishingiz mumkin.

---
*Ushbu hujjat **TTZ** (Texnik Tavsif Zaxirasi) sifatida yaratilgan va loyiha bo‘yicha bajarilgan barcha o‘zgarishlarni o‘z ichiga oladi.*
