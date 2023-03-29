import torch
import torchaudio
from omegaconf import OmegaConf
import datetime
from pathlib import Path

class TextToSpeech:
    def __init__(self, device: str = "cpu"):
        self.models = OmegaConf.load("configs/latest_silero_models.yml")

        self.language = "ru"
        self.model_id = "v3_1_ru"
        self.device = torch.device(device)

        self.model, self.example_text = torch.hub.load(
            repo_or_dir="snakers4/silero-models",
            model="silero_tts",
            language=self.language,
            speaker=self.model_id,
        )

        self.model.to(self.device)

    def create_audio(
        self,
        text: str,
        sample_rate: int = 48000,
        speaker: str = "xenia",
        put_accent: bool = True,
        put_yo: bool = True,
    ) -> torch.Tensor:
        audio = self.model.apply_tts(
            text=text,
            speaker=speaker,
            sample_rate=sample_rate,
            put_accent=put_accent,
            put_yo=put_yo,
        )
        return audio

    def save_audio(
        self, audio: torch.Tensor, name: Path, sample_rate: int = 48000
    ) -> str:
        torchaudio.save(str(name), audio.unsqueeze(0), sample_rate=sample_rate)
        
        time_in_seconds = len(audio)/sample_rate
        time_delta = datetime.timedelta(seconds=time_in_seconds)
        time_formatted = (datetime.datetime.min + time_delta).time().strftime('%H:%M:%S.%f')[:-3]

        return {'name': name.name, 'duration': time_formatted}
