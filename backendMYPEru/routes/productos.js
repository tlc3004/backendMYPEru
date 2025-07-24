const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

const dbPath = path.resolve(__dirname, '../db/inventario.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      categoria TEXT,
      precio REAL,
      stock INTEGER
    )
  `);
});

// GET: Obtener productos
router.get('/', (req, res) => {
  db.all('SELECT * FROM productos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST: Agregar producto
router.post('/', (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  db.run(
    `INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)`,
    [nombre, categoria, precio, stock || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// DELETE: Eliminar producto
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM productos WHERE id = ?`, req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
