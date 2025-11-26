// server.js (fixed for OpenAI v4+ and 502 issues)
const express = require("express");
const cors = require("cors");
require("dotenv").config();
 
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
const app = express();
app.use(cors());
app.use(express.json());
 
// Health check route
app.get("/", (req, res) => {
  res.send("QuoteSenseAI backend is running 🚀");
});
 
// Main route
app.post("/process-job", async (req, res) => {
  try {
    const { user_input, image_url } = req.body || {};
    if (!user_input) return res.status(400).json({ error: "Missing user_input" });
 
    const prompt = `
You are QuoteSenseAI, an AI assistant for Australian home repair quoting.
 
Return strictly JSON:
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
 
Assume user is a first-time homeowner.
Issue: "${user_input}"
Image: "${image_url || "None"}"
    `;
 
    console.log("🧠 Processing:", user_input);
 
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-3.5-turbo" if needed
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: prompt }]
    });
 
    const result = response.choices?.[0]?.message?.content;
 
    return res.json(JSON.parse(result));
  } catch (error) {
    console.error("🔥 Error in /process-job:", error);
    return res.status(500).json({ error: "AI backend error", details: error.message });
  }
});
 
// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 QuoteSenseAI backend running on port ${PORT}`);
});
 