from fastapi import Header, HTTPException, status
from config import settings


async def verify_internal_service_key(
    x_internal_service_key: str = Header(None, alias="X-Internal-Service-Key"),
    authorization: str = Header(None),
):
    """
    Security dependency to ensure only authorized internal services (like Next.js backend)
    can invoke the AI microservice endpoints.
    """
    secret = settings.AI_SERVICE_SECRET_KEY
    if not secret:
        # If no secret is configured, allow internal calls
        return True

    # 1. Check custom internal service header
    if x_internal_service_key and x_internal_service_key == secret:
        return True

    # 2. Check standard Bearer Token
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if token == secret:
            return True

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized: Missing or invalid internal service key",
        headers={"WWW-Authenticate": "Bearer"},
    )
