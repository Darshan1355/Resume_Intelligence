import numpy as np
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class TransformerService:
    """
    Deep Learning Transformer Embedding Service using Sentence-BERT (all-MiniLM-L6-v2).
    Model is loaded once at startup and reused for all inference requests.
    """

    _instance: Optional['TransformerService'] = None
    _model = None

    @classmethod
    def get_instance(cls) -> 'TransformerService':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._load_model()

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading Sentence-BERT Transformer model: {self.model_name}...")
            self._model = SentenceTransformer(self.model_name)
            logger.info("Sentence-BERT model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load sentence-transformers ({e}). Using mathematical fallback embedding vectorizer.")
            self._model = None

    def encode(self, text: str) -> List[float]:
        """
        Generates dense vector embedding (384-d for all-MiniLM-L6-v2).
        """
        if not text:
            return [0.0] * 384

        if self._model is not None:
            emb = self._model.encode(text, convert_to_numpy=True)
            return emb.tolist()
        else:
            # Deterministic fallback dense embedding based on text hashing and term weights
            return self._fallback_encode(text)

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        if self._model is not None:
            embs = self._model.encode(texts, convert_to_numpy=True)
            return embs.tolist()
        else:
            return [self._fallback_encode(t) for t in texts]

    def calculate_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        a = np.array(vec1, dtype=np.float32)
        b = np.array(vec2, dtype=np.float32)

        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        sim = np.dot(a, b) / (norm_a * norm_b)
        return float(np.clip(sim, 0.0, 1.0))

    def _fallback_encode(self, text: str) -> List[float]:
        # 384-dimensional deterministic pseudo-semantic vector
        vec = np.zeros(384, dtype=np.float32)
        words = text.lower().split()
        for i, word in enumerate(words):
            h = hash(word) % 384
            vec[h] += 1.0 / (1.0 + np.log1p(i + 1))
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()
