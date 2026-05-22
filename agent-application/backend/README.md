FastAPI server for the application.

## Local development
1. Configure your [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials).
1. Create a virtual environment with Python v3.10 `python3.10 -m venv venv`
1. Activate the virtual environment `source venv/bin/activate`
1. Install requirements `python3 -m pip install -r requirements.txt`
1. Create a `.env` file in the format of `.example.env`
1. Run the development server with `fastapi dev app/main.py`

### Env file
Env file description
|  Parameter       |  Description  |
| ---------------- | ------------- |
|  AGENT_URL       | URL for the synchronous message endpoint. Note that while this endpoint is supported API side, the frontend is designed to interact with the streaming URL. |
|  AGENT_STREAM_URL| URL for the streaming message endpoint |
|  PROJECT_ID      | ID of the GCP project |
|  API_URL         | URL to use for the API. When running locally, use `http://localhost:8000` |
|  MAPS_API_KEY    | API key for Google Maps |
|  MAP_ID          | Map ID for Google Maps |