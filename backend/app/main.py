from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.supabase_client import get_table, insert_row

app = FastAPI(title="ApexNurse API", version="2.0")

origins = [
    "http://localhost:5173",
    "https://apexnurse.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "ApexNurse Backend is Live ✅"}

# ✅ Fetch all questions
@app.get("/questions")
def get_questions():
    try:
        data = get_table("questions")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Save user attempt
@app.post("/attempts")
def save_attempt(attempt: dict):
    try:
        insert_row("attempts", attempt)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Fetch all attempts for a user
@app.get("/attempts/{user_id}")
def get_attempts(user_id: str):
    try:
        data = get_table("attempts", f"user_id=eq.{user_id}")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
