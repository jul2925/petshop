require('dotenv').config();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const { exec } = require('child_process');
const os = require('os');
const net = require('net');

// ===== SECURITY UTILITIES =====
const ALLOWED_PRINTER_CHARS = /^[a-zA-Z0-9_\-\.\s\\:]+$/;
function sanitizePrinterName(name) {
  if (typeof name !== 'string') return '';
  return name.replace(/[;&|`$(){}!<>]/g, '');
}
function sanitizeInput(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen || 500).replace(/[<>"'&]/g, function(c) {
    return { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c] || '';
  });
}
function isSafePath(filePath, baseDir) {
  const resolved = path.resolve(baseDir, filePath);
  return resolved.startsWith(path.resolve(baseDir));
}
const loginAttempts = {};
function checkRateLimit(ip) {
  const now = Date.now();
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > loginAttempts[ip].resetAt) { loginAttempts[ip] = { count: 0, resetAt: now + 15 * 60 * 1000 }; }
  loginAttempts[ip].count++;
  return loginAttempts[ip].count <= 10;
}
function resetLoginAttempts(ip) { loginAttempts[ip] = { count: 0, resetAt: 0 }; }

const PORT = process.env.PORT || 8000;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const CERT_FILE = path.join(__dirname, 'cert.pem');
const KEY_FILE = path.join(__dirname, 'key.pem');
const DB_FILE = path.join(__dirname, 'shared_data.json');

// ===== MONGODB =====
let mongoClient = null;
let mongoDb = null;
const DB_NAME = process.env.MONGO_DB_NAME || 'petshop_prado';
const COLLECTION = 'appdata';
const DATA_KEY = { _id: 'main' };
const BACKUP_DIR = path.join(__dirname, 'backups');

// ===== AUTH =====
let currentData = null;

const AUTH_SECRET_FILE = path.join(__dirname, '.auth_secret');
function getAuthSecret() {
  try { return fs.readFileSync(AUTH_SECRET_FILE, 'utf8').trim(); } catch (e) {}
  const s = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(AUTH_SECRET_FILE, s, 'utf8');
  return s;
}
const AUTH_SECRET = getAuthSecret();

function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(pw || ''), salt, 100000, 64, 'sha512').toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(pw, stored) {
  if (!stored) return false;
  // Novo formato: salt:hash (PBKDF2)
  if (stored.includes(':')) {
    const parts = stored.split(':');
    const salt = parts[0];
    const hash = crypto.pbkdf2Sync(String(pw || ''), salt, 100000, 64, 'sha512').toString('hex');
    try { return crypto.timingSafeEqual(Buffer.from(parts[1], 'hex'), Buffer.from(hash, 'hex')); } catch(e) { return false; }
  }
  // Formato antigo: SHA-256 sem salt (fallback para migracao)
  const oldHash = crypto.createHash('sha256').update(String(pw || '')).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(stored, 'hex'), Buffer.from(oldHash, 'hex')); } catch(e) { return false; }
}

function sanitizeUser(u) {
  if (!u) return u;
  const { password, passwordHash, ...safe } = u;
  return safe;
}

function sanitizeUsers(users) {
  return Array.isArray(users) ? users.map(sanitizeUser) : users;
}

function makeToken(user) {
  const payload = 'psp:' + user.id;
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload + ':' + user.passwordHash).digest('hex');
  return payload + '.' + sig;
}

function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const i = token.indexOf('.');
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const parts = payload.split(':');
  if (parts.length !== 2 || parts[0] !== 'psp') return null;
  const id = parseInt(parts[1]);
  if (!id) return null;
  const users = currentData && Array.isArray(currentData.users) ? currentData.users : [];
  const user = users.find(u => u.id === id && u.active);
  if (!user) return null;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload + ':' + user.passwordHash).digest('hex');
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return user;
}

// Normaliza usuarios: converte senha em texto puro para hash e nunca persiste senha
function normalizeUsers(data, prev) {
  if (!data || !Array.isArray(data.users)) return;
  data.users.forEach(u => {
    if (u.passwordHash) {
      // Se o hash antigo (SHA-256 sem salt), re-hash com novo formato
      if (!u.passwordHash.includes(':')) {
        const oldHash = u.passwordHash;
        // Nao podemos re-hash sem a senha original, entao mantemos o formato antigo por agora
        // O verifyPassword vai tentar o formato novo primeiro
      }
      delete u.password;
      return;
    }
    const existing = prev && Array.isArray(prev.users) ? prev.users.find(x => x.id === u.id) : null;
    if (typeof u.password === 'string' && u.password !== '') {
      u.passwordHash = hashPassword(u.password);
    } else if (existing && existing.passwordHash) {
      u.passwordHash = existing.passwordHash;
    } else if (existing && existing.password) {
      u.passwordHash = hashPassword(existing.password);
    }
    delete u.password;
  });
}

// ===== AUTOMATIC DAILY BACKUP =====
let lastBackupDate = '';
function autoBackup(data) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const f = path.join(BACKUP_DIR, `shared_data_${today}.json`);
    if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(data, null, 2), 'utf8');
    const files = fs.readdirSync(BACKUP_DIR).filter(x => x.startsWith('shared_data_')).sort();
    const MAX_BACKUPS = 14;
    while (files.length > MAX_BACKUPS) {
      const old = files.shift();
      fs.unlinkSync(path.join(BACKUP_DIR, old));
    }
    lastBackupDate = today;
  } catch (e) {
    console.warn('[BACKUP] Falha:', e.message);
  }
}

async function connectMongo() {
  const mode = process.env.MONGO_MODE || 'local';
  let uri;
  if (mode === 'atlas' && process.env.MONGO_ATLAS_URI) {
    uri = process.env.MONGO_ATLAS_URI;
  } else {
    uri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017';
  }
  try {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    mongoDb = mongoClient.db(DB_NAME);
    await mongoDb.command({ ping: 1 });
    console.log('[MONGO] Conectado! DB:', DB_NAME);
    return true;
  } catch (e) {
    console.warn('[MONGO] Sem conexao, usando arquivo local:', e.message);
    return false;
  }
}

async function mongoLoad() {
  if (!mongoDb) return null;
  try {
    const doc = await mongoDb.collection(COLLECTION).findOne(DATA_KEY);
    if (doc) { const { _id, ...rest } = doc; return rest; }
  } catch (e) {}
  return null;
}

async function mongoSave(data) {
  if (!mongoDb) return;
  const { _id, ...toSave } = data;
  await mongoDb.collection(COLLECTION).replaceOne(DATA_KEY, toSave, { upsert: true });
}

// ===== JSON FILE FALLBACK =====
function fileLoad() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {}
  return null;
}

function fileSave(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ===== UNIFIED LOAD/SAVE =====
let lastDataVersion = 0;

async function loadData() {
  let data = await mongoLoad();
  if (data && data.products) { await loadNormalized(data); return data; }
  data = fileLoad();
  if (data && data.products) { await loadNormalized(data); return data; }
  return null;
}

async function loadNormalized(data) {
  const needs = Array.isArray(data.users) && data.users.some(u => u.password && !u.passwordHash);
  normalizeUsers(data, currentData);
  currentData = data;
  if (needs) {
    console.log('[AUTH] Migrando senhas para hash (SHA-256)');
    await saveData(data);
  }
}

async function saveData(data) {
  lastDataVersion++;
  normalizeUsers(data, currentData);
  currentData = data;
  try { await mongoSave(data); } catch (e) {}
  try { fileSave(data); } catch (e) {}
  autoBackup(data);
}

// ===== SSE =====
let sseClients = [];

function broadcastSSE(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients = sseClients.filter(c => {
    try { c.res.write(msg); return true; } catch (e) { return false; }
  });
}

// ===== UTILS =====
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => { chunks.push(chunk); });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(body));
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function getArrayField(field) {
  return loadData().then(d => {
    if (!d) return [];
    if (field === 'users') return sanitizeUsers(d[field]);
    return (d[field] || []);
  });
}

async function requireAuth(req) {
  const token = req.headers['x-auth-token'] || req.headers['x_auth_token'] || '';
  return verifyToken(token);
}

async function setArrayField(field, items) {
  const data = await loadData();
  if (!data) throw new Error('Dados nao encontrados');
  data[field] = items;
  await saveData(data);
  broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
  return items;
}

function getNextId(items) {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

// ===== STATIC FILES =====
function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
  };
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Nao encontrado'); return; }
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain', 'Cache-Control': 'no-cache' });
    res.end(content);
  });
}

// ===== SERVER =====
const ALLOWED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000', 'https://localhost:8443', 'https://127.0.0.1:8443'];
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:");
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const urlPath = (req.url || '/').split('?')[0];
  const method = req.method;

  try {
    // API ROUTES
    if (urlPath === '/api/health') { json(res, 200, { ok: true }); return; }
    if (urlPath === '/api/status') {
      json(res, 200, { version: lastDataVersion, clients: sseClients.length, uptime: process.uptime(), db: mongoDb ? 'mongodb' : 'file' });
      return;
    }
    if (urlPath === '/api/sync' && method === 'GET') {
      const params = new URL(req.url, 'http://x').searchParams;
      const v = parseInt(params.get('v')) || 0;
      if (v > 0 && v >= lastDataVersion) {
        json(res, 200, { updated: false, version: lastDataVersion });
      } else {
        const data = await loadData();
        const safe = data ? Object.assign({}, data, { users: sanitizeUsers(data.users) }) : null;
        json(res, 200, { updated: true, version: lastDataVersion, data: safe });
      }
      return;
    }
    if (urlPath === '/api/events' && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      res.write(`event: connected\ndata: {"version":${lastDataVersion}}\n\n`);
      const id = Date.now();
      sseClients.push({ id, res });
      req.on('close', () => { sseClients = sseClients.filter(c => c.id !== id); });
      const hb = setInterval(() => { try { res.write(': heartbeat\n\n'); } catch (e) { clearInterval(hb); } }, 30000);
      req.on('close', () => clearInterval(hb));
      return;
    }
    if (urlPath === '/api/load' && method === 'GET') {
      const data = await loadData();
      const safe = data ? Object.assign({}, data, { users: sanitizeUsers(data.users) }) : null;
      json(res, 200, safe);
      return;
    }
    if (urlPath === '/api/save' && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem salvar o banco completo' }); return; }
      const parsed = await parseBody(req);
      await saveData(parsed);
      broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
      json(res, 200, { ok: true, version: lastDataVersion });
      return;
    }

    // GENERIC CRUD
    const collections = ['products', 'employees', 'users', 'clients', 'bathGrooming', 'services', 'sales', 'expenses', 'activityLog'];
    const adminOnly = ['users', 'employees', 'activityLog'];
    const readOnly = ['activityLog'];
    for (const col of collections) {
      const apiName = col === 'bathGrooming' ? 'bathgrooming' : col === 'activityLog' ? 'activitylog' : col;
      if (urlPath === `/api/${apiName}` && method === 'GET') {
        json(res, 200, await getArrayField(col));
        return;
      }
      if (urlPath === `/api/${apiName}` && method === 'POST') {
        if (readOnly.includes(col)) { json(res, 403, { error: 'Acesso negado' }); return; }
        const user = await requireAuth(req);
        if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
        if (adminOnly.includes(col) && user.type !== 'admin') { json(res, 403, { error: 'Acesso negado' }); return; }
        const body = await parseBody(req);
        if (!body || typeof body !== 'object') { json(res, 400, { error: 'Dados invalidos' }); return; }
        const items = await getArrayField(col);
        const item = { id: getNextId(items), ...body };
        items.push(item);
        await setArrayField(col, items);
        json(res, 201, item);
        return;
      }
      const match = urlPath.match(new RegExp(`^/api/${apiName}/(\\d+)$`));
      if (match && method === 'PUT') {
        if (readOnly.includes(col)) { json(res, 403, { error: 'Acesso negado' }); return; }
        const user = await requireAuth(req);
        if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
        if (adminOnly.includes(col) && user.type !== 'admin') { json(res, 403, { error: 'Acesso negado' }); return; }
        const id = parseInt(match[1]);
        const body = await parseBody(req);
        if (!body || typeof body !== 'object') { json(res, 400, { error: 'Dados invalidos' }); return; }
        const items = await getArrayField(col);
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) { json(res, 404, { error: 'Nao encontrado' }); return; }
        items[idx] = { ...items[idx], ...body, id };
        await setArrayField(col, items);
        json(res, 200, items[idx]);
        return;
      }
      if (match && method === 'DELETE') {
        if (readOnly.includes(col)) { json(res, 403, { error: 'Acesso negado' }); return; }
        const user = await requireAuth(req);
        if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
        if (adminOnly.includes(col) && user.type !== 'admin') { json(res, 403, { error: 'Acesso negado' }); return; }
        const id = parseInt(match[1]);
        const items = await getArrayField(col);
        const filtered = items.filter(i => i.id !== id);
        await setArrayField(col, filtered);
        json(res, 200, { ok: true });
        return;
      }
    }

    // SETTINGS
    if (urlPath === '/api/settings' && method === 'GET') {
      const data = await loadData();
      json(res, 200, data ? data.settings || {} : {});
      return;
    }
    if (urlPath === '/api/settings' && method === 'PUT') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem alterar configuracoes' }); return; }
      const body = await parseBody(req);
      const data = await loadData();
      data.settings = { ...data.settings, ...body };
      await saveData(data);
      broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
      json(res, 200, data.settings);
      return;
    }

    // LOGIN
    if (urlPath === '/api/login' && method === 'POST') {
      const clientIp = req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        json(res, 429, { error: 'Muitas tentativas. Aguarde 15 minutos.' });
        return;
      }
      const { username, password } = await parseBody(req);
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        json(res, 400, { error: 'Credenciais invalidas' });
        return;
      }
      const data = await loadData();
      const users = data && Array.isArray(data.users) ? data.users : [];
      const user = users.find(u => u.username === username && u.active && verifyPassword(password, u.passwordHash));
      if (user) {
        resetLoginAttempts(clientIp);
        // Migra hash antigo (SHA-256 sem salt) para novo formato (PBKDF2 com salt)
        if (user.passwordHash && !user.passwordHash.includes(':')) {
          user.passwordHash = hashPassword(password);
          await saveData(data);
          console.log('[AUTH] Hash migrado para PBKDF2:', user.username);
        }
        const token = makeToken(user);
        json(res, 200, { ok: true, user: sanitizeUser(user), token });
      } else {
        json(res, 401, { error: 'Credenciais invalidas' });
      }
      return;
    }

    // SESSION CHECK
    if (urlPath === '/api/me' && method === 'GET') {
      const user = await requireAuth(req);
      if (user) { json(res, 200, { ok: true, user: sanitizeUser(user) }); return; }
      json(res, 401, { error: 'Sessao invalida' });
      return;
    }

    // BACKUP - Exportar dados atuais
    if (urlPath === '/api/backup' && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem fazer backup' }); return; }
      const data = await loadData();
      const safe = data ? Object.assign({}, data, { users: sanitizeUsers(data.users) }) : null;
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="backup.json"' });
      res.end(JSON.stringify(safe, null, 2));
      return;
    }

    // BACKUPS - Listar backups do servidor
    if (urlPath === '/api/backups' && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem listar backups' }); return; }
      try {
        if (!fs.existsSync(BACKUP_DIR)) { json(res, 200, { backups: [] }); return; }
        const files = fs.readdirSync(BACKUP_DIR).filter(x => x.startsWith('shared_data_') && x.endsWith('.json')).sort().reverse();
        const backups = files.map(f => {
          const stat = fs.statSync(path.join(BACKUP_DIR, f));
          const dateMatch = f.match(/shared_data_(\d{4}-\d{2}-\d{2})\.json/);
          return { filename: f, date: dateMatch ? dateMatch[1] : '', size: stat.size, modified: stat.mtime.toISOString() };
        });
        json(res, 200, { backups });
      } catch (e) { json(res, 200, { backups: [] }); }
      return;
    }

    // BACKUPS - Criar backup manual
    if (urlPath === '/api/backups/create' && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem criar backups' }); return; }
      try {
        const data = await loadData();
        if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
        const now = new Date();
        const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `shared_data_manual_${ts}.json`;
        fs.writeFileSync(path.join(BACKUP_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
        console.log('[BACKUP] Backup manual criado:', filename);
        json(res, 200, { ok: true, filename, message: 'Backup criado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao criar backup: ' + e.message }); }
      return;
    }

    // BACKUPS - Baixar backup do servidor
    const backupDownloadMatch = urlPath.match(/^\/api\/backups\/download\/(.+)$/);
    if (backupDownloadMatch && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem baixar backups' }); return; }
      const filename = backupDownloadMatch[1];
      if (!filename.startsWith('shared_data_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup nao encontrado' }); return; }
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="' + filename + '"' });
      res.end(content);
      return;
    }

    // BACKUPS - Restaurar backup do servidor
    const backupRestoreMatch = urlPath.match(/^\/api\/backups\/restore\/(.+)$/);
    if (backupRestoreMatch && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem restaurar backups' }); return; }
      const filename = backupRestoreMatch[1];
      if (!filename.startsWith('shared_data_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup nao encontrado' }); return; }
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const backupData = JSON.parse(content);
        if (!backupData || !backupData.products) { json(res, 400, { error: 'Arquivo de backup invalido' }); return; }
        await saveData(backupData);
        broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
        console.log('[BACKUP] Backup restaurado:', filename);
        json(res, 200, { ok: true, message: 'Backup restaurado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao restaurar backup: ' + e.message }); }
      return;
    }

    // BACKUPS - Deletar backup do servidor
    const backupDeleteMatch = urlPath.match(/^\/api\/backups\/delete\/(.+)$/);
    if (backupDeleteMatch && method === 'DELETE') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem deletar backups' }); return; }
      const filename = backupDeleteMatch[1];
      if (!filename.startsWith('shared_data_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup nao encontrado' }); return; }
      try {
        fs.unlinkSync(filePath);
        console.log('[BACKUP] Backup deletado:', filename);
        json(res, 200, { ok: true, message: 'Backup deletado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao deletar backup: ' + e.message }); }
      return;
    }

    // STOCK BACKUP - Exportar estoque
    if (urlPath === '/api/stock-backup' && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem fazer backup de estoque' }); return; }
      const data = await loadData();
      if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
      const stockData = {
        products: data.products || [],
        nextProductId: data.nextProductId || 1,
        exportDate: new Date().toISOString(),
        type: 'stock-backup'
      };
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="estoque-backup-'+new Date().toISOString().slice(0,10)+'.json"' });
      res.end(JSON.stringify(stockData, null, 2));
      return;
    }

    // STOCK BACKUP - Listar backups de estoque do servidor
    if (urlPath === '/api/stock-backups' && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem listar backups de estoque' }); return; }
      try {
        const stockDir = path.join(BACKUP_DIR, 'estoque');
        if (!fs.existsSync(stockDir)) { json(res, 200, { backups: [] }); return; }
        const files = fs.readdirSync(stockDir).filter(x => x.endsWith('.json')).sort().reverse();
        const backups = files.map(f => {
          const stat = fs.statSync(path.join(stockDir, f));
          let info = {};
          try { info = JSON.parse(fs.readFileSync(path.join(stockDir, f), 'utf8')); } catch(e) {}
          return { filename: f, date: info.exportDate || stat.mtime.toISOString(), size: stat.size, products: (info.products || []).length };
        });
        json(res, 200, { backups });
      } catch (e) { json(res, 200, { backups: [] }); }
      return;
    }

    // STOCK BACKUP - Criar backup de estoque no servidor
    if (urlPath === '/api/stock-backups/create' && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem criar backups de estoque' }); return; }
      try {
        const data = await loadData();
        if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
        const stockDir = path.join(BACKUP_DIR, 'estoque');
        if (!fs.existsSync(stockDir)) fs.mkdirSync(stockDir, { recursive: true });
        const now = new Date();
        const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `estoque_${ts}.json`;
        const stockData = {
          products: data.products || [],
          nextProductId: data.nextProductId || 1,
          exportDate: now.toISOString(),
          type: 'stock-backup'
        };
        fs.writeFileSync(path.join(stockDir, filename), JSON.stringify(stockData, null, 2), 'utf8');
        console.log('[BACKUP] Backup de estoque criado:', filename);
        json(res, 200, { ok: true, filename, products: stockData.products.length, message: 'Backup de estoque criado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao criar backup de estoque: ' + e.message }); }
      return;
    }

    // STOCK BACKUP - Baixar backup de estoque
    const stockDownloadMatch = urlPath.match(/^\/api\/stock-backups\/download\/(.+)$/);
    if (stockDownloadMatch && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem baixar backups de estoque' }); return; }
      const filename = stockDownloadMatch[1];
      if (!filename.startsWith('estoque_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, 'estoque', filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup de estoque nao encontrado' }); return; }
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="' + filename + '"' });
      res.end(content);
      return;
    }

    // STOCK BACKUP - Restaurar estoque de um backup
    const stockRestoreMatch = urlPath.match(/^\/api\/stock-backups\/restore\/(.+)$/);
    if (stockRestoreMatch && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem restaurar estoque' }); return; }
      const filename = stockRestoreMatch[1];
      if (!filename.startsWith('estoque_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, 'estoque', filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup de estoque nao encontrado' }); return; }
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const stockData = JSON.parse(content);
        if (!stockData || !stockData.products || !Array.isArray(stockData.products)) {
          json(res, 400, { error: 'Arquivo de backup de estoque invalido' }); return;
        }
        const data = await loadData();
        if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
        data.products = stockData.products;
        if (stockData.nextProductId) data.nextProductId = stockData.nextProductId;
        await saveData(data);
        broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
        console.log('[BACKUP] Estoque restaurado:', filename, '-', stockData.products.length, 'produtos');
        json(res, 200, { ok: true, products: stockData.products.length, message: 'Estoque restaurado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao restaurar estoque: ' + e.message }); }
      return;
    }

    // STOCK BACKUP - Restaurar estoque de um arquivo enviado (import)
    if (urlPath === '/api/stock-backups/import' && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem restaurar estoque' }); return; }
      try {
        const stockData = await parseBody(req);
        if (!stockData || !stockData.products || !Array.isArray(stockData.products)) {
          json(res, 400, { error: 'Dados de estoque invalidos' }); return;
        }
        const data = await loadData();
        if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
        data.products = stockData.products;
        if (stockData.nextProductId) data.nextProductId = stockData.nextProductId;
        await saveData(data);
        broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
        console.log('[BACKUP] Estoque restaurado via import:', stockData.products.length, 'produtos');
        json(res, 200, { ok: true, products: stockData.products.length, message: 'Estoque restaurado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao restaurar estoque: ' + e.message }); }
      return;
    }

    // STOCK BACKUP - Deletar backup de estoque
    const stockDeleteMatch = urlPath.match(/^\/api\/stock-backups\/delete\/(.+)$/);
    if (stockDeleteMatch && method === 'DELETE') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem deletar backups de estoque' }); return; }
      const filename = stockDeleteMatch[1];
      if (!filename.startsWith('estoque_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, 'estoque', filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup de estoque nao encontrado' }); return; }
      try {
        fs.unlinkSync(filePath);
        console.log('[BACKUP] Backup de estoque deletado:', filename);
        json(res, 200, { ok: true, message: 'Backup de estoque deletado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao deletar backup de estoque: ' + e.message }); }
      return;
    }

    // SUPPLIER BACKUP - Listar backups de fornecedores
    if (urlPath === '/api/supplier-backups' && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem listar backups de fornecedores' }); return; }
      try {
        const supDir = path.join(BACKUP_DIR, 'fornecedores');
        if (!fs.existsSync(supDir)) { json(res, 200, { backups: [] }); return; }
        const files = fs.readdirSync(supDir).filter(x => x.endsWith('.json')).sort().reverse();
        const backups = files.map(f => {
          const stat = fs.statSync(path.join(supDir, f));
          let info = {};
          try { info = JSON.parse(fs.readFileSync(path.join(supDir, f), 'utf8')); } catch(e) {}
          return { filename: f, date: info.exportDate || stat.mtime.toISOString(), size: stat.size, suppliers: (info.suppliers || []).length, orders: (info.supplierOrders || []).length };
        });
        json(res, 200, { backups });
      } catch (e) { json(res, 200, { backups: [] }); }
      return;
    }

    // SUPPLIER BACKUP - Criar backup de fornecedores
    if (urlPath === '/api/supplier-backups/create' && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem criar backups de fornecedores' }); return; }
      try {
        const data = await loadData();
        if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
        const supDir = path.join(BACKUP_DIR, 'fornecedores');
        if (!fs.existsSync(supDir)) fs.mkdirSync(supDir, { recursive: true });
        const now = new Date();
        const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `fornecedores_${ts}.json`;
        const supData = {
          suppliers: data.suppliers || [],
          supplierOrders: data.supplierOrders || [],
          nextSupplierId: data.nextSupplierId || 1,
          nextSupplierOrderId: data.nextSupplierOrderId || 1,
          exportDate: now.toISOString(),
          type: 'supplier-backup'
        };
        fs.writeFileSync(path.join(supDir, filename), JSON.stringify(supData, null, 2), 'utf8');
        console.log('[BACKUP] Backup de fornecedores criado:', filename);
        json(res, 200, { ok: true, filename, suppliers: supData.suppliers.length, orders: supData.supplierOrders.length, message: 'Backup criado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao criar backup de fornecedores: ' + e.message }); }
      return;
    }

    // SUPPLIER BACKUP - Baixar backup de fornecedores
    const supDownloadMatch = urlPath.match(/^\/api\/supplier-backups\/download\/(.+)$/);
    if (supDownloadMatch && method === 'GET') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem baixar backups de fornecedores' }); return; }
      const filename = supDownloadMatch[1];
      if (!filename.startsWith('fornecedores_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, 'fornecedores', filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup nao encontrado' }); return; }
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="' + filename + '"' });
      res.end(content);
      return;
    }

    // SUPPLIER BACKUP - Restaurar fornecedores de um backup
    const supRestoreMatch = urlPath.match(/^\/api\/supplier-backups\/restore\/(.+)$/);
    if (supRestoreMatch && method === 'POST') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem restaurar fornecedores' }); return; }
      const filename = supRestoreMatch[1];
      if (!filename.startsWith('fornecedores_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, 'fornecedores', filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup nao encontrado' }); return; }
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const supData = JSON.parse(content);
        if (!supData || !supData.suppliers || !Array.isArray(supData.suppliers)) {
          json(res, 400, { error: 'Arquivo de backup invalido' }); return;
        }
        const data = await loadData();
        if (!data) { json(res, 500, { error: 'Dados nao encontrados' }); return; }
        data.suppliers = supData.suppliers;
        data.supplierOrders = supData.supplierOrders || [];
        if (supData.nextSupplierId) data.nextSupplierId = supData.nextSupplierId;
        if (supData.nextSupplierOrderId) data.nextSupplierOrderId = supData.nextSupplierOrderId;
        await saveData(data);
        broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
        console.log('[BACKUP] Fornecedores restaurados:', filename, '-', supData.suppliers.length, 'fornecedores,', (supData.supplierOrders||[]).length, 'pedidos');
        json(res, 200, { ok: true, suppliers: supData.suppliers.length, orders: (supData.supplierOrders||[]).length, message: 'Fornecedores restaurados com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao restaurar fornecedores: ' + e.message }); }
      return;
    }

    // SUPPLIER BACKUP - Deletar backup de fornecedores
    const supDeleteMatch = urlPath.match(/^\/api\/supplier-backups\/delete\/(.+)$/);
    if (supDeleteMatch && method === 'DELETE') {
      const user = await requireAuth(req);
      if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
      if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem deletar backups de fornecedores' }); return; }
      const filename = supDeleteMatch[1];
      if (!filename.startsWith('fornecedores_') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        json(res, 400, { error: 'Nome de arquivo invalido' }); return;
      }
      const filePath = path.join(BACKUP_DIR, 'fornecedores', filename);
      if (!fs.existsSync(filePath)) { json(res, 404, { error: 'Backup nao encontrado' }); return; }
      try {
        fs.unlinkSync(filePath);
        console.log('[BACKUP] Backup de fornecedores deletado:', filename);
        json(res, 200, { ok: true, message: 'Backup deletado com sucesso' });
      } catch (e) { json(res, 500, { error: 'Erro ao deletar backup: ' + e.message }); }
      return;
    }

    // NETWORK PRINTER - Print via shared printer
    if (urlPath === '/api/network-print' && method === 'POST') {
      try {
        const user = await requireAuth(req);
        if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
        if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem imprimir' }); return; }
        const { content, printerName, printerType, printerPort } = await parseBody(req);
        if (!printerName) {
          json(res, 400, { error: 'Nome da impressora nao informado' });
          return;
        }
        if (!content) {
          json(res, 400, { error: 'Conteudo para impressao nao informado' });
          return;
        }

        // Modo IP direto: envia raw TCP/IP para a impressora (mais confiavel para Epson)
        if (printerType === 'ip' && printerName && printerName.includes('.')) {
          const ip = printerName;
          const port = parseInt(printerPort) || 9100;
          console.log(`[PRINT] Enviando para ${ip}:${port}...`);
          const socket = new net.Socket();
          let done = false;
          socket.setTimeout(10000);
          socket.connect(port, ip, function() {
            // Envia comandos ESC/POS para inicializar impressora
            const initCmd = Buffer.from([0x1B, 0x40]); // ESC @ (initialize)
            socket.write(initCmd);
            socket.write(content, 'utf8', function() {
              // Alimenta e corta papel
              const feedCut = Buffer.from([0x1B, 0x64, 0x03, 0x1D, 0x56, 0x42]); // ESC d 3 + GS V B
              socket.write(feedCut, function() {
                done = true;
                socket.destroy();
                try {
                  const tmpFile = path.join(os.tmpdir(), `print_job_${Date.now()}.txt`);
                  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
                } catch(e) {}
                json(res, 200, { ok: true, message: 'Enviado para impressora IP' });
              });
            });
          });
          socket.on('error', function(err) {
            if (!done) {
              done = true;
              console.error('[PRINT] Erro TCP/IP:', err.message);
              json(res, 500, { error: 'Erro ao conectar na impressora: ' + err.message });
            }
          });
          socket.on('timeout', function() {
            if (!done) {
              done = true;
              socket.destroy();
              json(res, 500, { error: 'Timeout ao conectar na impressora' });
            }
          });
          return;
        }

        // Modo compartilhada: usa comandos do Windows
        const tmpFile = path.join(os.tmpdir(), `print_job_${Date.now()}.txt`);
        fs.writeFileSync(tmpFile, content, 'utf8');
        const escaped = tmpFile.replace(/'/g, "''");
        const pName = sanitizePrinterName(printerName);
        if (!pName || pName.length < 1 || pName.length > 100) {
          try { fs.unlinkSync(tmpFile); } catch(e) {}
          json(res, 400, { error: 'Nome da impressora invalido' });
          return;
        }
        // Metodos de impressao para Windows
        const methods = [
          `powershell -NoProfile -Command "Get-Content -Path '${escaped}' -Raw -Encoding UTF8 | Out-Printer -Name '${pName}'"`,
          `cmd /c copy "${escaped}" "\\\\localhost\\${pName}"`,
        ];
        let methodIndex = 0;
        function tryMethod() {
          if (methodIndex >= methods.length) {
            try { fs.unlinkSync(tmpFile); } catch(e) {}
            json(res, 500, { error: 'Nenhum metodo de impressao funcionou' });
            return;
          }
          exec(methods[methodIndex], { timeout: 10000 }, (err) => {
            if (err) {
              console.warn(`[PRINT] Metodo ${methodIndex+1} falhou:`, err.message);
              methodIndex++;
              tryMethod();
            } else {
              try { fs.unlinkSync(tmpFile); } catch(e) {}
              json(res, 200, { ok: true, message: 'Enviado para impressora' });
            }
          });
        }
        tryMethod();
      } catch (e) {
        json(res, 500, { error: 'Erro interno: ' + e.message });
      }
      return;
    }

    // NETWORK PRINTER - Test connection
    if (urlPath === '/api/network-printer-test' && method === 'POST') {
      try {
        const user = await requireAuth(req);
        if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
        if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem testar impressora' }); return; }
        const { printerName } = await parseBody(req);
        if (!printerName || typeof printerName !== 'string') {
          json(res, 400, { error: 'Nome da impressora nao informado' });
          return;
        }
        const safePrinterName = sanitizePrinterName(printerName);
        if (!safePrinterName || safePrinterName.length < 1 || safePrinterName.length > 100) {
          json(res, 400, { error: 'Nome da impressora invalido' });
          return;
        }
        // Test if printer exists using PowerShell
        const testCmd = `powershell -Command "Get-Printer -Name '${safePrinterName}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name"`;
        exec(testCmd, { timeout: 5000 }, (err, stdout, stderr) => {
          if (err || !stdout.trim()) {
            json(res, 200, { ok: false, error: 'Impressora nao encontrada no sistema' });
          } else {
            json(res, 200, { ok: true, message: 'Impressora encontrada' });
          }
        });
      } catch (e) {
        json(res, 500, { error: 'Erro ao testar: ' + e.message });
      }
      return;
    }

    // NETWORK PRINTER - List available printers
    if (urlPath === '/api/network-printers' && method === 'GET') {
      try {
        const user = await requireAuth(req);
        if (!user) { json(res, 401, { error: 'Nao autorizado' }); return; }
        if (user.type !== 'admin') { json(res, 403, { error: 'Apenas administradores podem listar impressoras' }); return; }
        const cmd = `powershell -Command "Get-Printer | Where-Object {$_.Type -ne 4 -and $_.Name -ne 'Fax'} | Select-Object Name,DriverName,PortName | ConvertTo-Json"`;
        exec(cmd, { timeout: 5000 }, (err, stdout) => {
          if (err) {
            json(res, 200, { printers: [] });
            return;
          }
          try {
            let printers = JSON.parse(stdout.trim());
            if (!Array.isArray(printers)) printers = [printers];
            json(res, 200, { printers });
          } catch (e) {
            json(res, 200, { printers: [] });
          }
        });
      } catch (e) {
        json(res, 200, { printers: [] });
      }
      return;
    }

    // STATIC FILES
    let fp = urlPath === '/' ? '/index.html' : urlPath;
    const safePath = fp.replace(/\.\./g, '').replace(/\/+/g, '/');
    const fullPath = path.join(__dirname, safePath);
    if (!isSafePath(fullPath, __dirname)) { json(res, 403, { error: 'Acesso negado' }); return; }
    const blocked = ['.env', '.auth_secret', 'shared_data.json', 'server.js', 'package.json'];
    if (blocked.some(function(f) { return safePath === '/' + f || safePath === f; })) { json(res, 403, { error: 'Acesso negado' }); return; }
    serveFile(res, fullPath);
  } catch (err) {
    console.error('[ERR]', err.message);
    json(res, 500, { error: 'Erro interno' });
  }
});

// ===== START =====
async function start() {
  await connectMongo();
  const data = await loadData();
  if (data && data.nextProductId) lastDataVersion = 1;
  if (data) autoBackup(data);

  server.listen(PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log('  PetShop Prado - Backend Ativo');
    console.log('=========================================');
    console.log(`  URL:  http://localhost:${PORT}`);
    console.log(`  DB:   ${mongoDb ? 'MongoDB' : 'Arquivo local'}`);
    console.log('=========================================');
  });

  if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
    https.createServer({ cert: fs.readFileSync(CERT_FILE), key: fs.readFileSync(KEY_FILE) }, server.listeners('request')[0]).listen(HTTPS_PORT, '0.0.0.0');
  }
}

process.on('SIGTERM', async () => { if (mongoClient) await mongoClient.close(); process.exit(0); });
process.on('SIGINT', async () => { if (mongoClient) await mongoClient.close(); process.exit(0); });

start();
