import typing as tp

import cv2
import numpy as np
from scenedetect import SceneManager, VideoManager
from scenedetect.detectors import ContentDetector


class SceneSplitter:
    def __init__(
        self,
        threshold_splitter: float = 27.0,
        frame_skip: int = 0,
    ):
        self.threshold_splitter = threshold_splitter
        self.frame_skip = frame_skip
        self.video_manager = None

    def get_frame_from_video(
        self,
        scene_avr_frame,
        path_to_video,
    ) -> tp.Dict[str, np.array]:
        """Get frame from scene."""

        cap = cv2.VideoCapture(path_to_video)

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
            self, path_to_video: str
    ) -> None:
        """Start video manager."""

        video_manager = VideoManager([path_to_video])
        video_manager.set_downscale_factor()
        video_manager.start()
        return video_manager

    def get_average_frame(
        self, path_to_video
    ) -> tp.List[int]:
        """Get average frame from scene."""
        
        self.scene_manager = SceneManager()
        self.scene_manager.add_detector(
            ContentDetector(threshold=self.threshold_splitter)
        )
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

        return self.get_frame_from_video(scene_avr_frame, path_to_video)

    def get_scenes_frames(
        self, path_to_video
    ) -> tp.Dict[str, np.array]:
        """Get average scene frames and their timecode."""

        self.video_manager = self.start_video_manager(path_to_video)
        scene_avr_frame = self.get_average_frame(path_to_video)

        return scene_avr_frame
