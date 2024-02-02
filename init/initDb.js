const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./runwo.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
    if (error) {
        console.error(error.message);
    }
    console.log('db up');
});

db.run(`CREATE TABLE IF NOT EXISTS runs (
    run_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nick_name TEXT NOT NULL,
    duration_in_ms INTEGER NOT NULL,
    distance_in_km REAL NOT NULL,
    avg_heart_rate REAL,
    start_time_in_ux_ms INTEGER NOT NULL,
    end_time_in_ux_ms INTEGER NOT NULL,
    runner_note TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS run_images (
    image_id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER,
    mime_type TEXT,
    run_image_base_64 TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
)`);

module.exports = db;