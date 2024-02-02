const db = require('../init/initDb');

function runExists(runId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(1) as count FROM runs WHERE run_id = ?`;

        db.get(sql, [runId], (err, row) => {
            if (err) {
                reject(err);
                return false;
            }
            resolve(row.count > 0);
        });
    });
}

module.exports = runExists;