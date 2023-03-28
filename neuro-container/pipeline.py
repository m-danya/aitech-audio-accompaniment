import json

import yaml
from tqdm.auto import tqdm

from utils.captioner import SceneDescripter
from utils.splitter import SceneSplitter
from utils.synter import TextToSpeech
from utils.translate import TranslateText


class PipelineVideoPrepare:
    def __init__(self, path_to_video: str):
        with open("./configs/pipeline.cfg.yml") as config:
            params = yaml.safe_load(config)

        self.splitter = SceneSplitter(
            path_to_video,
            params["splitter"]["threshold_splitter"],
            params["splitter"]["frame_skip"],
        )

        self.descriptor = SceneDescripter(
            ckpt=params["descriptor"]["model"],
            device=params["descriptor"]["device"]
        )

        self.translation = TranslateText(
            model_name=params["translation"]["model"],
            device=params["translation"]["device"],
        )

        self.txt2speech = TextToSpeech()

    def run(self):
        self.scenes_frames = self.splitter.get_scenes_frames()

        self.scenes_backbones = {
            timestamp: self.descriptor.detect_backbones(scene_frame)
            for timestamp, scene_frame in tqdm(self.scenes_frames.items())
        }

        self.scenes_descriptions = {
            timestamp: self.translation.run_translate(
                self.descriptor.get_scene_description(**scene_backbone)
            )
            for timestamp, scene_backbone in tqdm(self.scenes_backbones.items())
        }

        self.scenes_speeches = {
            timestamp: self.txt2speech.save_audio(
                self.txt2speech.create_audio(scene_desc), name=f"{i}"
            )
            for i, (timestamp, scene_desc) in enumerate(
                tqdm(self.scenes_descriptions.items())
            )
        }

        with open("timecodes.json", "w") as f:
            output_dict = {
                "timecodes": [
                    {
                        "time": time,
                        "sound": data["name"],
                        "duration": data["duration"]
                    }
                    for time, data in self.scenes_speeches.items()
                ]
            }
            json.dump(output_dict, f)
