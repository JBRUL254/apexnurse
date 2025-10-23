from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from supabase import create_client, Client
from datetime import datetime

# ---------------------------------------------------------------------
# ✅ Initialize FastAPI
# ---------------------------------------------------------------------
app = FastAPI(title="ApexNurse WebService API", version="2.0")

# ---------------------------------------------------------------------
# ✅ Environment Variables (Render + Supabase)
# ---------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ---------------------------------------------------------------------
# ✅ CORS Setup
# ---------------------------------------------------------------------
origins = [
    "http://localhost:5173",  # local dev
    "https://apexnurse.onrender.com",  # production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# ✅ Models
# ---------------------------------------------------------------------
class Attempt(BaseModel):
    user_id: str
    question_id: int
    selected_option: str
    correct: bool
    time_spent_seconds: int

class Performance(BaseModel):
    user_id: str
    paper: str
    series: str
    score: int
    total: int
    accuracy: float
    time_spent_seconds: int

# ---------------------------------------------------------------------
# ✅ Root Health Check
# ---------------------------------------------------------------------
@app.get("/")
def home():
    return {"message": "ApexNurse API is live!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ---------------------------------------------------------------------
# ✅ Get Papers + Series
# ---------------------------------------------------------------------
@app.get("/papers")
def get_papers():
    try:
        response = supabase.table("questions").select("paper,series").execute()
        data = response.data or []
        papers = {}
        for row in data:
            paper = row["paper"]
            series = row["series"]
            if paper not in papers:
                papers[paper] = set()
            papers[paper].add(series)
        formatted = [{"paper": p, "series": sorted(list(s))} for p, s in papers.items()]
        return formatted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------
# ✅ Get Questions by Paper & Series
# ---------------------------------------------------------------------
@app.get("/questions/{paper}/{series}")
def get_questions(paper: str, series: str):
    try:
        res = supabase.table("questions")\
            .select("*")\
            .eq("paper", paper)\
            .eq("series", series)\
            .order("id", desc=False)\
            .execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------
# ✅ Record Individual Attempt
# ---------------------------------------------------------------------
@app.post("/attempt")
def record_attempt(attempt: Attempt):
    try:
        data = attempt.dict()
        data["created_at"] = datetime.utcnow().isoformat()
        supabase.table("attempts").insert(data).execute()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------
# ✅ Save Performance Summary
# ---------------------------------------------------------------------
@app.post("/performance")
def save_performance(perf: Performance):
    try:
        payload = perf.dict()
        payload["created_at"] = datetime.utcnow().isoformat()
        supabase.table("performance").insert(payload).execute()
        return {"status": "success", "performance": payload}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------
# ✅ Fetch User Performance History
# ---------------------------------------------------------------------
@app.get("/performance/{user_id}")
def get_user_performance(user_id: str):
    try:
        res = supabase.table("performance").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------
# ✅ Resume Last Unfinished Test (Optional)
# ---------------------------------------------------------------------
@app.get("/resume/{user_id}")
def get_resume_data(user_id: str):
    try:
        res = supabase.table("attempts")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
        return {"status": "success", "attempts": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
