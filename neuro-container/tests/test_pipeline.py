import sys

sys.path.append("/app")
sys.path.append("/app/apex/VinVL/Oscar")
sys.path.append(
    "/app/vinvl-visualbackbone/scene_graph_benchmark"
)

from pipeline import PipelineVideoPrepare

if __name__ == "__main__":
    pipe = PipelineVideoPrepare(path_to_video="/static/volume/static/movies/1/video.mp4")

    pipe.run()
    print(pipe.scenes_speeches)
