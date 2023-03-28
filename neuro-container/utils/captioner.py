import numpy as np
import torch
from oscar.modeling.modeling_bert import BertForImageCaptioning
from oscar.wrappers import OscarTensorizer
from scene_graph_benchmark.wrappers import VinVLVisualBackbone
from transformers_lib.pytorch_transformers import BertConfig, BertTokenizer


class SceneDescripter:
    def __init__(self, ckpt: str, device: str = "cpu"):

        self.detector = VinVLVisualBackbone()
        self.config = BertConfig.from_pretrained(ckpt)
        self.tokenizer = BertTokenizer.from_pretrained(ckpt)
        self.model = BertForImageCaptioning.from_pretrained(
            ckpt, config=self.config
        ).to(device)
        self.tensorizer = OscarTensorizer(tokenizer=self.tokenizer,
                                          device=device)

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
                              classes: list,
                              visual_features: np.ndarray[float]) -> dict:

        visual_features = torch.tensor(visual_features).unsqueeze(0).float()
        inputs = self.tensorizer.encode(visual_features, labels=classes)
        outputs = self.model(**inputs)
        pred = self.tensorizer.decode(outputs)[0][0]["caption"]
        # pred = self.tensorizer.decode(outputs)

        return pred
