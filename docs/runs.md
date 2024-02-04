### runs

**Endpoint:** `/user/:user_id/runs`

Where `:user_id` is the id associated with the user

Returns: `data: List` a list of runs with the following shape:

```json
"success": true,
"data": [
	{
		"run_id": 1,
		"user_id": 1,
		"nick_name": "Morning run",
		"duration_in_ms": 3600000,
		"distance_in_km": 10.5,
		"avg_heart_rate": 140.5,
		"start_time_in_ux_ms": 1675250730000,
		"end_time_in_ux_ms": 1675254330000,
		"runner_note": "Felt great, nice weather",
		"image_ids": [
			{
				"image_id": 1
			},
			{
				"image_id": 2
			},
			{
				"image_id": 3
			},
			{
				"image_id": 4
			}
		]
	},
	...
]
```

Retrieve an optionally filtered selection of runs from a specific user. To retrieve _all_ runs, leave url parameters empty. Optionally, use these parameters to filter:

`min_distance: Float` The minimum distance to query

`max_distance: Float` The maximum distance to query

`min_time: Int` The minimum start time in Unix milliseconds to query

`max_time: Int` The maximum end time in Unix milliseconds to query

`min_duration: Int` The minimum duration in Unix milliseconds to query

`max_duration: Int` The maximum duration in Unix milliseconds to query

`min_avg_heart_rate: Int` The minimum average heart rate to query

`max_avg_heart_rate: Int` The maximum average heart rate to query