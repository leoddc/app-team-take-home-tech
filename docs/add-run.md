**Endpoint:** `/add-run`

Returns: submitted data and status

Submit an individual run. Data is sent as a `json` body with the following shape:

`user-id: Int` the id of the submitting user

`nick-name: String` a nickname for the run

`duration_in_ms: Int` the total duration of the run in milliseconds

`distance_in_km: Float` the total distance of the run in kilometers

`avg_heart_rate: Float` the runner's average heart rate over the duration of the run

`start_time_in_ux_ms: Int` the start time of the run in Unix milliseconds

`end_time_in_ux_ms: Int` the end time of the run in Unix milliseconds

`runner_note: String` an optional note about the run