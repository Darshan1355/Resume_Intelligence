from fastapi import APIRouter
from app.models.schemas import RiskPredictionRequest, RiskPredictionResponse
from app.models.risk_classifier import RiskClassifier

router = APIRouter(prefix="/risk", tags=["Risk Prediction"])

@router.post("/predict", response_model=RiskPredictionResponse)
def predict_change_risk(request: RiskPredictionRequest):
    classifier = RiskClassifier.get_instance()
    return classifier.predict_risk(request)
