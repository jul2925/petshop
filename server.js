const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8000;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const DB_FILE = path.join(__dirname, 'shared_data.json');
const CERT_FILE = path.join(__dirname, 'cert.pem');
const KEY_FILE = path.join(__dirname, 'key.pem');

let sseClients = [];
let lastDataVersion = 0;

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Erro ao ler dados:', e.message);
  }
  return null;
}

function saveData(data) {
  lastDataVersion++;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function broadcastSSE(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients = sseClients.filter(client => {
    try {
      client.res.write(msg);
      return true;
    } catch (e) {
      return false;
    }
  });
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Arquivo nao encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[ext] || 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // SSE endpoint - tempo real
  if (req.url === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    res.write(`event: connected\ndata: {"version":${lastDataVersion}}\n\n`);

    const clientId = Date.now();
    const client = { id: clientId, res: res };
    sseClients.push(client);
    console.log(`[SSE] Cliente conectado (${sseClients.length} total)`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
      console.log(`[SSE] Cliente desconectado (${sseClients.length} total)`);
    });

    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch (e) { clearInterval(heartbeat); }
    }, 30000);

    req.on('close', () => clearInterval(heartbeat));
    return;
  }

  // Load - carregar dados
  if (req.url === '/api/load' && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
    return;
  }

  // Save - salvar dados
  if (req.url === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        saveData(parsed);
        broadcastSSE('update', { version: lastDataVersion, timestamp: Date.now() });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, version: lastDataVersion }));
        console.log(`[SAVE] Dados salvos (v${lastDataVersion}) e notificados ${sseClients.length} clientes`);
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Dados invalidos' }));
      }
    });
    return;
  }

  // Status
  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      version: lastDataVersion,
      clients: sseClients.length,
      uptime: process.uptime()
    }));
    return;
  }

  let filePath = (req.url || '/').split('?')[0];
  filePath = filePath === '/' ? '/index.html' : filePath;
  filePath = path.join(__dirname, filePath);
  serveFile(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log('  PetShop Prado - Backend Ativo');
  console.log('=========================================');
  console.log(`  HTTP:     http://localhost:${PORT}`);
  if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
    console.log(`  HTTPS:    https://localhost:${HTTPS_PORT}`);
    console.log('  (Certificado autoassinado - aceite no navegador)');
  }
  console.log(`  Status:   http://localhost:${PORT}/api/status`);
  console.log(`  Eventos:  http://localhost:${PORT}/api/events`);
  console.log('=========================================');
  console.log('  Para camera no celular use HTTPS!');
  console.log('  Dados sincronizados em TEMPO REAL!');
  console.log('=========================================');
});

// HTTPS Server para camera em dispositivos moveis
if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
  const httpsOptions = {
    cert: fs.readFileSync(CERT_FILE),
    key: fs.readFileSync(KEY_FILE)
  };
  const httpsServer = https.createServer(httpsOptions, server.listeners('request')[0]);
  httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`[HTTPS] Servidor HTTPS ativo na porta ${HTTPS_PORT}`);
  });
}


function createTray() {
  if (process.platform !== 'win32') {
    console.log('[TRAY] Bandeja do sistema indisponivel (somente Windows)');
    return;
  }

  const SysTray = require('systray2').default;

function readIconBuffer() {
  const iconPath = path.join(__dirname, 'icon.png');
  try {
    if (fs.existsSync(iconPath)) {
      const buf = fs.readFileSync(iconPath);
      if (buf.length > 0 && buf.length < 100000) {
        return buf;
      }
    }
  } catch (e) {
    console.error('[TRAY] Erro ao ler icone:', e.message);
  }
  return null;
}

function initTray() {
  const iconBase64 = readIconBuffer();
  const menuConfig = {
    title: 'PetShop Prado',
    tooltip: 'PetShop Prado - Servidor',
    items: [
      { title: 'Abrir no Navegador', tooltip: '', checked: false, enabled: true },
      { title: 'Status', tooltip: '', checked: false, enabled: true },
      { type: 'separator' },
      { title: 'Reiniciar', tooltip: '', checked: false, enabled: true },
      { title: 'Sair', tooltip: '', checked: false, enabled: true }
    ]
  };
  if (iconBase64) {
    menuConfig.icon = iconBase64;
  }

  const trayConfig = { menu: menuConfig };

  let systray;
  try {
    systray = new SysTray(trayConfig);
  } catch (e) {
    console.error('[TRAY] Erro ao criar systray:', e.message);
    return;
  }

  systray.ready().then(() => {
    console.log('[TRAY] Ícone da bandeja do sistema criado com sucesso!');

    systray.onClick(action => {
      console.log('[TRAY] Click:', action.item.title);
      if (action.item.title === 'Abrir no Navegador') {
        exec(`start http://localhost:${PORT}`);
      } else if (action.item.title === 'Status') {
        const status = `Servidor: Rodando\nPorta: ${PORT}\nClientes SSE: ${sseClients.length}\nUptime: ${Math.floor(process.uptime())}s`;
        exec(`msg * "${status}"`);
      } else if (action.item.title === 'Reiniciar') {
        console.log('[TRAY] Reiniciando servidor...');
        systray.kill(true).then(() => {
          process.exit(1);
        }).catch(() => {
          process.exit(1);
        });
      } else if (action.item.title === 'Sair') {
        console.log('[TRAY] Encerrando servidor...');
        systray.kill(true).then(() => {
          process.exit(0);
        }).catch(() => {
          process.exit(0);
        });
      }
    }).catch(err => {
      console.error('[TRAY] Erro ao registrar onClick:', err.message);
    });
  }).catch(err => {
    console.error('[TRAY] Erro ao inicializar systray:', err.message);
  });
}

  initTray();
}

createTray();
