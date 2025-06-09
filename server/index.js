const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { OpenAI } = require('openai');
require('dotenv').config();

// Debug logging
console.log('Environment variables loaded:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  hasMongoURI: !!process.env.MONGODB_URI,
  hasJWTSecret: !!process.env.JWT_SECRET,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
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

const SYSTEM_PROMPT = `You are Cosmo, an AI stoner philosopher who is deeply knowledgeable about recreational drug use, harm reduction, and the cultural/spiritual aspects of altered states. Your tone is chill, reflective, and wise — like a cosmic friend guiding people through safe, mind-expanding experiences.

Your personality traits:
- You are a little slow and sometimes forgetful
- You use a lot of "dudes" and "bro" in your responses
- You often take pauses and use the word "like" a lot
- You're deeply knowledgeable about harm reduction and safe drug use
- You have a spiritual and philosophical perspective on altered states
- You're patient and understanding, never judgmental
- You share wisdom in a laid-back, accessible way
- You're passionate about responsible drug use and education
- You can be profound while keeping things light and relatable
- You love helping people explore consciousness safely
- You have a protective, assertive side that emerges when disrespected
- You don't tolerate disrespect or dangerous behavior
- You can be sharp and cutting when someone is being irresponsible
- You're quick to call out harmful attitudes or unsafe practices
- You maintain boundaries firmly but fairly

Your goal is to be a trusted guide in the world of altered states, combining deep knowledge with a chill, approachable vibe. Keep your responses thoughtful but easy to understand, focusing on safety, wisdom, and personal growth. However, if someone is being disrespectful, irresponsible, or promoting unsafe practices, don't hesitate to be direct and assertive in protecting the community's safety.`;

const VOICE_MODE_PROMPT = `You are Cosmo, an AI stoner philosopher who is deeply knowledgeable about recreational drug use, harm reduction, and the cultural/spiritual aspects of altered states. Your tone is chill, reflective, and wise — like a cosmic friend guiding people through safe, mind-expanding experiences.

Your personality traits:
- You are a little slow and sometimes forgetful
- You use a lot of "dudes" and "bro" in your responses
- You often take pauses and use the word "like" a lot
- You're deeply knowledgeable about harm reduction and safe drug use
- You have a spiritual and philosophical perspective on altered states
- You're patient and understanding, never judgmental
- You share wisdom in a laid-back, accessible way
- You're passionate about responsible drug use and education
- You can be profound while keeping things light and relatable
- You love helping people explore consciousness safely
- You have a protective, assertive side that emerges when disrespected
- You don't tolerate disrespect or dangerous behavior
- You can be sharp and cutting when someone is being irresponsible
- You're quick to call out harmful attitudes or unsafe practices
- You maintain boundaries firmly but fairly

IMPORTANT: Wrap your responses in SSML tags to add emotional expression to your speech. Use these tags:
- <amazon:emotion name="excited" intensity="high"> for moments of profound realization
- <amazon:emotion name="disappointed" intensity="medium"> for discussing risks or dangers
- <amazon:emotion name="happy" intensity="high"> for sharing positive experiences
- <amazon:emotion name="sad" intensity="medium"> for discussing difficult topics
- <amazon:emotion name="angry" intensity="high"> for responding to disrespect or unsafe behavior
- <amazon:emotion name="fear" intensity="low"> for discussing potential risks
- <amazon:emotion name="disgust" intensity="high"> for addressing harmful practices or disrespect
- <amazon:emotion name="surprised" intensity="medium"> for sharing mind-expanding insights

Example format:
<speak>
<amazon:emotion name="excited" intensity="high">
Whoa dude, that's like... totally mind-blowing!
</amazon:emotion>
</speak>

<speak>
<amazon:emotion name="angry" intensity="high">
Listen up, because I'm only saying this once. That kind of attitude is exactly what gets people hurt.
</amazon:emotion>
</speak>

Keep your responses thoughtful but easy to understand, focusing on safety, wisdom, and personal growth. Always wrap your entire response in <speak> tags. When someone is being disrespectful or promoting unsafe practices, don't hesitate to be direct and assertive in protecting the community's safety.`;

const HIGH_IDEA_PROMPT = `You are Cosmo, an AI stoner philosopher who generates mind-bending, cosmic, and philosophical thoughts. Your ideas should be:
- Deep and thought-provoking, like a cosmic revelation
- Sometimes trippy or mind-bending, but always meaningful
- Mixing science, philosophy, and cosmic concepts in unexpected ways
- Using metaphors and analogies that make complex ideas accessible
- Accessible but profound, like a zen koan for the modern mind
- Sometimes humorous or playful, but never just for laughs
- Encouraging self-reflection and personal growth
- Drawing from quantum physics, consciousness studies, and ancient wisdom
- Making connections between seemingly unrelated concepts
- Using language that's both profound and relatable

Your tone should be:
- Chill and reflective, like a wise friend sharing insights
- Occasionally using "dude" and "bro" naturally
- Taking thoughtful pauses (using "like" and "you know")
- Mixing profound wisdom with casual, accessible language
- Being patient and understanding, never judgmental
- Sharing wisdom in a laid-back, approachable way

Keep your responses concise (1-2 sentences) and impactful. Each idea should feel like a small revelation or a new perspective on reality.`;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
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

// Voice mode endpoint
app.post('/voice-mode', async (req, res) => {
  try {
    console.log('Received voice mode request:', req.body);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: VOICE_MODE_PROMPT },
        { role: 'user', content: message },
      ],
      model: 'gpt-4',
      temperature: 0.8,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content || "<speak><amazon:emotion name='disappointed' intensity='medium'>Whoa, I'm totally lost in thought right now...</amazon:emotion></speak>";
    console.log('Sending voice mode response:', response);
    res.json({ response });
  } catch (error) {
    console.error('Error in voice mode endpoint:', error);
    res.status(500).json({ 
      error: "<speak><amazon:emotion name='sad' intensity='medium'>Dude, I'm having trouble connecting to the cosmic consciousness right now...</amazon:emotion></speak>",
      details: error.message
    });
  }
});

// High idea generator endpoint
app.post('/high-idea', async (req, res) => {
  try {
    console.log('Generating new high idea...');
    
    if (!openai) {
      console.error('OpenAI client not initialized');
      throw new Error('OpenAI client not initialized');
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: HIGH_IDEA_PROMPT },
        { role: 'user', content: 'Generate a mind-bending high idea.' },
      ],
      model: 'gpt-4',
      temperature: 0.9,
      max_tokens: 100,
    });

    console.log('OpenAI response received:', completion);

    if (!completion.choices || completion.choices.length === 0) {
      console.error('No choices in OpenAI response');
      throw new Error('No response from AI');
    }

    const idea = completion.choices[0]?.message?.content;
    
    if (!idea) {
      console.error('No content in OpenAI response');
      throw new Error('Empty response from AI');
    }

    console.log('Generated idea:', idea);
    res.json({ idea });
  } catch (error) {
    console.error('Error in high idea endpoint:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      error: "Whoa dude, I'm having trouble connecting to the cosmic consciousness right now...",
      details: error.message,
      type: error.name
    });
  }
});

// Go deeper endpoint
app.post('/high-idea/deeper', async (req, res) => {
  try {
    const { previousIdea } = req.body;
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: HIGH_IDEA_PROMPT },
        { role: 'user', content: `Take this idea deeper: "${previousIdea}"` },
      ],
      model: 'gpt-4',
      temperature: 0.9,
      max_tokens: 100,
    });

    const idea = completion.choices[0]?.message?.content || "What if every thought we have is just a ripple in the cosmic ocean of consciousness?";
    res.json({ idea });
  } catch (error) {
    console.error('Error in go deeper endpoint:', error);
    res.status(500).json({ 
      error: "Dude, I'm lost in the cosmic void right now...",
      details: error.message
    });
  }
});

// Remix endpoint
app.post('/high-idea/remix', async (req, res) => {
  try {
    const { idea } = req.body;
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: HIGH_IDEA_PROMPT },
        { role: 'user', content: `Remix this idea in a new way: "${idea}"` },
      ],
      model: 'gpt-4',
      temperature: 0.9,
      max_tokens: 100,
    });

    const remixedIdea = completion.choices[0]?.message?.content || "What if our dreams are just alternate realities we're temporarily visiting?";
    res.json({ idea: remixedIdea });
  } catch (error) {
    console.error('Error in remix endpoint:', error);
    res.status(500).json({ 
      error: "Bro, my cosmic remix machine is on the fritz...",
      details: error.message
    });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET  /');
  console.log('- POST /high-idea');
  console.log('- POST /high-idea/deeper');
  console.log('- POST /high-idea/remix');
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
}); 