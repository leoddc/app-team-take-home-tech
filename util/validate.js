const Joi = require('joi');

const run_schema = Joi.object({
    user_id: Joi.number().required(),
    nick_name: Joi.string().required(),
    duration_in_ms: Joi.number().required(),
    distance_in_km: Joi.number().required(),
    avg_heart_rate: Joi.number(),
    start_time_in_ux_ms: Joi.number().required(),
    end_time_in_ux_ms: Joi.number().required(),
    runner_note: Joi.string(),
});

const image_schema = Joi.object({
    run_id: Joi.number().required(),
    mime_type: Joi.string().pattern(new RegExp('^image\/(png|jpeg)$')).required(),
});

const metric_data = Joi.object({
    metric: Joi.string().valid('duration_in_ms', 'distance_in_km', 'avg_heart_rate', 'start_time_in_ux_ms', 'end_time_in_ux_ms'),
    type: Joi.string().valid('avg', 'sum', 'max', 'min'),
});

const user_schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
});

module.exports = { run_schema, user_schema, image_schema, metric_data };