from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: user, model, or system")
    content: str = Field(..., min_length=1, description="Message text content")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1)
    stream: bool = Field(default=False)
    system_instruction: Optional[str] = None
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    context_data: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    success: bool = True
    reply: str
    model: str
    usage: Optional[Dict[str, Any]] = None


class RecommendationRequest(BaseModel):
    user_intent: str
    category: Optional[str] = None
    location: Optional[str] = None
    max_results: int = Field(default=5, ge=1, le=20)


class RecommendationItem(BaseModel):
    item_id: str
    title: str
    reason: str
    score: float


class RecommendationResponse(BaseModel):
    success: bool = True
    recommendations: List[RecommendationItem]


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    service: str
