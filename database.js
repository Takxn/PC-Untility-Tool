const path = require('path');
const fs = require('fs');

let SQL;
let db;
let dbPath;

function getDbPath() {
  const { app } = require('electron');
  const userData = app ? app.getPath('userData') : path.join(__dirname, 'data');
  return path.join(userData, 'pc-utility.db');
}

async function initDb() {
  const initSqlJs = require('sql.js');
  const wasmPath = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let buffer;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(new Uint8Array(buffer));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  try {
    db.run('CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at DESC)');
  } catch (_) {}
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  saveDb();
  return db;
}

function saveDb() {
  if (!db || !dbPath) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function addLog(level, category, message) {
  if (!db) return;
  db.run('INSERT INTO logs (level, category, message) VALUES (?, ?, ?)', [level, category, String(message)]);
  saveDb();
}

function getLogs(limit = 200) {
  if (!db) return [];
  const stmt = db.prepare('SELECT id, level, category, message, created_at FROM logs ORDER BY created_at DESC LIMIT ?');
  stmt.bind([limit]);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows.map((r) => ({
    id: r.id,
    level: r.level,
    category: r.category,
    message: r.message,
    created_at: r.created_at,
  }));
}

function clearLogs() {
  if (!db) return;
  db.run('DELETE FROM logs');
  saveDb();
}

function getSettings() {
  if (!db) return {};
  const stmt = db.prepare('SELECT key, value FROM settings');
  const out = {};
  while (stmt.step()) {
    const r = stmt.getAsObject();
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      out[r.key] = r.value;
    }
  }
  stmt.free();
  return out;
}

function setSettings(key, value) {
  if (!db) return;
  db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
  saveDb();
}

module.exports = {
  initDb,
  addLog,
  getLogs,
  getSettings,
  setSettings,
  clearLogs,
  get db() { return db; },
};
