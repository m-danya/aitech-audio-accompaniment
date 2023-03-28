import yt_dlp


def download_audios_from_youtube(
    ID, format_audio="mp4", format_video="mp4", path="videos", name="test_video"
):
    url = f"https://www.youtube.com/watch?v={ID}"

    # Определите параметры загрузки видео и аудиодорожки
    ydl_opts = {
        "format": f"bestvideo[ext={format_video}]+bestaudio[ext={format_audio}]/best[ext={format_video}]/best",
        "outtmpl": f"{path}/{name}.{format_video}",
    }
    # Создайте объект yt_dlp
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        # Загрузите видео с аудио-дорожкой
        ydl.download([url])
