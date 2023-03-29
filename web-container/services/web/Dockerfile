# 1. build frontend
FROM nikolaik/python-nodejs:python3.10-nodejs18-slim
COPY frontend/package.json frontend/package-lock.json /app/
WORKDIR /app
RUN npm install
COPY frontend/ /app/
RUN npm run build -- --prod

# remove all files except built static files (second FROM)
# 2. install python and run gunicorn

FROM python:3.10.7-slim-buster
# save frontend files
COPY --from=0 /app/build /static/frontend
WORKDIR /app/backend

RUN apt-get update && apt-get install -y netcat

# install dependencies
RUN pip install --upgrade pip
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# copy project
COPY /backend/ /app/backend/

RUN pip install requests # TODO: move to requirements

EXPOSE 443
