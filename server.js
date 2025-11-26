// server.js (fixed)
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
 
const app = express();
 
// Middlewares
app.use(cors());
app.use(express.json());
 
// OpenAI Setup
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in environment variables");
  process.exit(1);
}
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
 
// Health check route
app.get("/", (req, res) => {
  res.send("QuoteSenseAI backend is running 🚀");
});
 
// Core AI endpoint
app.post("/process-job", async (req, res) => {
  try {
    const { user_input, image_url } = req.body || {};
 
    if (!user_input) {
      return res.status(400).json({ error: "❌ user_input is required" });
    }
 
    const prompt = `
You are QuoteSenseAI, an AI assistant for Australian home repair quoting.
 
Analyse this job description and return structured JSON strictly in this format:
 
{
  "trade_recommendation": ["trade1", "trade2"],
  "urgency": "Critical | High | Routine",
  "diy_analysis": {
    "feasibility": "Yes | Limited | No",
    "complexity_score": X,
    "estimated_effort_hours": X,
    "estimated_bunnings_trips": X,
    "risks": ["..."],
    "diy_summary": "..."
  },
  "price_normalisation": {
    "estimated_price_range": "$X - $Y",
    "price_warning_flag": "OK | TOO_LOW | TOO_HIGH",
    "notes_for_user": "..."
  },
  "questions_to_ask_tradie": ["...", "..."]
}
 
Only output valid JSON.
Issue: "${user_input}"
Image: "${image_url || 'None'}"
    `;
 
    console.log("🧠 Calling OpenAI with:", user_input);
 
    // AI call
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt }
      ],
    });
 
    const aiResponse = response.data.choices[0].message.content;
    console.log("🤖 AI Responded Successfully");
 
    return res.json(JSON.parse(aiResponse));
  } catch (error) {
    console.error("🔥 Error in /process-job:", error.message);
    return res.status(500).json({ error: "AI processing error", details: error.message });
  }
});
 
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 QuoteSenseAI backend running on port ${PORT}`));