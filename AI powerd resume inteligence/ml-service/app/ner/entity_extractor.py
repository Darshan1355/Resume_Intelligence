import re
from typing import List, Dict, Optional, Tuple
from app.taxonomy.skill_taxonomy import SkillTaxonomy
from app.models.schemas import ExtractedSkill
from app.preprocessing.text_cleaner import TextCleaner

class EntityExtractor:

    EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    PHONE_REGEX = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    EXPERIENCE_YEARS_REGEX = r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)'

    DEGREE_PATTERNS = [
        r'(?i)\b(?:Ph\.?D|Doctorate)\b',
        r'(?i)\b(?:Master(?:[\'’]s)?|M\.?S|M\.?Tech|M\.?C\.?A|M\.?B\.?A|M\.?Sc)\b(?:\s+(?:in|of)\s+[A-Za-z\s]+)?',
        r'(?i)\b(?:Bachelor(?:[\'’]s)?|B\.?S|B\.?Tech|B\.?E|B\.?C\.?A|B\.?Sc|Degree)\b(?:\s+(?:in|of)\s+[A-Za-z\s]+)?'
    ]

    @classmethod
    def extract_entities(cls, raw_text: str) -> Dict[str, any]:
        cleaned = TextCleaner.clean_text(raw_text)
        sections = TextCleaner.extract_sections(raw_text)

        # 1. Email extraction
        email_match = re.search(cls.EMAIL_REGEX, raw_text)
        email = email_match.group(0) if email_match else None

        # 2. Phone extraction
        phone_match = re.search(cls.PHONE_REGEX, raw_text)
        phone = phone_match.group(0) if phone_match else None

        # 3. Name extraction (heuristic from first 3 non-empty lines)
        name = cls._extract_candidate_name(raw_text, email)

        # 4. Education extraction
        education = cls._extract_education(raw_text, sections)

        # 5. Experience years
        exp_years = cls._extract_experience_years(raw_text)

        # 6. Skills extraction
        skills = cls.extract_skills(raw_text)

        return {
            "candidate_name": name,
            "candidate_email": email,
            "candidate_phone": phone,
            "candidate_education": education,
            "candidate_experience_years": exp_years,
            "skills": skills,
            "sections": sections
        }

    @classmethod
    def _extract_candidate_name(cls, raw_text: str, email: Optional[str]) -> Optional[str]:
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        for line in lines[:5]:
            # Ignore lines that contain email, phone, or generic keywords
            if email and email in line:
                continue
            if re.search(cls.PHONE_REGEX, line):
                continue
            if re.search(r'(?i)(resume|curriculum vitae|cv|page|email|phone|github|linkedin)', line):
                continue
            # A valid name is usually 2-4 words, capitalized, under 40 chars
            words = line.split()
            if 2 <= len(words) <= 4 and len(line) < 40 and all(w[0].isupper() for w in words if w.isalpha()):
                return line.title()
        return "Candidate"

    @classmethod
    def _extract_education(cls, raw_text: str, sections: Dict[str, str]) -> str:
        edu_text = sections.get("education", raw_text)
        for pattern in cls.DEGREE_PATTERNS:
            match = re.search(pattern, edu_text)
            if match:
                return match.group(0).strip()
        return "Bachelor"

    @classmethod
    def _extract_experience_years(cls, raw_text: str) -> float:
        matches = re.findall(cls.EXPERIENCE_YEARS_REGEX, raw_text, re.IGNORECASE)
        if matches:
            try:
                values = [float(m) for m in matches]
                return max(values)
            except ValueError:
                pass
        return 1.0

    @classmethod
    def extract_skills(cls, text: str) -> List[ExtractedSkill]:
        if not text:
            return []

        alias_map = SkillTaxonomy.get_alias_map()
        extracted: Dict[str, ExtractedSkill] = {}
        lower_text = text.lower()

        # Sort aliases by length descending so multi-word tokens match first (e.g., 'spring boot' before 'spring')
        sorted_aliases = sorted(alias_map.keys(), key=len, reverse=True)

        for alias in sorted_aliases:
            # Word boundary search
            pattern = r'(?<![a-zA-Z0-9_\-\+])' + re.escape(alias) + r'(?![a-zA-Z0-9_\-\+])'
            match = re.search(pattern, lower_text)
            if match:
                canonical, category = alias_map[alias]
                if canonical not in extracted:
                    # Capture brief context snippet
                    start = max(0, match.start() - 30)
                    end = min(len(text), match.end() + 30)
                    snippet = text[start:end].replace('\n', ' ').strip()

                    extracted[canonical] = ExtractedSkill(
                        name=canonical,
                        canonical_name=canonical,
                        category=category,
                        confidence=1.0,
                        context_snippet=snippet
                    )

        return list(extracted.values())
