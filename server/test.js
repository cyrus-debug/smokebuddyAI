const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

// Test configuration
const app = express();
const port = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Simple chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);
    
    // Echo back the message for testing
    res.json({ 
      response: `Test response: ${message}` 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Test error' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log('Test endpoints:');
  console.log(`  GET  http://localhost:${port}/test`);
  console.log(`  POST http://localhost:${port}/chat`);
}); 