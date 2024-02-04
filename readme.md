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
	- You can use the test images in `./scripts/images`
1. By default, the API will serve from `localhost:3000`

## API Design

### Tech Stack

**Web Framework:** Express

I used Express because of my familiarity with it and it's large ecosystem. Due to the time constraints, I wanted to get things running as quickly as possible so that I could worry more about features and design.

**Database:** SQLite

I used SQLite simply for the sake of being in a dev environment. For production, I would normally use Firestore, but because of the scope and time constraint for this project, I used SQLite. I also think SQL works well for this case because the table relationships are fairly simple and the app is data heavy. Doing string manipulation to build SQL queries isn't ideal, but the same ideas transfer over well to more production ready databases.

**Data Validation:** Joi/Custom

For data validation, I used a combination of Joi and custom validators. It was my first time using Joi and I felt it worked well for validating one dimensional objects. There was some data validation where Joi was overkill and I chose to use custom validation for ease and simplicity.

### File Structure

```
|-- docs/
|	|... # API Documentation
|-- init/
|	|... # DB Initializer. Creates DB and Tables
|-- scripts/
|	|-- insomnia-env.json # Importable Insomnia environment for API testing
|	|-- pop_db.py # A python script to populate the DB
|	|-- images/
|	|	|... # Test images for run_images
|-- util/
|	|... Various functions, constants, validators, etc
|-- index.js # The entry point for the API. Where all routes and the Express app live
```

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

I think a great example of this is the way data aggregation works. I imagine the frontend showing different statistics like average run distance on the user's profile. You can read more about the data aggregation endpoint in the docs, but essentially, a client can request any combination of statistics and functions (like mean, max, etc.). This allows incredible flexability on the frontend. If you want to show the average run distance somewhere, you can request just the average run distance. Even better, if you want to request it for runs in the past 30 days, you can do that as well **dynamically**.

## Challenges and Tradeoffs

A big tradeoff that I've already talked about a little bit is complexity and simplicity. I could give the client control of every minor detail in their data, but then they would be overwhelmed by unnecesary complexity and could make mistakes more likely. On the other hand, I could just give the client all the data and make them sort through it on the client-side. This is of course not ideal as it's slow and voids helpful API abstraction all together. 

I chose somewhere in the middle, leaning towards simplicity, but with added complexity where I thought neccesary. The data model is fairly simple and small, and I felt like there wouldn't be too many instances where the client would need *just* the distance of a particular run, *because if the client already knows about the run, they will already have all the data for that run*.

Some complexity is neccesary for data aggregation, though. I used a "shopping cart" model to allow the client to query specific statistics and apply functions to them within their query. I chose complexity over simplicity here because I felt it would actually be used rather than just serving as another blocking force.

This was a challenge to implement, especially on the data validation side of things. The `metric` query structure for the aggregation endpoint is dynamic, so you're not going to get the same kind of input each time. The query needs to be parsed to get each statistic request. I think given the tools I was working with, I did this fairly well.

## Additions

With more, time I think I would both add some features and reiterate certain parts of the API. I would definitley add or complete the users functionality. I'd add user authentication, the ability to add users, the ability for users to login, etc. One feature I wanted to add but ran out of time was AI generated run summaries. The client could request a "run summary" for a specific run with the `run_id` and the server would go to the OpenAI API and prompt it to summarize the run given the details and metrics. 

I would also potentially rethink the original runs endpoint where runs are requested. I might make it work in a way that is kind of similar to the aggregate feature. That is to say, more dynamic. Right now, the endpoint just has a set few query features, but this doesn't scale super well if you wanted to modify the data model or add new parameters. If I had more time, I may have made this dynamic so that the server computes custom parameters like it does with the aggregate endpoint.