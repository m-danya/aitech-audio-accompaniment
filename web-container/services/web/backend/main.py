from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse
from pathlib import Path
from filelock import FileLock
import json

from download_video import download_video


app = Flask(__name__)
api = Api()

app.config["MAX_CONTENT_LENGTH"] = 42 * 1024  # 42 Kb content size limit
api.init_app(app)
cors = CORS(app)

STATIC_VOLUME = Path('/static/volume/static')
MOVIES_DIR = STATIC_VOLUME / 'movies'
QUEUE_FILE = STATIC_VOLUME / 'queue.lock'

def queue_is_locked() -> bool:
    with FileLock(QUEUE_FILE):
        with open(QUEUE_FILE) as f:
            locked = (f.read().strip() == '1')
        return locked

@app.route("/api/queue")
def queue():
    return {
        'is_locked': queue_is_locked()
    }

@app.route("/api/movies")
def movies():
    movies = []
    for movie_dir in MOVIES_DIR.glob('*'):
        with open (movie_dir / 'name.txt') as f:
            name = f.read().strip()
        with open (movie_dir / 'timecodes.json') as f:
            timecodes = json.load(f)
        movies.append({
            'id': movie_dir.name,
            'name': name,
            'timecodes': timecodes['timecodes'],
            # "id/cover.jpg" and "id/movie.mp4" are always there
        })
    return {
        'movies': sorted(movies, key=lambda x: int(x['id']))
    }


def get_max_id():
    return max(int(x) for x in MOVIES_DIR.glob('*'))

@app.route("/api/add", methods=["POST"])
def add():
    url = request.form.get("url")
    with FileLock(QUEUE_FILE):
        with open(QUEUE_FILE) as f:
            locked = (f.read().strip() == '1')
        if locked:
            return {
                'error': 'Queue is locked'
            }
        else:
            with open(QUEUE_FILE, 'w') as f:
                f.write('1')  # lock
    # queue is free and locked by us, go go go
    id = get_max_id() + 1
    print('new id is', id)
    new_movie_dir = MOVIES_DIR / str(id)
    new_movie_dir.mkdir()
    download_video(url, new_movie_dir)
    return {
        'result': f'downloaded {url}'
    }

def main(argv=None):
    app.run(port=5000, host='127.0.0.1', debug=False, use_reloader=False)


if __name__ == "__main__":
    main()