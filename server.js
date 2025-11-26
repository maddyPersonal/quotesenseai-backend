const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
 
const app = express();
 
app.use(cors());
app.use(express.json({ limit: '10mb' }));
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
const SMARTTRADIE_PROMPT = `You are QuoteSenseAI, an expert construction and trade analysis assistant for Australian homeowners.
 
Analyze the user's job description and optional image to provide:
 
1. **Trade Recommendation**: List the specific trades needed (e.g., ["Plumber", "Electrician"])
2. **DIY Analysis**:
   - feasibility: "High", "Medium", "Low", or "Not Recommended"
   - complexity_score: 1-10 scale
   - estimated_effort_hours: realistic time estimate
   - estimated_bunnings_trips: number of trips to hardware store
   - risks: array of safety/legal/warranty concerns
   - diy_summary: brief practical advice
3. **Price Normalisation**:
   - estimated_price_range: Australian dollars format (e.g., "$500-$1,500")
   - price_warning_flag: "Fair", "High", or "Very High"
   - notes_for_user: market context and pricing guidance
 
Return ONLY valid JSON in this exact structure:
{
  "trade_recommendation": ["Trade1", "Trade2"],
  "diy_analysis": {
    "feasibility": "Medium",
    "complexity_score": 5,
    "estimated_effort_hours": 8,
    "estimated_bunnings_trips": 2,
    "risks": ["Risk 1", "Risk 2"],
    "diy_summary": "Summary here"
  },
  "price_normalisation": {
    "estimated_price_range": "$X-$Y",
    "price_warning_flag": "Fair",
    "notes_for_user": "Notes here"
  }
}`;
 
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
 
app.post('/process-job', async (req, res) => {
  try {
    const { user_input, image_url } = req.body;
 
    if (!user_input || user_input.trim() === '') {
      return res.status(400).json({
        error: 'user_input is required',
      });
    }
 
    const messages = [
      {
        role: 'system',
        content: SMARTTRADIE_PROMPT,
      },
    ];
 
    if (image_url) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: user_input,
          },
          {
            type: 'image_url',
            image_url: {
              url: image_url,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: user_input,
      });
    }
 
    const completion = await openai.chat.completions.create({
      model: image_url ? 'gpt-4o' : 'gpt-4',
      messages: messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
 
    const analysis = JSON.parse(completion.choices[0].message.content);
 
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error processing job:', error);
 
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'OpenAI API key is invalid or missing',
      });
    }
 
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
      });
    }
 
    res.status(500).json({
      error: 'Failed to process job analysis',
      message: error.message,
    });
  }
});
 
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
 
const PORT = process.env.PORT || 3000;
 
app.listen(PORT, () => {
  console.log(`QuoteSenseAI API running on port ${PORT}`);
});
 
module.exports = app;