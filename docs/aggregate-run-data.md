### aggregate-run-data

**Endpoint:** `/user/:user_id/aggregate-run-data`

Returns: Your aggregate 'shopping list' in the following shape:
Example: `http://localhost:3000/user/1/aggregate-run-data?metrics=avg_heart_rate%3Aavg,duration_in_ms%3Asum,distance_in_km%3Amin,distance_in_km%3Amax&min_distance=10&max_distance`

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

Retrieve aggregate data for a specific user. **All generic filters will work for this endpoint** i.e. you can use `min_distance` and it will return the aggregate data for all runs with that minimum distance (see `runs`). 

You can dynamically retrieve certain statistics using the following syntax:

`metrics=avg_heart_rate:avg,duration_in_ms:sum,...`

This query will retrieve the average average heart rate for the user as well as the sum run duration.

The following aggregate statistical functions are available: `avg`, `sum`, `min`, `max`. These can be applied to the following variables: `duration_in_ms`, `distance_in_km`, `avg_heart_rate`, `start_time_in_ux_ms`, `end_time_in_ux_ms`

You can retrieve any combination of aggregate statistics using this syntax:

`variable:function,variable:function,...`

Where a comma separates individual statistics.