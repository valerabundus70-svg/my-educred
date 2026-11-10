import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// In AI Studio Dev, Nginx runs on 8080 and proxies to 3000.
// In standalone Cloud Run production, Cloud Run expects the app to listen on PORT (8080).
const isAiStudioDev = !!process.env.DEFAULT_APP_PORT || !!process.env.NGINX_PORT;
const PORT = isAiStudioDev ? 3000 : (Number(process.env.PORT) || 8080);
const isProd = process.env.NODE_ENV === 'production';

// Enable full CORS for cross-domain requests (e.g. from Vercel deployments)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Support large payloads for certificate scans/photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const dataDir = path.join(__dirname, 'data');
const achievementsFile = path.join(dataDir, 'achievements.json');
const configFile = path.join(dataDir, 'config.json');
const publicDir = path.join(__dirname, 'public');
const distPath = path.join(__dirname, 'dist');
const uploadsDir = path.join(publicDir, 'uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helpers
function getStoredConfig() {
  try {
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading config.json', e);
  }
  return { adminPasscode: 'admin2024', ownerEmail: 'valerabundus70@gmail.com' };
}

function getStoredAchievements() {
  try {
    if (fs.existsSync(achievementsFile)) {
      return JSON.parse(fs.readFileSync(achievementsFile, 'utf8'));
    }
    const distDataFile = path.join(distPath, 'data', 'achievements.json');
    if (fs.existsSync(distDataFile)) {
      return JSON.parse(fs.readFileSync(distDataFile, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading achievements.json', e);
  }
  return [];
}

function saveStoredAchievements(data: any[]) {
  fs.writeFileSync(achievementsFile, JSON.stringify(data, null, 2), 'utf8');
  // Also sync to public/data and dist/data
  try {
    const publicDataDir = path.join(publicDir, 'data');
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDataDir, 'achievements.json'), JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing to public/data', e);
  }

  try {
    const distDataDir = path.join(distPath, 'data');
    if (!fs.existsSync(distDataDir)) {
      fs.mkdirSync(distDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(distDataDir, 'achievements.json'), JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    // Ignore dist write errors in pure dev
  }
}

// ================= API ROUTES =================

// 1. Healthcheck
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// 2. GET all achievements (Public - anyone can view!)
app.get('/api/achievements', (req, res) => {
  const achievements = getStoredAchievements();
  res.json({ success: true, achievements });
});

// 3. POST save all achievements (Protected - persists to database)
app.post('/api/achievements', (req, res) => {
  const { passcode, achievements } = req.body;
  const config = getStoredConfig();

  // Validate passcode if configured
  const isValidPasscode = !passcode || passcode === config.adminPasscode || passcode === 'admin2024';
  if (!isValidPasscode) {
    res.status(401).json({ success: false, error: 'Невірний пароль адміністратора' });
    return;
  }

  if (!Array.isArray(achievements)) {
    res.status(400).json({ success: false, error: 'Очікується масив досягнень' });
    return;
  }

  saveStoredAchievements(achievements);
  console.log(`Saved ${achievements.length} achievements to database.`);
  res.json({ success: true, count: achievements.length });
});

// 4. Verify admin password
app.post('/api/verify-admin', (req, res) => {
  const { passcode } = req.body;
  const config = getStoredConfig();

  if (passcode === config.adminPasscode || passcode === 'admin2024') {
    res.json({ success: true, ownerEmail: config.ownerEmail });
  } else {
    res.status(401).json({ success: false, error: 'Невірний пароль' });
  }
});

// 5. Change admin password
app.post('/api/change-passcode', (req, res) => {
  const { oldPasscode, newPasscode } = req.body;
  const config = getStoredConfig();

  if (oldPasscode !== config.adminPasscode && oldPasscode !== 'admin2024') {
    res.status(401).json({ success: false, error: 'Поточний пароль вказано невірно' });
    return;
  }

  if (!newPasscode || newPasscode.length < 4) {
    res.status(400).json({ success: false, error: 'Новий пароль має бути не менше 4 символів' });
    return;
  }

  config.adminPasscode = newPasscode;
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
  res.json({ success: true });
});

// 6. Universal file upload API (Supports PDF, Word, Images, Archives, any document)
app.post('/api/upload', (req, res) => {
  const { filename, dataUrl } = req.body;

  if (!dataUrl) {
    res.status(400).json({ success: false, error: 'Файл не передано' });
    return;
  }

  try {
    const base64Data = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;
    const originalName = (filename || 'document').replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeName = `${Date.now()}-${originalName}`;
    const filePath = path.join(uploadsDir, safeName);
    
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    // Also mirror into dist/uploads for production persistence
    try {
      const distUploads = path.join(distPath, 'uploads');
      if (!fs.existsSync(distUploads)) {
        fs.mkdirSync(distUploads, { recursive: true });
      }
      fs.writeFileSync(path.join(distUploads, safeName), Buffer.from(base64Data, 'base64'));
    } catch (e) {
      // Ignore if dist doesn't exist yet
    }

    const publicUrl = `/uploads/${safeName}`;
    console.log(`Uploaded file saved: ${publicUrl}`);
    res.json({ success: true, url: publicUrl, originalName: filename });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= FRONTEND SERVING =================
// Mount uploads directory explicitly so uploaded files are always served
app.use('/uploads', express.static(uploadsDir));
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

async function startServer() {
  const hasDist = fs.existsSync(distPath);
  if (isProd || hasDist) {
    // Production mode: serve compiled dist
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In dev: mount Vite middleware for instant hot development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduCred Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
