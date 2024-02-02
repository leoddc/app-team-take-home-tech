const db = require('../init/initDb');

async function getRunImageIds(runId) {
    const sql = `SELECT image_id FROM run_images WHERE run_id = ?`;
    const params = [runId];

    return new Promise((resolve, reject) => {
        db.all(sql, params, async (error, rows) => {
            if (error) {
                reject(error);
            }
            resolve(rows);
        });
    });
}

module.exports = getRunImageIds;