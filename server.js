// ==============================
// 🚀 QuoteSenseAI Backend (v1.0)
// ==============================
 
const express = require("express");
const cors = require("cors");
require("dotenv").config();
 
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
const app = express();
 
// ==============================
// 🔧 Middleware & Setup
// ==============================
app.set("trust proxy", true);
app.use(cors({ origin: "*", methods: "GET,POST,OPTIONS" }));
app.options("*", (req, res) => res.sendStatus(200));
app.use(express.json());
 
// ==============================
// 🩺 Health Check
// ==============================
app.get("/", (req, res) => {
  res.status(200).send("QuoteSenseAI backend is alive 🚀");
});
 
// ==============================
// 🤖 AI Logic – Enhanced v1.0
// ==============================
app.post("/process-job", async (req, res) => {
  try {
    const { user_input, image_url } = req.body || {};
 
    console.log("📥 New AI request:", user_input);
 
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are QuoteSenseAI, an expert Australian trade diagnosis AI for home repair and renovation jobs.
 
Return ONLY clean JSON following this structure (no markdown, no extra text):
 
{
  "trade": ["Plumber", "Carpenter"],
  "confidence": 0-100,
  "diy_feasibility": 0-10,
  "complexity": "Low | Medium | High",
  "cost_estimate": {
    "low": "AUD 150",
    "average": "AUD 250",
    "high": "AUD 400"
  },
  "is_expensive": false,
  "emergency_level": "Low | Medium | High",
  "risk_alert": "E.g. water damage risk or electrical hazard",
  "clarifying_questions": ["Ask 2-3 customer-specific questions"],
  "recommendation": "Next step summary in one sentence"
}
 
Context:
• Most users are first-time homeowners or unskilled DIY people.
• Reflect Melbourne metro pricing (GST included).
• If unclear, add clarifying questions.
• If high complexity or low DIY, encourage using professional.
• NEVER return explanation text, only valid JSON.
`
        },
        {
          role: "user",
          content: `Problem Description: ${user_input}
Image Provided: ${image_url || "none"}`
        }
      ],
      temperature: 0.3,
      max_tokens: 600
    });
 
    console.log("🤖 Raw AI output:", response.choices[0].message.content);
 
    // Validate JSON output
    let ai_output;
    try {
      ai_output = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      console.error("⚠️ JSON parse failed:", err);
      return res.status(500).json({
        status: "error",
        message: "AI returned invalid JSON"
      });
    }
 
    res.json({ status: "success", raw_input: user_input, ai_output });
 
  } catch (error) {
    console.error("❌ AI Error:", error);
    res.status(500).json({
      status: "error",
      message: "AI processing failed",
      details: error.message
    });
  }
});
 
// ==============================
// 🚫 Fallback Route
// ==============================
app.use((req, res) => {
  console.warn("⚠️ Unhandled route:", req.method, req.url);
  res.status(404).send("Endpoint not found – QuoteSenseAI API");
});
 
// ==============================
// 🚀 Start Server
// ==============================
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";
 
app.listen(PORT, HOST, () =>
  console.log(`🟢 QuoteSenseAI backend listening at http://${HOST}:${PORT}`)
);
 
// Keep alive
setInterval(() => {
  console.log("💚 QuoteSenseAI still running...");
}, 30000);