import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Serve static files from frontend directory
const frontendPath = path.join(process.cwd(), 'frontend');
app.use(express.static(frontendPath));

// Serve index.html as the starting page
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Middleware server running on http://localhost:${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using this port or use a different port.`);
    console.error(`To find and kill the process: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

