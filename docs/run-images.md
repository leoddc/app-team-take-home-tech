### run-images

**Endpoint:** `/run-images/:image_id`

Returns: The image file corresponding to the `image_id`

You can retrieve any image by using the `image_id`. The `image_id` for any given run is given when you query for `runs`.

You can use the endpoint url as an image source:
```html
<img src="/run-images/:image_id">
```