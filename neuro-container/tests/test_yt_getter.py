import sys

sys.path.append("./")
from utils.yt_getter import download_audios_from_youtube

download_audios_from_youtube(ID="TR2tREJdTDo", path="./videos", name="test_video")
