from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import EmbeddingRequest, EmbeddingResponse, BatchEmbeddingRequest
from app.embeddings.transformer_service import TransformerService

router = APIRouter(prefix="/embedding", tags=["Embeddings"])

@router.post("/generate", response_model=EmbeddingResponse)
def generate_embedding(request: EmbeddingRequest):
    """
    Generates a dense vector embedding using Sentence-BERT (all-MiniLM-L6-v2).
    """
    try:
        transformer = TransformerService.get_instance()
        emb = transformer.encode(request.text)
        return EmbeddingResponse(dimension=len(emb), embedding=emb)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation error: {str(e)}")

@router.post("/batch", response_model=List[EmbeddingResponse])
def generate_batch_embeddings(request: BatchEmbeddingRequest):
    """
    Batch embedding generation for efficient bulk vector computation.
    """
    try:
        transformer = TransformerService.get_instance()
        embs = transformer.encode_batch(request.texts)
        return [EmbeddingResponse(dimension=len(e), embedding=e) for e in embs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch embedding error: {str(e)}")
