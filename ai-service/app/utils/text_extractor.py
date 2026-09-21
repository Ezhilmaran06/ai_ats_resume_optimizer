import io
import re
from typing import Tuple
from pypdf import PdfReader
import docx

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full plain text stream from PDF document bytes."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_chunks = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_chunks.append(page_text)
    return "\n".join(text_chunks)

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract paragraphs and table text from DOCX document bytes."""
    doc = docx.Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                paragraphs.append(row_text)
    return "\n".join(paragraphs)

def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract plain text with UTF-8 fallback decoding."""
    try:
        return file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        return file_bytes.decode('latin-1', errors='ignore')

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Detect file format from filename and extract normalized plain text."""
    lower_name = filename.lower()
    if lower_name.endswith('.pdf'):
        return extract_text_from_pdf(file_bytes)
    elif lower_name.endswith(('.docx', '.doc')):
        return extract_text_from_docx(file_bytes)
    else:
        return extract_text_from_txt(file_bytes)
