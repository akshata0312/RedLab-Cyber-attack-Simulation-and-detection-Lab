import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('aegis_red.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT,
    source_ip TEXT,
    details TEXT,
    severity TEXT,
    detected BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    attack_id INTEGER,
    alert_name TEXT,
    description TEXT,
    severity TEXT,
    FOREIGN KEY(attack_id) REFERENCES logs(id)
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Routes ---

  // Get all logs
  app.get('/api/logs', (req, res) => {
    const logs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100').all();
    res.json(logs);
  });

  // Get all alerts
  app.get('/api/alerts', (req, res) => {
    const alerts = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50').all();
    res.json(alerts);
  });

  // Get stats
  app.get('/api/stats', (req, res) => {
    const totalAttacks = db.prepare('SELECT COUNT(*) as count FROM logs').get() as any;
    const detectedAttacks = db.prepare('SELECT COUNT(*) as count FROM logs WHERE detected = 1').get() as any;
    const criticalAlerts = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE severity = 'Critical'").get() as any;
    res.json({
      totalAttacks: totalAttacks.count,
      detectedAttacks: detectedAttacks.count,
      criticalAlerts: criticalAlerts.count,
      detectionRate: totalAttacks.count > 0 ? (detectedAttacks.count / totalAttacks.count * 100).toFixed(1) : 0
    });
  });

  // Simulation Engine
  app.post('/api/simulate', (req, res) => {
    const { type, details, severity, evasionLevel } = req.body;
    const sourceIp = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;

    // 1. Log the attack
    const insertLog = db.prepare(`
      INSERT INTO logs (type, source_ip, details, severity)
      VALUES (?, ?, ?, ?)
    `);
    const result = insertLog.run(type, sourceIp, details, severity);
    const attackId = result.lastInsertRowid;

    // 2. Detection Logic (Simplified SIEM)
    // Evasion level reduces detection probability
    const detectionChance = Math.max(0, 0.8 - (evasionLevel || 0) * 0.2);
    const isDetected = Math.random() < detectionChance;

    if (isDetected) {
      db.prepare('UPDATE logs SET detected = 1 WHERE id = ?').run(attackId);
      
      const insertAlert = db.prepare(`
        INSERT INTO alerts (attack_id, alert_name, description, severity)
        VALUES (?, ?, ?, ?)
      `);
      
      insertAlert.run(
        attackId,
        `Suspicious ${type} Activity`,
        `Detected ${type} attempt from ${sourceIp}. Details: ${details}`,
        severity
      );
    }

    res.json({ 
      success: true, 
      attackId, 
      detected: isDetected,
      message: isDetected ? "Attack detected by SIEM!" : "Attack bypassed detection."
    });
  });

  // Clear all data
  app.post('/api/reset', (req, res) => {
    db.prepare('DELETE FROM alerts').run();
    db.prepare('DELETE FROM logs').run();
    res.json({ success: true });
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aegis-Red Server running on http://localhost:${PORT}`);
  });
}

startServer();
