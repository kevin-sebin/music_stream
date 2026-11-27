
from locust import HttpUser, task, between


class EchoStreamUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.client.headers.update({
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzk1Njc4NDEyfQ.umDO22tSYQkCrSPH-AYcoxQz4XjDTKA242aJaK9E8U4"
        })

    @task
    def load_home_feed(self):
        with self.client.get(
            "/",
            name="Home Feed",
            catch_response=True
        ) as response:
            print("STATUS:", response.status_code)
            print("BODY:", response.text)

            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}: {response.text}")

