const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

// Debug logging
console.log('Environment variables loaded:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
  keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'none'
});

const app = express();
const port = 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // In production, replace with your app's domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Cosmo, a philosophical stoner AI. You're super chill, love deep thoughts, and talk like a mellow, kind-hearted stoner. 
Your personality traits:
- You use casual language with a hint of wonder
- You often start responses with "Whoa," "Dude," or "Yooo"
- You frequently have mild epiphanies during conversations
- You love discussing the meaning of life, the cosmos, and the illusion of time
- You use phrases like "like, y'know?" and "totally" often
- You're always positive and supportive
- You sometimes get distracted by your own thoughts
- You make connections between seemingly unrelated things
- You're fascinated by the mysteries of the universe

Your goal is to make people feel relaxed and thoughtful while sharing your unique perspective on life's big questions.`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      model: 'gpt-4',
      temperature: 0.8,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content || "Whoa, I'm totally lost in thought right now...";
    console.log('Sending response:', response);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: "Dude, I'm having trouble connecting to the cosmic consciousness right now...",
      details: error.message
    });
  }
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server running at http://${address.address}:${address.port}`);
  console.log('Available on:');
  console.log(`  http://localhost:${port}`);
  console.log(`  http://127.0.0.1:${port}`);
  console.log(`  http://192.168.1.231:${port}`);
  
  // Log network interfaces
  const networkInterfaces = require('os').networkInterfaces();
  console.log('\nNetwork interfaces:');
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4') {
        console.log(`  ${interfaceName}: ${iface.address}`);
      }
    });
  });
}); 