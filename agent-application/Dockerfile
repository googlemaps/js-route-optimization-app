# Build frontend
FROM node:22-alpine as frontend

WORKDIR /usr/src/app

ADD frontend/package*.json ./

RUN npm ci

COPY frontend/ .

RUN npx ng build --output-path=./dist/out --configuration=production

# Build backend
FROM python:3.10-alpine as backend

WORKDIR /usr/src/app

COPY backend/requirements.txt ./

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY backend/ .

COPY --from=frontend /usr/src/app/dist/out/browser/ /usr/src/app/public/

EXPOSE 8000

CMD ["fastapi", "run", "app/main.py"]