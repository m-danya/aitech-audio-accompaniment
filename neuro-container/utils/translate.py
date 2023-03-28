from transformers import FSMTForConditionalGeneration, FSMTTokenizer


class TranslateText:
    def __init__(self, model_name: str, device: str = "cpu"):
        self.device = device
        self.tokenizer = FSMTTokenizer.from_pretrained(model_name)
        self.model = FSMTForConditionalGeneration.from_pretrained(
            model_name).to(device)

    def run_translate(self, text: str) -> str:

        input_ids = self.tokenizer.encode(text, return_tensors="pt")
        outputs = self.model.generate(input_ids.to(self.device))
        translate_text = self.tokenizer.decode(outputs[0],
                                               skip_special_tokens=True)

        return translate_text
