const db = require('../init/initDb');
const { metric_data } = require('./validate');

/*
I don't love this, but SQLite doesn't let you use the '?' placeholder
for column names. This is a fast way of cleaning the data to avoid sql injetion.
Otherwise, we'd just take the string straight from the url and run it in sql.
This is also true for aliases.
*/
const sqlFunctions = {
    'avg': 'AVG',
    'sum': 'SUM',
    'max': 'MAX',
    'min': 'MIN',
};

const runTable = {
    'duration_in_ms': 'duration_in_ms',
    'distance_in_km': 'distance_in_km',
    'avg_heart_rate': 'avg_heart_rate',
    'start_time_in_ux_ms': 'start_time_in_ux_ms',
    'end_time_in_ux_ms': 'end_time_in_ux_ms'
};


function _buildFilterWhereSql(options) {
    let filterSql = `WHERE user_id = ?`;
    let filterParams = [options.userId];

    if (!isNaN(options.minDistance)) {
        filterSql += ` AND distance_in_km >= ?`;
        filterParams.push(options.minDistance);
    }
    if (!isNaN(options.maxDistance)) {
        filterSql += ` AND distance_in_km <= ?`;
        filterParams.push(options.maxDistance);
    }
    if (!isNaN(options.minTime)) {
        filterSql += ` AND start_time_in_ux_ms >= ?`;
        filterParams.push(options.minTime);
    }
    if (!isNaN(options.maxTime)) {
        filterSql += ` AND end_time_in_ux_ms <= ?`;
        filterParams.push(options.maxTime);
    }
    if (!isNaN(options.minAvgHr)) {
        filterSql += ` AND avg_heart_rate >= ?`;
        filterParams.push(options.minAvgHr);
    }
    if (!isNaN(options.maxAvgHr)) {
        filterSql += ` AND avg_heart_rate <= ?`;
        filterParams.push(options.maxAvgHr);
    }
    if (!isNaN(options.minDuration)) {
        filterSql += ` AND duration_in_ms >= ?`;
        filterParams.push(options.minDuration);
    }
    if (!isNaN(options.maxDuration)) {
        filterSql += ` AND duration_in_ms <= ?`;
        filterParams.push(options.maxDuration);
    }
    return { filterParams, filterSql };
}

function _buildAggregateFilterSql(metrics) {
    let sql = '';
    let agParams = [];

    for (let opt of metrics) {
        let sqlFunc = sqlFunctions[opt.type] + ` (${runTable[opt.metric]}) AS ${opt.type}_${opt.metric},`;
        sql += sqlFunc;
    }

    const agSql = sql.slice(0, -1); // remove trailing comma
    return { agParams, agSql };
}


async function filter(options) {
    const { filterParams, filterSql } = _buildFilterWhereSql(options);
    const sql = `SELECT * FROM runs ${filterSql}`;

    return new Promise((resolve, reject) => {
        db.all(sql, filterParams, async (error, rows) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            resolve(rows);
        });
    });
}

async function aggregateFilter(options, aggregateOptions) {
    const { filterParams, filterSql } = _buildFilterWhereSql(options);
    const { agParams, agSql } = _buildAggregateFilterSql(aggregateOptions);
    const sql = `SELECT ${agSql} FROM runs ${filterSql}`;

    console.log(filterParams)
    const params = [...agParams, ...filterParams];

    return new Promise((resolve, reject) => {
        db.all(sql, params, async (error, rows) => {
            if (error) {
                console.error(error)
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

        const { error, value } = metric_data.validate(metData);

        if (error) {
            throw new Error(error);
        }
        metrics.push(value);
    });

    return metrics;
}

module.exports = { filter, filterOptionsFromReq, aggregateFilter, filterAggregateOptionsFromReq };