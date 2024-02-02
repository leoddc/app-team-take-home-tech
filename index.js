const express = require('express');
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./init/initDb');

const filter = require('./util/filter');
const getRunImageIds = require('./util/getRunImages');
const runExists = require('./util/runExists');
const { run_schema, user_schema } = require('./util/validate');

const app = express();
app.use(bodyParser.json());

// for parsing the raw binary in /add-run-image
const parseRawBody = bodyParser.raw({
    type: 'image/*',
    limit: '10mb'
});

app.post('/add-run', (req, res) => {

    run_schema.validate(); // unused rn

    const { user_id, nick_name, duration_in_ms, distance_in_km, avg_heart_rate, start_time_in_ux_ms, end_time_in_ux_ms, runner_note } = req.body;

    const sql = `INSERT INTO runs (user_id, 
                                    nick_name, 
                                    duration_in_ms, 
                                    distance_in_km, 
                                    avg_heart_rate, 
                                    start_time_in_ux_ms, 
                                    end_time_in_ux_ms, 
                                    runner_note) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [user_id, nick_name, duration_in_ms, distance_in_km, avg_heart_rate, start_time_in_ux_ms, end_time_in_ux_ms, runner_note], function (err) {
        if (err) {
            res.status(400).json({ 'success': false, 'error': err.message });
            return;
        }
        res.json({
            'success': true,
            'message': 'Run posted',
            'data': {
                'run_id': this.lastID,
                ...req.body
            }
        });
    });
});

app.post('/add-run-image', parseRawBody, async (req, res) => {
    const runId = req.query.run_id;
    const userId = req.query.user_id;
    const contentType = req.headers['content-type'];

    if (!contentType) {
        return res.status(500).send({ success: false, message: 'content-type must be image' });
    }

    console.log(contentType);

    if (!runId || !userId) {
        return res.status(500).send({ success: false, message: 'Missing run_id or user_id parameters.'});
    }
    if (!await runExists(runId)) {
        return res.status(500).send({ success: false, message: 'Run with that ID does not exist.'})
    }

    // convert binary file body to base64 string for storing directly in db
    const imageBase64 = Buffer.from(req.body).toString('base64');

    const sql = `INSERT INTO run_images (run_id, run_image_base_64, mime_type) VALUES (?, ?, ?)`;

    db.run(sql, [runId, imageBase64, contentType], function (error) {
        if (error) {
            return res.status(500).json({ 'success': false, 'error': error.message });
        }
        res.json({ 'success': true, 'message': `Image updated` });
    });
});

app.get('/run-images/:image_id', (req, res) => {
    const imageId = req.params.image_id;
    const sql = `SELECT run_image_base_64 FROM run_images WHERE image_id = ?`;
    const params = [imageId];

    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(500).json({ "success": false, "error": err.message });
            return;
        }
        if (row) {
            const imgBuffer = Buffer.from(row.run_image_base_64, 'base64');

            // Setting the Content-Type header to display the image directly
            console.log(row.mime_type);
            res.writeHead(200, {
                'Content-Type': 'image/jpeg', // in theory, this is programatic.
                'Content-Length': imgBuffer.length
            });
            res.end(imgBuffer);
        } else {
            res.status(404).json({ "success": false, "message": "Image not found" });
        }
    });
});

app.get('/user/:user_id/get-runs', async (req, res) => {

    const options = {
        userId: req.params.user_id,
        minDistance: parseFloat(req.query.min_distance),
        maxDistance: parseFloat(req.query.max_distance),
        minTime: parseInt(req.query.min_time),
        maxTime: parseInt(req.query.max_time),
        minAvgHr: parseInt(req.query.min_avg_heart_rate),
        maxAvgHr: parseInt(req.query.max_avg_heart_rate),
    }

    try {
        let rows = await filter(options);
        let rowsWithImageIds = [];

        for (let run of rows) {
            let image_ids = await getRunImageIds(run.run_id);
            let runData = {
                ...run,
                image_ids: image_ids
            };
            console.log('rundata', runData);
            rowsWithImageIds.push(runData);
        }

        res.json({
            "success": true,
            "data": rowsWithImageIds
        });
    }
    catch (error) {
        res.status(500).json({ "success": false, "error": error.message });
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});