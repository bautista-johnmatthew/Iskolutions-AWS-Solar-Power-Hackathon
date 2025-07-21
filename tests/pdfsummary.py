from api.services.openrouter_api import summarize_pdf
import time

# Example usage
if __name__ == "__main__":
    pdf_file_path = "Document name.pdf"
    start_time = time.time()
    summary = summarize_pdf(pdf_file_path)
    end_time = time.time()
    execution_time = end_time - start_time
    
    print(f"Execution time: {execution_time:.2f} seconds")
    print(f"PDF Summary: {summary}")