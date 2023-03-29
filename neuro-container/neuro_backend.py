from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse
from pathlib import Path
import requests
import sys

sys.stdout = sys.stderr  # for debugging flask


app = Flask(__name__)
api = Api()

app.config["MAX_CONTENT_LENGTH"] = 42 * 1024  # 42 Kb content size limit
api.init_app(app)
cors = CORS(app)

STATIC_VOLUME = Path('/static/volume/static')
WEB_BACKEND_ADDRESS = 'http://web:8888'


@app.route("/neuro_api/process", methods=["POST"])
def process():
    print('started processing')
    video_path = Path(request.json['video_path'])
    video_dir_path = video_path.parent
    requests.post(
        f"{WEB_BACKEND_ADDRESS}/api/success",
        json={"video_dir_path": str(video_dir_path)}
    )
    print('sent success')
    return 'ok'
