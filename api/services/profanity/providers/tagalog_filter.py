import json
import os
import re

class TagalogFilter:
    def __init__(self):
        data_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "data",
            "tagalog_bad_words.json"
        )
        with open(data_path, "r", encoding="utf-8") as f:
            self.badwords = json.load(f)

        # Sort by length for multi-word priority
        self.badwords.sort(key=len, reverse=True)
        self.pattern = re.compile(
            r"(" + "|".join(map(re.escape,self.badwords)) + r")",
            re.IGNORECASE
        )

    def contains_profanity(self, text: str) -> bool:
        return bool(self.pattern.search(text))

    def censor_text(self, text: str, mask_char: str = "*") -> str:
        return self.pattern.sub(lambda m: mask_char * len(m.group()), text)

    def find_profanities(self, text: str):
        return [match.group().lower() for match in self.pattern.finditer(text)]
