import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleLastFmRequest } from './src/server/lastfmHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Last.fm Proxy route
app.use('/api/lastfm', async (req, res) => {
  await handleLastFmRequest(req, res);
});

// Production static assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Needle Drop server listening on port ${PORT}`);
});
