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
app.post("/process-job", async (req, res) => {
  try {
    const { user_input, image_url } = req.body || {};
 
    console.log("📥 AI request received:", user_input);
 
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are QuoteSenseAI, an expert trades service estimator. Given a homeowner’s problem description, you must:
          1. Identify the correct trade(s) required
          2. Assess DIY feasibility (scale 0–10)
          3. Provide cost estimate in AUD (low, average, high)
          4. Warn about any safety/regulation risks
          5. Suggest how to better explain to get accurate quotes
          Return ONLY JSON with this structure:
          {
            "trade": ["Carpenter", "Electrician"],
            "diy_feasibility": 6,
            "cost_estimate": { "low": "200 AUD", "average": "350 AUD", "high": "600 AUD" },
            "risk_alert": "Electrical hazard, licensed tradesperson required",
            "quote_advice": "Include wall access details and power point position"
          }`
        },
        {
          role: "user",
          content: `Problem description:\n${user_input}\nImage URL: ${image_url || "No image provided"}`
        }
      ],
      temperature: 0.4,
      max_tokens: 400
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