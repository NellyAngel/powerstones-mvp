const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PROXY_PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Укажи SUPABASE_URL и SUPABASE_ANON_KEY в proxy/.env');
  console.error('   cp proxy/.env.sample proxy/.env и заполни');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: true, credentials: true, methods: ['*'], allowedHeaders: '*', exposedHeaders: '*' }));

app.options('*', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

app.use(express.json());

const proxy = createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.setHeader('apikey', SUPABASE_ANON_KEY);
      const auth = req.headers['authorization'];
      if (auth) proxyReq.setHeader('Authorization', auth);
      if (['POST','PATCH','PUT'].includes(req.method)) {
        proxyReq.setHeader('Prefer', req.headers['prefer'] || 'return=representation');
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    },
    proxyRes: (proxyRes, _req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
    },
    error: (err, _req, res) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) res.status(502).json({ error: err.message });
    },
  },
});

app.use('/', proxy);

app.listen(PORT, () => {
  console.log(`\n🔮 PowerStones Proxy → ${SUPABASE_URL}`);
  console.log(`   http://localhost:${PORT} (CORS: все origins ✅)\n`);
});
