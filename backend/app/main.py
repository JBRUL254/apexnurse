from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.supabase_client import supabase

app = FastAPI(title="ApexNurse API", version="2.0")

# Allow CORS for frontend URLs
origins = [
    "http://localhost:5173",               # local dev
    "https://apexnurse.onrender.com"       # your live frontend
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

# ✅ Fetch all papers, series, and quizzes
@app.get("/questions")
def get_questions():
    try:
        response = supabase.table("questions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Save attempt
@app.post("/attempts")
def save_attempt(attempt: dict):
    try:
        supabase.table("attempts").insert(attempt).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Fetch user past attempts
@app.get("/attempts/{user_id}")
def get_attempts(user_id: str):
    try:
        response = (
            supabase.table("attempts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
