const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// ============================================================
// PowerStones Supabase Proxy
// Решает проблему CORS — проксирует запросы к Supabase
// Принимает те же пути, что Supabase REST/Auth API
// ============================================================

const PORT = process.env.PROXY_PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gjirslmhrlaqlsgbxsjo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY не указан! Укажи в .env или переменной окружения.');
  process.exit(1);
}

const app = express();

// Разрешаем ВСЕ origins — никаких CORS проблем
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: '*',
  exposedHeaders: '*',
}));

// OPTIONS preflight для всех путей
app.options('*', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Парсинг JSON
app.use(express.json());

// ----- Универсальный прокси -----
// Проксирует ВСЕ запросы на Supabase, добавляя CORS и API ключи
const universalProxy = createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, _res) => {
      proxyReq.setHeader('apikey', SUPABASE_ANON_KEY);

      // Прокидываем Bearer токен авторизации пользователя
      const authHeader = req.headers['authorization'] || req.headers['x-user-auth'];
      if (authHeader) {
        proxyReq.setHeader('Authorization', authHeader);
      }

      // Для POST/PATCH — просим возвращать данные
      if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
        const prefer = req.headers['prefer'] || 'return=representation';
        proxyReq.setHeader('Prefer', prefer);
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    },
    proxyRes: (proxyRes, _req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', '*');
    },
    error: (err, _req, res) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Proxy error', message: err.message });
      }
    },
  },
});

// Всё идёт через прокси
app.use('/', universalProxy);

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║        🔮 PowerStones Supabase Proxy          ║
╠════════════════════════════════════════════════╣
║  Прокси запущен на http://localhost:${PORT}      ║
║                                                ║
║  Любые запросы → ${SUPABASE_URL}  ║
║                                                ║
║  CORS: ✅ Все origins разрешены                ║
║  🚀 Готов принимать запросы от фронтенда      ║
╚════════════════════════════════════════════════╝
  `);
});
