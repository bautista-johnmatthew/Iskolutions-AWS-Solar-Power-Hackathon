from better_profanity import profanity

class EnglishFilter:
    """Filter for English profanity."""

    def __init__(self):
        """Initialize the English profanity filter."""
        profanity.load_censor_words()
    
    def find_profanities(self, text: str) -> bool:
        """Check if text contains English profanity."""
        return profanity.contains_profanity(text)

    def censor_text(self, text: str, mask_char: str = '*') -> str:
        """Censor English profanity words in text."""
        return profanity.censor(text, censor_char=mask_char)
