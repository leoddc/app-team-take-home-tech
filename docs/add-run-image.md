### add-run-image

**Endpoint:** `/add-run-image`

Returns: status

Optionally add an image to a run. Parameters are sent in the url and the image is sent as body. `Content-Type` must be `image/...`.

`user_id: Int` The user id associated with the run and image

`run_id: Int` The run associated with the image