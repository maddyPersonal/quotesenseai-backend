// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
 
// 🚨 If using OpenAI → uncomment this when bug-free
// const OpenAI = require("openai");
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
// 🔊 LOG STARTUP
console.log("🚀 Initializing QuoteSenseAI backend...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT (from Railway):", process.env.PORT);
console.log("OPENAI Key present:", !!process.env.OPENAI_API_KEY);
 
// 🟢 Health check route
app.get("/", (req, res) => {
  res.status(200).send("QuoteSenseAI backend is alive 🚀");
});
 
// 🧪 Temporary test endpoint (NO AI YET)
app.post("/process-job", (req, res) => {
  const { user_input, image_url } = req.body || {};
  console.log("📩 Received POST /process-job:", user_input);
  res.json({
    status: "ok",
    debug_mode: true,
    message: "Backend is active!",
    received_input: user_input,
    ai_connected: !!process.env.OPENAI_API_KEY
  });
});
 
// 👇 DO THIS LAST — start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 QuoteSenseAI backend is listening on http://0.0.0.0:${PORT}`);
});
setInterval(() => {
  console.log("💚 QuoteSenseAI still running...");
}, 30000); // Log every 30 sec to keep event loop active
 