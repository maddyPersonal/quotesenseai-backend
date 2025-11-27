// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
 
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
 
// Temporary POST route
app.post("/process-job", (req, res) => {
  const { user_input, image_url } = req.body || {};
  console.log("📩 Request →", req.method, req.url, user_input);
  res.json({
    status: "ok",
    debug_mode: true,
    received_input: user_input,
    ai_connected: !!process.env.OPENAI_API_KEY
  });
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