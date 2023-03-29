from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse
from pathlib import Path
import requests
import sys
from threading import Thread


sys.stdout = sys.stderr  # for debugging flask


sys.path.append("/app")
sys.path.append("/app/apex/VinVL/Oscar")
sys.path.append(
    "/app/vinvl-visualbackbone/scene_graph_benchmark"
)
from pipeline import PipelineVideoPrepare


app = Flask(__name__)
api = Api()

app.config["MAX_CONTENT_LENGTH"] = 42 * 1024  # 42 Kb content size limit
api.init_app(app)
cors = CORS(app)

STATIC_VOLUME = Path('/static/volume/static')
WEB_BACKEND_ADDRESS = 'http://web:8888'

pipe = PipelineVideoPrepare()

@app.route("/neuro_api/process", methods=["POST"])
def process():
    print('started processing')
    video_path = Path(request.json['video_path'])
    Thread(target=do_work, args=(
            video_path,
        )).start()
    return 'ok'

def do_work(video_path):

    print('running pipeline for', video_path)
    
    pipe.run(path_to_video=video_path)

    video_dir_path = video_path.parent
    requests.post(
        f"{WEB_BACKEND_ADDRESS}/api/success",
        json={"video_dir_path": str(video_dir_path)}
    )
    
    print('processing finished: sent success')