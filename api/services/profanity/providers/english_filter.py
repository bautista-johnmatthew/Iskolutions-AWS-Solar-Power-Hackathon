from better_profanity import profanity

# Load English profanity words on module load
profanity.load_censor_words()

def contains_english_profanity(text: str) -> bool:
    """Check if text contains English profanity."""
    return profanity.contains_profanity(text)

def mask_english(text: str, mask_char: str = '*') -> str:
    """Censor English profanity words in text."""
    return profanity.censor(text, mask_char=mask_char)
