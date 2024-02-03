import os
import requests
from faker import Faker
import random
from datetime import datetime, timedelta

faker = Faker()

API_BASE_URL = "http://localhost:3000"

def add_run(user_id, total_runs):
    for _ in range(total_runs):
        start_time = faker.date_time_between(start_date="-1y", end_date="now")
        end_time = start_time + timedelta(minutes=random.randint(10, 120))
        data = {
            "user_id": user_id,
            "nick_name": faker.word(),
            "duration_in_ms": int((end_time - start_time).total_seconds() * 1000),
            "distance_in_km": round(random.uniform(1.0, 42.2), 2),
            "avg_heart_rate": round(random.uniform(60, 180), 2),
            "start_time_in_ux_ms": int(start_time.timestamp() * 1000),
            "end_time_in_ux_ms": int(end_time.timestamp() * 1000),
            "runner_note": faker.sentence(),
        }
        response = requests.post(f"{API_BASE_URL}/add-run", json=data)
        print("Run added:", response.json())

def add_run_image(user_id, run_id):
    images_directory = "images"
    image_name = f"test-image-{random.randint(1, 5)}.png"
    image_path = os.path.join(images_directory, image_name)

    try:
        with open(image_path, 'rb') as image_file:
            files = {'file': (os.path.basename(image_path), image_file, 'image/png')}
            response = requests.post(f"{API_BASE_URL}/add-run-image", files=files, params={'user_id': user_id, 'run_id': run_id}, headers={'Content-Type': 'image/png'})
            print("Image uploaded:", response.json())
    except FileNotFoundError:
        print(f"File {image_path} not found.")

    print(f"Image added for run_id {run_id} of user_id {user_id}")

def main():
    user_id = 1
    total_runs = 10

    add_run(user_id, total_runs)

if __name__ == "__main__":
    main()
