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

const user_schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
});

module.exports = { run_schema, user_schema };