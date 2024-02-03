const db = require('../init/initDb');
const { metric_data } = require('./validate');

const sqlFunctions = {
    'avg': 'AVG',
    'sum': 'SUM',
    'max': 'MAX',
    'min': 'MIN',
};


function _buildFilterWhereSql(options) {
    let sql = `WHERE user_id = ?`;
    let params = [];

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
    if (!isNaN(options.minDuration)) {
        sql += ` AND duration_in_ms >= ?`;
        params.push(options.minDuration);
    }
    if (!isNaN(options.maxDuration)) {
        sql += ` AND duration_in_ms <= ?`;
        params.push(options.maxDuration);
    }
    return params, sql;
}

function _buildAggregateFilterSql(metrics) {
    let sql = '';
    for (let opt of Object.values(metrics)) {
        let sqlFunc = '';
        sqlFunc += sqlFunctions[opt.type];
        sqlFunc += ` (${opt.metric})`; // the sql col value
        sqlFunc += ` AS ${opt.type}_${opt.metric},`; // for better readability, added comma for separation

        sql += sqlFunc;
    }

    return sql.slice(0, -1); // remove trailing comma
}


async function filter(options) {
    const { params, filterSql } = _buildFilterWhereSql(options);
    const sql = `SELECT * FROM runs ${filterSql}`;

    return new Promise((resolve, reject) => {
        db.all(sql, params, async (error, rows) => {
            if (error) {
                reject(error);
            }
            resolve(rows);
        });
    });
}

async function aggregateFilter(options, aggregateOptions) {
    const sql = `SELECT ${_buildAggregateFilterSql(aggregateOptions)} FROM runs ${_buildFilterWhereSql(options)}`;
    const params = [options.userId];

    return new Promise((resolve, reject) => {
        db.all(sql, params, async (error, rows) => {
            if (error) {
                reject(error);
            }
            resolve(rows);
        });
    });
}

function filterOptionsFromReq(req) {
    return options = {
        userId: req.params.user_id,
        minDistance: parseFloat(req.query.min_distance),
        maxDistance: parseFloat(req.query.max_distance),
        minTime: parseInt(req.query.min_time),
        maxTime: parseInt(req.query.max_time),
        minDuration: parseInt(req.query.min_duration),
        maxDuration: parseInt(req.query.max_duration),
        minAvgHr: parseInt(req.query.min_avg_heart_rate),
        maxAvgHr: parseInt(req.query.max_avg_heart_rate),
    }
}

function filterAggregateOptionsFromReq(req) {
    const metricsRaw = req.query.metrics.split(',');
    let metrics = [];
    if (metricsRaw.length === 0) {
        return [];
    }

    metricsRaw.forEach(met => {
        const metSplit = met.split(':');
        const metData = {
            metric: metSplit[0],
            type: metSplit[1],
        };

        console.log(metData)

        const { error, value } = metric_data.validate(metData);

        if (error) {
            throw new Error(error);
        }
        metrics.push(value);
    });

    return metrics;
}

module.exports = { filter, filterOptionsFromReq, aggregateFilter, filterAggregateOptionsFromReq };