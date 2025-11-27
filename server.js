// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
const app = express();
 
// Required for HTTPS → HTTP proxy
app.set('trust proxy', true);
 
// CORS and JSON
app.use(cors({ origin: "*", methods: "GET,POST,OPTIONS" }));
app.options('*', (req, res) => res.sendStatus(200));
app.use(express.json());
 
// Logs
console.log("🚀 QuoteSenseAI starting...");
console.log("PORT:", process.env.PORT);
console.log("OPENAI key present:", !!process.env.OPENAI_API_KEY);
 
// Health route
app.get("/", (req, res) => {
  res.status(200).send("QuoteSenseAI backend is alive 🚀");
});
 
// AI-enabled version
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `You are QuoteSenseAI, an expert Australian trade diagnosis AI for home repair and renovation jobs.
Your job is to analyse user job descriptions and return ONLY clean JSON (no markdown, no explanation).
 
Strictly follow this response format:
 
{
  "trade": ["Carpenter", "Plumber"],        // One or more trades
  "confidence": 0-100,                      // Confidence in trade match
  "diy_feasibility": 0-10,                  // 0 = not possible, 10 = easy DIY
  "complexity": "Low | Medium | High",      // Real-world job complexity
  "cost_estimate": {
    "low": "AUD 120",                       // Typical low-end cost
    "average": "AUD 250",
    "high": "AUD 450"
  },
  "is_expensive": true/false,               // If customer quote seems overpriced
  "emergency_level": "Low | Medium | High", // High = urgent attention needed
  "risk_alert": "String describing safety or compliance risk",
  "clarifying_questions": [
    "List 2-3 questions to help refine the quote request, if required"
  ],
  "recommendation": "Single sentence next step or improvement suggestion"
}
 
Context:
- Many users are *first-time homeowners* or *DIY hopefuls unaware of complexity*.
- QuoteSenseAI should gently educate users on why tradies charge what they charge.
- Cost should reflect *Melbourne metro median pricing, GST included*.
- If details are ambiguous, ask clarifying questions.
- Never return explanation text. Output must be valid JSON only.
`
    },
    {
      role: "user",
      content: `Problem Description: ${user_input}
Image Provided: ${image_url || "none"}`
    }
  ],
  temperature: 0.4,
  max_tokens: 600
});
 
    const aiResult = response.choices[0].message.content;
 
    res.json({
      status: "success",
      raw_input: user_input,
      ai_output: JSON.parse(aiResult)
    });
 
  } catch (error) {
    console.error("❌ AI Error:", error);
    res.status(500).json({
      status: "error",
      message: "AI processing failed",
      details: error.message
    });
  }
});
 
// Fallback
app.use((req, res) => {
  console.warn("⚠️ Unhandled route:", req.method, req.url);
  res.status(200).send("QuoteSenseAI API is active, but route not defined.");
});
 
// Start server
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () =>
  console.log(`🟢 QuoteSenseAI backend listening at http://${HOST}:${PORT}`)
);
 
// Keep process alive
setInterval(() => {
  console.log("💚 QuoteSenseAI still running...");
}, 30000);