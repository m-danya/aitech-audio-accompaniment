from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse
from pathlib import Path
from filelock import FileLock
import json
import os
from threading import Thread
import uuid
import requests
import sys
import shutil

sys.stdout = sys.stderr  # for debugging flask



from download_video import download_video, get_video_name


app = Flask(__name__)
api = Api()

app.config["MAX_CONTENT_LENGTH"] = 42 * 1024  # 42 Kb content size limit
api.init_app(app)
cors = CORS(app)

STATIC_VOLUME = Path('/static/volume/static')
DEFAULT_COVER = STATIC_VOLUME / "default_cover.jpg"
MOVIES_DIR = STATIC_VOLUME / 'movies'
QUEUE_FILE = STATIC_VOLUME / 'queue.lock'
NEURO_BACKEND_ADDRESS = 'http://neuro:8888'

lock_file = FileLock(QUEUE_FILE)

def queue_is_locked() -> bool:
    return QUEUE_FILE.exists() and lock_file.is_locked


@app.route("/api/queue")
def queue():
    return {
        'is_locked': queue_is_locked()
    }

@app.route("/api/movies")
def movies():
    movies = []
    for movie_dir in MOVIES_DIR.iterdir():
        name_file = movie_dir / 'name.txt'
        try:
            with open(name_file) as f:
                name = f.read().strip()
            with open (movie_dir / 'timecodes.json') as f:
                timecodes = json.load(f)
            order_file = Path(movie_dir / 'order.txt')
            if order_file.exists():
                with open (order_file) as f:
                    order = int(f.read().strip())
            else:
                order = 0
            movies.append({
                'id': movie_dir.name,
                'name': name,
                'timecodes': timecodes['timecodes'],
                'order': order
                # "id/cover.jpg" and "id/movie.mp4" are always there
            })
        except Exception:
            continue  # skip movie if it's not ready or smth went wrong
    return {
        'movies': sorted(movies, key=lambda x: int(x['order']))
    }


@app.route("/api/add", methods=["POST"])
def add():
    url = request.json['url']
    if queue_is_locked():
        return {
            'error': 'Queue is locked'
        }
    lock_file.acquire()
    try:
        id = str(uuid.uuid4())
        print('new id is', id)
        new_movie_dir = MOVIES_DIR / id
        new_movie_dir.mkdir()
        name = get_video_name(url)
        if 'ERROR: ' in name:
            raise Exception
        path_for_name_file = new_movie_dir / 'name_not_ready.txt'
        path_for_cover_file = new_movie_dir / 'name_not_ready.txt'
        shutil.copy(str(DEFAULT_COVER), str(path_for_cover_file))
        with open(path_for_name_file, 'w') as f:
            f.write(name)   
        Thread(target=run_processing_and_wait, args=(
            url, new_movie_dir
        )).start()
        return {
            'result': 'accepted'
        }
        # lockfile is still locked here, it will be relesead by thread above
    except Exception:
        # something went wrong, release the lock
        lock_file.release()
        return {
            'error': 'Something weird happend!'
        }


# Only neuro-backend should have access to this method
@app.route("/api/success", methods=["POST"])
def success():
    print('got success!')
    lock_file.release()
    name_file_path = Path(
        request.json['video_dir_path']
    ) / "name_not_ready.txt"
    
    name_file_path.rename(name_file_path.with_name("name.txt"))



def run_processing_and_wait(url, new_movie_dir):
    try:
        download_video(url, new_movie_dir)
        result = requests.post(
            f"{NEURO_BACKEND_ADDRESS}/neuro_api/process",
            json={"video_path": str(new_movie_dir / "video.mp4")},
            timeout=1
        )
        print(f"{NEURO_BACKEND_ADDRESS}/neuro_api/process",)
        print(result)
        return {
            'result': 'ok'
        }
    except Exception:
        lock_file.release()
        return {'error': 'error in run_processing_and_wait'}
