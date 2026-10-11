import logging
import hashlib
import numpy as np
from typing import List, Optional

logger = logging.getLogger("devsense.codebert")

class CodeBertService:
    """
    CodeBERT dense embedding pipeline for source code and patch representation.
    Base Model: microsoft/codebert-base (125M parameters, 768 dimensions)
    """

    _instance: Optional['CodeBertService'] = None

    def __init__(self, model_name: str = "microsoft/codebert-base"):
        self.model_name = model_name
        self.dimension = 768
        self.tokenizer = None
        self.model = None
        self.is_loaded = False
        self._initialize_model()

    @classmethod
    def get_instance(cls) -> 'CodeBertService':
        if cls._instance is None:
            cls._instance = CodeBertService()
        return cls._instance

    def _initialize_model(self):
        try:
            logger.info(f"Loading pretrained CodeBERT model: {self.model_name}")
            from transformers import AutoTokenizer, AutoModel
            import torch

            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
            self.model.eval()
            self.is_loaded = True
            logger.info("CodeBERT loaded successfully in evaluation mode.")
        except Exception as e:
            logger.warn(f"Could not load Hugging Face CodeBERT model directly ({e}). Using deterministic token-hashed 768-dim encoder.")
            self.is_loaded = False

    def encode(self, code_snippet: str) -> np.ndarray:
        """
        Encodes source code or diff into a 768-dimensional dense unit vector.
        """
        if not code_snippet or not code_snippet.strip():
            return np.zeros(self.dimension, dtype=np.float32)

        if self.is_loaded and self.tokenizer and self.model:
            try:
                import torch
                inputs = self.tokenizer(
                    code_snippet,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt"
                )
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    # Attention-mask-aware mean pooling
                    token_embeddings = outputs.last_hidden_state
                    input_mask_expanded = inputs['attention_mask'].unsqueeze(-1).expand(token_embeddings.size()).float()
                    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
                    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
                    mean_pooled = (sum_embeddings / sum_mask).squeeze(0).cpu().numpy()

                # L2 normalize
                norm = np.linalg.norm(mean_pooled)
                if norm > 0:
                    mean_pooled = mean_pooled / norm
                return mean_pooled
            except Exception as e:
                logger.warn(f"CodeBERT torch inference failed: {e}. Using deterministic fallback projection.")

        return self._deterministic_code_embedding(code_snippet)

    def _deterministic_code_embedding(self, text: str) -> np.ndarray:
        """
        High-dimensional deterministic subword projection (768-dim) maintaining structural uniqueness.
        """
        tokens = text.replace('\n', ' ').split()
        vector = np.zeros(self.dimension, dtype=np.float32)
        for i, token in enumerate(tokens[:512]):
            h = int(hashlib.sha256(token.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dimension
            weight = 1.0 / (1.0 + np.log1p(i))
            vector[idx] += float(weight * (1.0 if (h % 2 == 0) else -1.0))

        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector

    def calculate_cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        dot = float(np.dot(vec1, vec2) / (norm1 * norm2))
        return max(0.0, min(1.0, (dot + 1.0) / 2.0 if dot < 0 else dot))
