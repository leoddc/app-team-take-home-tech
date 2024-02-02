const db = require('../init/initDb');

async function filter(options) {
    let sql = `SELECT * FROM runs WHERE user_id = ?`;
    let params = [options.userId];

    if (!isNaN(options.minDistance)) {
        sql += ` AND distance_in_km >= ?`;
        params.push(options.minDistance);
    }
    if (!isNaN(options.maxDistance)) {
        sql += ` AND distance_in_km <= ?`;
        params.push(options.maxDistance);
    }
    if (!isNaN(options.minTime)) {
        sql += ` AND start_time_in_ux_ms >= ?`;
        params.push(options.minTime);
    }
    if (!isNaN(options.maxTime)) {
        sql += ` AND end_time_in_ux_ms <= ?`;
        params.push(options.maxTime);
    }
    if (!isNaN(options.minAvgHr)) {
        sql += ` AND avg_heart_rate >= ?`;
        params.push(options.minAvgHr);
    }
    if (!isNaN(options.maxAvgHr)) {
        sql += ` AND avg_heart_rate <= ?`;
        params.push(options.maxAvgHr);
    }
    
    return new Promise((resolve, reject) => {
        db.all(sql, params, async (error, rows) => {
            if (error) {
                reject(error);
            }
            resolve(rows);
        });
    });
}

module.exports = filter;