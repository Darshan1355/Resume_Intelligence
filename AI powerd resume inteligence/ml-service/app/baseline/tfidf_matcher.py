import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.preprocessing.text_cleaner import TextCleaner

class TfidfMatcher:
    """
    Classical NLP Baseline: TF-IDF Vectorizer + Cosine Similarity.
    Used as the benchmark baseline against Deep Learning Sentence Transformers.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True
        )

    def calculate_similarity(self, doc1: str, doc2: str) -> float:
        """
        Calculates cosine similarity between two text documents using TF-IDF.
        Returns float similarity in range [0.0, 1.0].
        """
        c1 = TextCleaner.clean_text(doc1)
        c2 = TextCleaner.clean_text(doc2)

        if not c1 or not c2:
            return 0.0

        try:
            tfidf_matrix = self.vectorizer.fit_transform([c1, c2])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(np.clip(sim, 0.0, 1.0))
        except Exception:
            return 0.0

    def calculate_score(self, doc1: str, doc2: str) -> float:
        """
        Returns normalized similarity score in range [0.0, 100.0].
        """
        sim = self.calculate_similarity(doc1, doc2)
        return round(sim * 100.0, 1)
