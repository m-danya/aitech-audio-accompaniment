import numpy as np
import torch
from oscar.modeling.modeling_bert import BertForImageCaptioning
from oscar.wrappers import OscarTensorizer
from scene_graph_benchmark.wrappers import VinVLVisualBackbone
from transformers_lib.pytorch_transformers import BertConfig, BertTokenizer
from utils.translate import TranslateText


class SceneDescripter:
    def __init__(self, 
                ckpt_scene: str, device_scene: str, 
                ckpt_background: str, device_background: str,
                model_trans_name: str, device_trans: str,
                background_threshold: str, scene_threshold: str,
                window_len: int):

        self.back_prev = None
        self.background_threshold = background_threshold

        self.scene_threshold = scene_threshold
        self.window_len = window_len
        self.scenes_window = []

        # detecting backbones
        self.detector = VinVLVisualBackbone()

        # tokenizer
        self.tokenizer = BertTokenizer.from_pretrained(ckpt_scene)
        self.tensorizer = OscarTensorizer(tokenizer=self.tokenizer,
                                          device=device_background)

        # scene description models
        self.config_caption = BertConfig.from_pretrained(ckpt_scene)
        self.model_scene = BertForImageCaptioning.from_pretrained(
            ckpt_scene, config=self.config_caption
        ).to(device_scene)

        # background description models
        self.config_background = BertConfig.from_pretrained(ckpt_background)
        self.model_background = BertForImageCaptioning.from_pretrained(
            ckpt_background, config=self.config_background
        ).to(device_background)

        self.translation = TranslateText(
            model_name=model_trans_name,
            device=device_trans
        )

    def detect_backbones(self, scene_frame) -> dict:

        dets = self.detector(scene_frame)
        dets["visual_features"] = np.concatenate(
            (dets["features"], dets["spatial_features"]), axis=1
        )

        dets.pop("boxes", None)
        dets.pop("scores", None)
        dets.pop("features", None)
        dets.pop("spatial_features", None)

        return dets

    def get_scene_description(self,
                              classes,
                              visual_features) -> dict:

        visual_features = torch.tensor(visual_features).unsqueeze(0).float()
        inputs = self.tensorizer.encode(visual_features, labels=classes)

        scene_embbed = self.model_scene(**inputs)
        background_embbed = self.model_background(**inputs)

        # place pause or not
        state_pause = False
        if self.back_prev == None:
            self.back_prev = background_embbed

        else:
            if self.__nearby_look(self.back_prev, background_embbed, self.background_threshold):
                state_pause = False
            else:
                state_pause = True
            self.back_prev = background_embbed

        # splits frames check
        state_using_frame = False
        if len(self.scenes_window) == 0:
            state_using_frame = True
            self.scenes_window.append(scene_embbed)

        elif len(self.scenes_window) < self.window_len:
            for window in self.scenes_window:
                if not self.__nearby_look(window, scene_embbed, self.scene_threshold):
                    state_using_frame = True
                    break

            self.scenes_window.append(scene_embbed)
        
        elif len(self.scenes_window) == self.window_len:
            for window in self.scenes_window:
                if not self.__nearby_look(window, scene_embbed, self.scene_threshold):
                    state_using_frame = True
                    break
            
            self.scenes_window.pop(0)
            self.scenes_window.append(scene_embbed)

        pred = self.translation.run_translate(self.tensorizer.decode(scene_embbed)[0][0]["caption"])
        # back = self.translation.run_translate(self.tensorizer.decode(background_embbed)[0][0]["caption"])
        return {'text': pred, 'state_pause': state_pause, 'state_using_frame': state_using_frame}
    
    def __nearby_look(self,
                     embed_1: torch.tensor,
                     embed_2: torch.tensor,
                     threshold: float):

        value = torch.nn.functional.cosine_similarity(embed_1[0][0][0].unsqueeze(0).float(), embed_2[0][0][0].unsqueeze(0).float()).item()
        # print(str(value) + '\n')
        if value > threshold:
            return True
        else:
            return False
