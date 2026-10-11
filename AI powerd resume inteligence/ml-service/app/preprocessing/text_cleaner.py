import re
from typing import List, Dict

class TextCleaner:

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Remove non-ascii or strange control characters
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    @staticmethod
    def split_sentences(text: str) -> List[str]:
        if not text:
            return []
        cleaned = TextCleaner.clean_text(text)
        # Sentence splitting regex
        sentences = re.split(r'(?<=[.!?])\s+', cleaned)
        return [s.strip() for s in sentences if len(s.strip()) > 3]

    @staticmethod
    def extract_sections(text: str) -> Dict[str, str]:
        """
        Segment resume text into standard sections:
        Summary, Experience, Education, Skills, Projects, Certifications
        """
        if not text:
            return {}

        section_patterns = {
            "summary": r"(?:summary|professional summary|objective|profile|about me)",
            "experience": r"(?:work experience|experience|employment history|work history|professional experience)",
            "education": r"(?:education|academic background|qualifications|degrees)",
            "skills": r"(?:technical skills|skills|technologies|core competencies|competencies|tools & technologies)",
            "projects": r"(?:projects|academic projects|key projects|personal projects)",
            "certifications": r"(?:certifications|certificates|licenses)"
        }

        # Build composite split regex
        headers = "|".join([f"(?P<{k}>{v})" for k, v in section_patterns.items()])
        splits = list(re.finditer(headers, text, re.IGNORECASE))

        if not splits:
            return {"body": text.strip()}

        sections = {}
        for i, match in enumerate(splits):
            header_name = [k for k, v in match.groupdict().items() if v is not None][0]
            start = match.end()
            end = splits[i + 1].start() if i + 1 < len(splits) else len(text)
            content = text[start:end].strip()
            sections[header_name] = content

        return sections
