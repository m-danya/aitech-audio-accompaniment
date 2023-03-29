import subprocess
from pathlib import Path

def get_video_name(url):
    return subprocess.getoutput(f'yt-dlp --print filename -o "%(title)s" {url}')

def download_video(url, output_path: Path):
    print('downloading')
    subprocess.run(
        [
            "yt-dlp",
            "--rm-cache-dir",
            str(url),
            "-o",
            f"{output_path}/video.%(ext)s",  #TODO: or mp4?
        ]
    )
    print('downloaded')