import json

import yaml
from tqdm.auto import tqdm

from utils.captioner import SceneDescripter
from utils.splitter import SceneSplitter
from utils.synter import TextToSpeech
from pathlib import Path


class PipelineVideoPrepare:
    def __init__(self):
        with open("./configs/pipeline.cfg.yml") as config:
            params = yaml.safe_load(config)

        self.splitter = SceneSplitter(
            params["splitter"]["threshold_splitter"],
            params["splitter"]["frame_skip"],
        )

        self.descriptor = SceneDescripter(
            ckpt_scene=params["descriptor_scene"]["model"],
            device_scene=params["descriptor_scene"]["device"],
            ckpt_background=params["descriptor_background"]["model"],
            device_background=params["descriptor_background"]["device"],
            model_trans_name=params["translation"]["model"],
            device_trans=params["translation"]["device"],
            background_threshold=params["descriptor_background"]["threshold"], scene_threshold=params["descriptor_scene"]["threshold"],
            window_len=params["descriptor_scene"]["window_len"]
        )

        self.txt2speech = TextToSpeech()

    def run(self, path_to_video: Path):
        self.scenes_frames = self.splitter.get_scenes_frames(str(path_to_video))

        self.scenes_backbones = {
            timestamp: self.descriptor.detect_backbones(scene_frame)
            for timestamp, scene_frame in tqdm(self.scenes_frames.items())
        }

        self.scenes_descriptions = {
            timestamp: self.descriptor.get_scene_description(**scene_backbone) 
            for timestamp, scene_backbone in tqdm(self.scenes_backbones.items())
        }
        self.descriptor.back_prev = None
        self.descriptor.scenes_window = []
        
        self.scenes_speeches = {
            timestamp: {'sound': self.txt2speech.save_audio(
                                self.txt2speech.create_audio(scene_desc['text']),
                                name=(path_to_video.parent / f"{i}.mp3")
                            ),
                        'state_pause': scene_desc['state_pause'],
                        'state_using_frame': scene_desc['state_using_frame']}
            for i, (timestamp, scene_desc) in enumerate(
                tqdm(self.scenes_descriptions.items())
            )
        }

        with open(path_to_video.parent / "timecodes.json", "w") as f:
            output_dict = {
                "timecodes": [
                    {
                        "time": time,
                        "sound": data["sound"]["name"],
                        "duration": data["sound"]["duration"],
                        "state_pause": data["state_pause"],
                        "state_using_frame": data["state_using_frame"]
                    }
                    for time, data in self.scenes_speeches.items()
                ]
            }
            json.dump(output_dict, f)

        with open(path_to_video.parent / "timecodes_text.json", "w",  encoding="utf-8") as f:
            output_dict = {
                "timecodes": [
                    {
                        "time": time,
                        "text": data['text'],
                        "state_pause": data['state_pause'],
                        "state_using_frame": data['state_using_frame']
                    }
                    for time, data in self.scenes_descriptions.items()
                ]
            }
            print(output_dict)
            json.dump(output_dict, f)
