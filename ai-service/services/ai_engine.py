import os
from typing import List, Optional, Dict, Any
from google import genai
from google.genai import types
from config import settings
from schemas import ChatMessage


class AIEngine:
    def __init__(self):
        self._client: Optional[genai.Client] = None

    def get_client(self) -> genai.Client:
        if self._client is None:
            api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
            if not api_key:
                # Fallback to default env search if configured
                self._client = genai.Client()
            else:
                self._client = genai.Client(api_key=api_key)
        return self._client

    async def generate_chat_response(
        self,
        messages: List[ChatMessage],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        client = self.get_client()

        # Format contents for Gemini SDK
        contents = []
        for msg in messages:
            role = "user" if msg.role in ["user", "customer"] else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg.content)]
                )
            )

        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction or "You are QAAGA AI Assistant, a helpful Bangladeshi marketplace assistant. You speak Bengali and English fluently.",
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=config,
        )

        return response.text or ""


ai_engine = AIEngine()
