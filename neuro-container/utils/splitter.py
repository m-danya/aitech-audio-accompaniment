import typing as tp

import cv2
import numpy as np
from scenedetect import SceneManager, VideoManager
from scenedetect.detectors import ContentDetector


class SceneSplitter:
    def __init__(
        self,
        path_to_video: str,
        threshold_splitter: float = 27.0,
        frame_skip: int = 0,
    ):
        self.path_to_video = path_to_video
        self.video_manager = VideoManager([self.path_to_video])
        self.scene_manager = SceneManager()
        self.scene_manager.add_detector(
            ContentDetector(threshold=threshold_splitter)
        )
        self.frame_skip = frame_skip

    def get_frame_from_video(
        self,
        scene_avr_frame,
    ) -> tp.Dict[str, np.array]:
        """Get frame from scene."""

        cap = cv2.VideoCapture(self.path_to_video)

        frame_idx = 0
        list_frame = dict()

        while scene_avr_frame and cap.isOpened():
            ret, frame = cap.read()
            if ret:
                if scene_avr_frame[0][1] == frame_idx:
                    list_frame[scene_avr_frame[0][0]] = frame
                    scene_avr_frame.pop(0)
            else:
                break

            frame_idx += 1

        cap.release()

        return list_frame

    def start_video_manager(
        self,
    ) -> None:
        """Start video manager."""

        self.video_manager.set_downscale_factor()
        self.video_manager.start()

    def get_average_frame(
        self,
    ) -> tp.List[int]:
        """Get average frame from scene."""

        self.scene_manager.detect_scenes(
            frame_source=self.video_manager, frame_skip=self.frame_skip
        )

        scene_list = self.scene_manager.get_scene_list()
        scene_avr_frame = [
            (
                scene[0].get_timecode(),
                scene[0].get_frames()
                + (scene[1].get_frames() - scene[0].get_frames()) // 2,
            )
            for scene in scene_list
        ]

        return self.get_frame_from_video(scene_avr_frame)

    def get_scenes_frames(
        self,
    ) -> tp.Dict[str, np.array]:
        """Get average scene frames and their timecode."""

        self.start_video_manager()
        scene_avr_frame = self.get_average_frame()

        return scene_avr_frame
