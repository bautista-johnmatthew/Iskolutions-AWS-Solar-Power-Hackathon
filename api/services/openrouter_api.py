from openai import OpenAI
from PyPDF2 import PdfReader
import os

# Removed global variables AI_API_KEY and CLIENT
MAX_CHARS = 20000
API_MODEL = "microsoft/mai-ds-r1:free"

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)

            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None
    
    return text

def summarize_pdf(pdf_path):
    """Read PDF and get AI summary"""

    # Setup API key and client
    try:
        global AI_API_KEY, CLIENT, API_MODEL

        AI_API_KEY = os.getenv("AI_API_KEY")
        if not AI_API_KEY:
            raise ValueError("AI_API_KEY environment variable is not set")

        CLIENT = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=AI_API_KEY,
        )
    except ValueError as e:
        return f"Error setting up API environment: {e}"

    # Extract text from PDF
    pdf_text = extract_text_from_pdf(pdf_path)
    if not pdf_text:
        return "Could not extract text from PDF"
    
    # Truncate text if too long
    if len(pdf_text) > MAX_CHARS:
        pdf_text = pdf_text[:MAX_CHARS] + "..."
    
    # TODO: Improve prompt to summarize the document
    message = [
        {   
            "role": "user",
            "content": f"Please summarize the following document:\n\n{pdf_text}"
        },
    ]
    
    try:
        completion = CLIENT.chat.completions.create(
            model=API_MODEL,
            messages=message
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Error during API call: {e}"