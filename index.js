const express = require('express');
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./init/initDb');

const { filter, filterOptionsFromReq, aggregateFilter, filterAggregateOptionsFromReq } = require('./util/filter');
const getRunImageIds = require('./util/getRunImages');
const { runExists, getRunById } = require('./util/runs');
const { run_schema, user_schema, image_schema } = require('./util/validate');

const app = express();
app.use(bodyParser.json());

// for parsing the raw binary in /add-run-image
const parseRawBody = bodyParser.raw({
    type: 'image/*',
    limit: '10mb'
});

app.post('/add-run', (req, res) => {

    const { error, value } = run_schema.validate(req.body);
    const { user_id, nick_name, duration_in_ms, distance_in_km, avg_heart_rate, start_time_in_ux_ms, end_time_in_ux_ms, runner_note } = value;

    if (error) {
        return res.status(400).send({ success: false, error: error.details });
    }

    const sql = `INSERT INTO runs (user_id, 
                                    nick_name, 
                                    duration_in_ms, 
                                    distance_in_km, 
                                    avg_heart_rate, 
                                    start_time_in_ux_ms, 
                                    end_time_in_ux_ms, 
                                    runner_note) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [user_id, nick_name, duration_in_ms, distance_in_km, avg_heart_rate, start_time_in_ux_ms, end_time_in_ux_ms, runner_note], function (error) {
        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.json({
            success: true,
            message: 'Run posted',
            'data': {
                'run_id': this.lastID,
                ...req.body
            }
        });
    });
});

app.post('/add-run-image', parseRawBody, async (req, res) => {
    const unvalidatedData = {
        run_id: req.query.run_id,
        mime_type: req.headers['content-type'],
    }

    const { error, value } = image_schema.validate(unvalidatedData);

    if (error) {
        return res.status(400).send({ success: false, message: error.details });
    }

    const runId = value.run_id;
    const contentType = value.mime_type;

    console.log(value)

    const userId = req.query.user_id;

    if (!contentType) {
        return res.status(400).send({ success: false, message: 'content-type must be image' });
    }

    if (!runId || !userId) {
        return res.status(400).send({ success: false, message: 'Missing run_id or user_id parameters.' });
    }
    if (!await runExists(runId)) {
        return res.status(400).send({ success: false, message: 'Run with that ID does not exist.' })
    }

    // convert binary file body to base64 string for storing directly in db
    const imageBase64 = Buffer.from(req.body).toString('base64');

    const sql = `INSERT INTO run_images (run_id, run_image_base_64, mime_type) VALUES (?, ?, ?)`;

    db.run(sql, [runId, imageBase64, contentType], function (error) {
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.json({ success: true, data: { image_id: this.lastID } });
    });
});

app.get('/run-images/:image_id', (req, res) => {
    const imageId = req.params.image_id;
    const sql = `SELECT run_image_base_64, mime_type FROM run_images WHERE image_id = ?`;
    const params = [imageId];

    db.get(sql, params, (error, row) => {
        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        if (row) {
            const imgBuffer = Buffer.from(row.run_image_base_64, 'base64');

            res.writeHead(200, {
                'Content-Type': row.mime_type,
                'Content-Length': imgBuffer.length
            });
            res.end(imgBuffer);
        } else {
            res.status(404).json({ success: false, message: 'Image not found' });
        }
    });
});

app.get('/user/:user_id/aggregate-run-data', async (req, res) => {
    const options = filterOptionsFromReq(req);
    const aggregateOptions = filterAggregateOptionsFromReq(req);

    try {
        const rows = await aggregateFilter(options, aggregateOptions);
        if (rows.length > 1) {
            res.status(500).send({ success: false, message: 'Unresolved error' })
        }
        res.json({
            success: true,
            'data': rows[0],
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, success: error.message });
    }

});

app.get('/user/:user_id/runs', async (req, res) => {
    const options = filterOptionsFromReq(req);

    try {
        let rows = await filter(options);
        let rowsWithImageIds = [];

        for (let run of rows) {
            let image_ids = await getRunImageIds(run.run_id);
            let runData = {
                ...run,
                image_ids: image_ids
            };
            rowsWithImageIds.push(runData);
        }

        res.json({
            success: true,
            'data': rowsWithImageIds
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});