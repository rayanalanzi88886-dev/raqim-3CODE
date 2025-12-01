import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import brainRoutes from './routes/brain';
import workbenchRoutes from './routes/workbench';
import chatRoutes from './routes/chat';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/brain', brainRoutes);
app.use('/api/workbench', workbenchRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Raqim AI Server is running' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Raqim AI Server running on http://localhost:${PORT}`);
});
