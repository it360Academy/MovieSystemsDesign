import dotenv from 'dotenv';
dotenv.config();

import { Router, Request, Response } from 'express';
import { MovieService } from '../services/movieService';
import { QueryRequest, QueryResponse } from '../../shared/types/api';

const router = Router();
let apiKey = process.env.OPENAI_API_KEY;

// Clean and validate API key
if (apiKey) {
  apiKey = apiKey.trim();
  // Check for common issues
  if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
    console.warn('Warning: API key appears to have quotes. Removing them...');
    apiKey = apiKey.slice(1, -1).trim();
  }
  if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
    console.warn('Warning: API key appears to have single quotes. Removing them...');
    apiKey = apiKey.slice(1, -1).trim();
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.warn('Warning: API key should start with "sk-". Current format may be incorrect.');
    console.warn(`First 10 characters: ${apiKey.substring(0, 10)}...`);
  }
  
  console.log(`OpenAI API key detected (length: ${apiKey.length}). LLM features enabled.`);
  console.log(`API key preview: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
} else {
  console.warn('Warning: OPENAI_API_KEY not set. LLM features will use mock mode.');
  console.warn('To set: PowerShell: $env:OPENAI_API_KEY="your_key" | CMD: set OPENAI_API_KEY=your_key');
}

const movieService = new MovieService(apiKey);

router.post('/query', async (req: Request<{}, QueryResponse, QueryRequest>, res: Response<QueryResponse>) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt) {
      return res.status(400).json({
        columns: [],
        rows: [],
        summary: 'Prompt is required'
      });
    }
    const result = await movieService.query(prompt, options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      columns: [],
      rows: [],
      summary: `Error: ${error.message}`
    });
  }
});

export default router;

