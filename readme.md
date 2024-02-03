# Running App Backend API

This API allows for a client to submit run workouts, submit associated workout photos, retreive run workouts based on filters, retreive aggregate data about runs based on filters, ... continue

## API Design

## Docs

### add-run

**Endpoint:** `/add-run`

Returns: submitted data and status

Submit an individual run. Data is sent as a `json` body with the following shape:

`user-id: Int` the id of the submitting user

`nick-name: String` a nickname for the run

`duration_in_ms: Int` the total duration of the run in miliseconds

`distance_in_km: Float` the total distance of the run in kilometers

`avg_heart_rate: Float` the runner's average heart rate over the duration of the run

`start_time_in_ux_ms: Int` the start time of the run in Unix miliseconds

`end_time_in_ux_ms: Int` the end time of the run in Unix miliseconds

`runner_note: String` an optional note about the run

### add-run-image

**Endpoint:** `/add-run-image`

Returns: status

Optionally add an image to a run. Parameters are sent in the url and the image is sent as body. `Content-Type` must be `image/...`.

`user_id: Int` The user id associated with the run and image

`run_id: Int` The run associated with the image

### runs

**Endpoint:** `/user/:user_id/runs`

Where `:user_id` is the id associated with the user

Returns: `data: List` a list of runs with the following shape:

```json
{
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
```

Retreive an optionally filtered selection of runs from a specific user. To retreive _all_ runs, leave url parameters empty. Optionally, use these parameters to filter:

`min_distance: Float` The minimum distance to query

`max_distance: Float` The maximum distance to query

`min_time: Int` The minimum start time in Unix miliseconds to query

`max_time: Int` The maximum end time in Unix miliseconds to query

`min_duration: Int` The minimum duration in Unix miliseconds to query

`max_duration: Int` The maximum duration in Unix miliseconds to query

`min_avg_heart_rate: Int` The minimum average heart rate to query

`max_avg_heart_rate: Int` The maximum average heart rate to query

### run-images

**Endpoint:** `/run-images/:image_id`

Returns: The image file corresponding to the `image_id`

You can retreive any image by using the `image_id`. The `image_id` for any given run is given when you query for `runs`.

### aggregate-run-data

**Endpoint:** `/user/:user_id/aggregate-run-data`

Returns: Your aggregate 'shopping list' in the following shape:

```json
{
	"success": true,
	"data": {
		"avg_avg_heart_rate": 140.5,
		"sum_duration_in_ms": 46800000
		...
	}
}
```

Retreive aggregate data for a specific user. **All generic filters will work for this endpoint** i.e. you can use `min_distance` and it will return the aggregate data for all runs with that minimum distance (see `runs`). 

You can dynamically retreive certain statistics using the following syntax:

`metrics=avg_heart_rate:avg,duration_in_ms:sum,...`

This query will retreive the average average heart rate for the user as well as the sum run duration.

The following aggregate statistical functions are available: `avg`, `sum`, `min`, `max`. These can be applied to the following variables: `duration_in_ms`, `distance_in_km`, `avg_heart_rate`, `start_time_in_ux_ms`, `end_time_in_ux_ms`

You can retreive any combination of aggregate statistics using this syntax:

`variable:function,variable:function,...`

Where a comma seperates individual statistics.