from .providers.english_filter import EnglishFilter 
from .providers.tagalog_filter import TagalogFilter

english_filter = EnglishFilter()
tagalog_filter = TagalogFilter()

def check_text(text: str) -> dict:
    """Check text for profanity across multiple languages."""
    english_hits = english_filter.find_profanities(text)
    tagalog_hits = tagalog_filter.find_profanities(text)

    cleaned_text = text
    if english_hits:
        cleaned_text = english_filter.censor_text(cleaned_text)
    if tagalog_hits:
        cleaned_text = tagalog_filter.censor_text(cleaned_text)

    return {
        "original": text,
        "cleaned": cleaned_text,
        "has_profanity": bool(english_hits or tagalog_hits),
        "english_hits": english_hits,
        "tagalog_hits": tagalog_hits
    }
