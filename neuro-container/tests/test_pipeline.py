import sys

sys.path.append("./")
sys.path.append("/home/aic/models_description/apex/VinVL/Oscar")
sys.path.append(
    "/home/aic/models_description/vinvl-visualbackbone/scene_graph_benchmark"
)

from pipeline import PipelineVideoPrepare

if __name__ == "__main__":
    pipe = PipelineVideoPrepare(path_to_video="./videos/test_video.mp4")

    pipe.run()
    print(pipe.scenes_speeches)
