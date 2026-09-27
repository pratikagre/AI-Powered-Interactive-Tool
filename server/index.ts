import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleGenerateRequest } from './generate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Request logging
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

// Primary generation proxy endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, mode, existingTopic, failureMode } = req.body;

    if (!prompt && failureMode !== 'server_error') {
      res.status(400).json({
        error: {
          type: 'EMPTY_RESPONSE',
          title: 'Missing Prompt',
          message: 'A text prompt is required to generate study materials.',
        },
      });
      return;
    }

    const result = await handleGenerateRequest({
      prompt: typeof prompt === 'string' ? prompt : '',
      mode,
      existingTopic,
      failureMode,
    });

    res.status(result.status).json(result.body);
  } catch (error: any) {
    console.error('[Server Error in /api/generate]:', error);
    res.status(500).json({
      error: {
        type: 'SERVER_ERROR',
        title: 'Internal Server Error',
        message: error.message || 'An unexpected server error occurred.',
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  🚀 CortexAI Backend Proxy running on:  `);
  console.log(`  http://localhost:${PORT}               `);
  console.log(`=========================================`);
  console.log(`Gemini Key Configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`Groq Key Configured:   ${Boolean(process.env.GROQ_API_KEY)}`);
  console.log(`OpenAI Key Configured: ${Boolean(process.env.OPENAI_API_KEY)}`);
});
