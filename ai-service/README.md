# QAAGA AI Service (FastAPI)

Production-ready microservice foundation for AI features, recommendations, and natural language search.

## Setup & Run Locally

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Run server
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /`: Microservice meta info
- `GET /health`: Healthcheck
- `POST /ai/chat`: AI chat completion and customer assistant
- `GET /docs`: Swagger UI documentation
