from better_profanity import profanity

# Load English profanity words on module load
profanity.load_censor_words()
class EnglishFilter:
    """Filter for English profanity."""
    
    def find_profanities(self, text: str) -> bool:
        """Check if text contains English profanity."""
        return profanity.contains_profanity(text)

    def censor_text(self,text: str, mask_char: str = '*') -> str:
        """Censor English profanity words in text."""
        return profanity.censor(text, mask_char=mask_char)
