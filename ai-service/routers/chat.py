from fastapi import APIRouter, HTTPException, status, Depends
from schemas import ChatRequest, ChatResponse
from services.ai_engine import ai_engine
from config import settings
from security import verify_internal_service_key

router = APIRouter(prefix="/ai", tags=["AI & Recommendations"])


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_internal_service_key)])
async def chat_completion(request: ChatRequest):
    try:
        reply_text = await ai_engine.generate_chat_response(
            messages=request.messages,
            system_instruction=request.system_instruction,
            temperature=request.temperature or 0.7,
        )
        return ChatResponse(
            success=True,
            reply=reply_text,
            model=settings.GEMINI_MODEL,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI inference error: {str(e)}",
        )
