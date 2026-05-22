# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse

from settings import settings
from models import Message, RefreshRequest

import httpx
import google.auth
from google.auth.transport.requests import Request
import logging
import sys
import uuid

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=[settings.API_URL], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.get('/config.json')
def config():
    return {
        "apiUrl": settings.API_URL,
        "mapsApiKey": settings.MAPS_API_KEY,
        "mapId": settings.MAP_ID
    }

@app.post('/message/sync')
async def query(msg: Message):
    credentials, project = google.auth.default()
    auth_req = Request()
    credentials.refresh(auth_req)
    
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            body = {
                'message': {
                    'messageId': str(uuid.uuid4()),
                    'role': 'ROLE_USER',
                    'content': [{
                        'text': msg.message
                    }]
                }
            }
            if msg.contextId:
                body['message']['contextId'] = msg.contextId
            
            token = credentials.token
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'X-Server-Timeout': '600',
                'x-goog-user-project': settings.PROJECT_ID
            }
            
            response = await client.post(settings.AGENT_URL, json=body, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data
        except httpx.HTTPStatusError as e:
            logging.error(f'Status {e.response.status_code}: {e.response.text}')
            
            return JSONResponse(
                content = {"error": f"HTTP error occurred: {e.response.status_code} - {e.response.text}"},
                status_code=e.response.status_code
            )
        except httpx.RequestError as e:
            logging.error(f'{e}')
            
            return JSONResponse(
                content = {"error": f"An error occurred while requesting {e.request.url}: {e}"},
                status_code=500
            )
        
@app.post('/message')
async def stream_query(msg: Message):
    return StreamingResponse(
        get_streaming_response(msg),
        media_type="application/octet-stream",
        headers={
            "Cache-Control": "no-cache",
        }
    )
    
async def get_streaming_response(msg: Message):
    credentials, project = google.auth.default()
    auth_req = Request()
    credentials.refresh(auth_req)
    
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            body = {
                'message': {
                    'messageId': str(uuid.uuid4()),
                    'role': 'ROLE_USER',
                    'content': [{
                        'text': msg.message
                    }]
                }
            }
            if msg.contextId:
                body['message']['contextId'] = msg.contextId
            
            token = credentials.token
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'X-Server-Timeout': '600',
                'x-goog-user-project': settings.PROJECT_ID
            }

            async with client.stream('POST', settings.AGENT_STREAM_URL, json=body, headers=headers) as stream:
                stream.raise_for_status()
                async for chunk in stream.aiter_bytes():
                    if chunk:
                        yield chunk
                        
        except httpx.HTTPStatusError as e:
            logging.error(f'Status {e.response.status_code}: {e.response.text}')
            yield f'{{"error": "HTTP error occurred: {e.response.status_code}"}}'.encode()
            
        except httpx.RequestError as e:
            logging.error(f'{e}')
            yield f'{{"error": "Request error: {str(e)}"}}'.encode()
            
        except Exception as e:
            logging.error(f'Unexpected error: {e}')
            yield b'{"error": "Unexpected error occurred"}'

@app.post('/polylines/refresh')
async def refresh(body: RefreshRequest):
    credentials, project = google.auth.default()
    auth_req = Request()
    credentials.refresh(auth_req)

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            body = {
                'model': body.model,
                'refreshDetailsRoutes': body.routes,
                'populatePolylines': True
            }

            token = credentials.token
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'X-Server-Timeout': '600',
                'x-goog-user-project': settings.PROJECT_ID
            }
            
            response = await client.post(f'https://routeoptimization.googleapis.com/v1/projects/{settings.PROJECT_ID}:optimizeTours', json=body, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data
        except httpx.HTTPStatusError as e:
            logging.error(f'Status {e.response.status_code}: {e.response.text}')
            
            return JSONResponse(
                content = {"error": f"HTTP error occurred: {e.response.status_code} - {e.response.text}"},
                status_code=e.response.status_code
            )
        except httpx.RequestError as e:
            logging.error(f'{e}')
            
            return JSONResponse(
                content = {"error": f"An error occurred while requesting {e.request.url}: {e}"},
                status_code=500
            )

app.mount('/', StaticFiles(directory='public', html=True), name='public')