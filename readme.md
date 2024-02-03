# Running App Backend API

This API allows for a client to submit run workouts, submit and retreive associated workout photos, retreive run workouts based on filters, retreive aggregate data about runs based on filters, ... continue. Because this API was built for a dev environment, some production ready features have been omitted for the ease of presentation and testing use. Here are some notes about this:

- All id attributes are incremented and numerical. In production, I would almost always use something like a UUID as incremented ids can pose a security risk.
- The users functionality is incomplete. You cannot create, modify, or authenticate users as this is out of scope for the assignment. It would be fairly easy to integrate a complete user authentication system with the current setup, though.

### Get Started

1. Clone the repository and navigate to the containing directory.
1. Run `npm install`
1. Run `npm start`
1. (optional) To populate the database with some test data, you can run the python script in `./scripts/pop_db.py`
	- This script does not upload images correctly
	- To upload images, use an API test client like Postman or Insomnia
1. By default, the API will serve from `localhost:3000`

## API Design

### Tech Stack

**Web Framework:** Express

I used Express because of my familiarity with it and it's large ecosystem. Due to the time constraints, I wanted to get things running as quickly as possible so that I could worry more about features and design.

**Database:** SQLite

I used SQLite simply for the sake of being in a dev environment. For production, I would normally use Firestore, but because of the scope and time constraint for this project, I used SQLite. I also think SQL works well for this case because the table relationships are fairly simple and the app is data heavy.

**Data Validation:** Joi/Custom

For data validation, I used a combination of Joi and custom validators. It was my first time using Joi and I felt it worked well for validating one dimensional objects. There was some data validation where Joi was overkill and I chose to use custom validation for ease and simplicity.

### Design Choices

The main data model is the `run`. Everything in this API is essentially structured around a `run`. A run represents one run workout, here's an example:

```json
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
		...
	]
```

As you can see, a run has a unique id and belongs to a user who also has a unique id. Each run has several statistical attributes as well as some semantic attributes. A run can also have one or more images associated with it.

The main route is the user route. Every run belongs to a user, so to access `run`s and their data you go through the `/users/:user_id/` route.

Images are submitted, retreived, and stored seperate from runs for the sake of speed and to allow multiple images. Because the images are stored encoded in the actual database, you could in theory keep them with the `run` they are associated with. However, this is quite unideal. Not only is it slower, but it also combines two data that do not need to be combined. You don't always need the image and sometimes you *only* need the image.

This API was built with the frontend in mind. I thought about how a frontend would interface with the data. I know from building frontends that you want as much control over the data as possible, but not so much control that you have to build a complicated request to get something simple. 

I think a great example of this is the way data aggregation works. I imagine the frontend showing different statistics like average run distance on the user's profile. You can read more about the data aggregation endpoint in the docs, but essentially, a client can request any combination of statistics and functions (like mean, max, etc.). This allows incredible flexability on the frontend. If you want to show the average run distance somewhere, you can request just the average run distance. Even better, if you want to request it for runs in the past 30 days, you can do that as well dynamically.

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