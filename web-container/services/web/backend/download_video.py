import subprocess
from pathlib import Path

def download_video(url, output_path: Path):
    subprocess.run(
        [
            "yt-dlp",
            "--rm-cache-dir",
            str(url),
            "-o",
            f"{output_path}/video.%(ext)s",  #TODO: or mp4?
        ]
    )