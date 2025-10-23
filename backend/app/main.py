from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .supabase_client import rest_get, rest_post

load_dotenv()

app = FastAPI(title='ApexNurse API')

FRONTEND_URL = os.getenv('FRONTEND_URL', '*')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != '*' else ["*"],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/questions")
def get_questions(paper: str = None, series: str = None, limit: int = 50):
    params = {}
    if paper:
        params['paper'] = f'eq.{paper}'
    if series:
        params['series'] = f'ilike.%{series}%'
    params['limit'] = limit
    try:
        data = rest_get('questions', params=params)
        return data
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.post("/attempts")
def submit_attempt(attempt: dict):
    # expects AttemptCreate-like dict; we keep signature loose for minimal test
    try:
        res = rest_post('attempts', [attempt])
        return res
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
