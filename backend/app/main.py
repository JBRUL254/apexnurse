from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os, requests

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"

headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

@app.get("/")
def root():
    return {"status": "ApexNurse API Live ✅"}

# 1️⃣ Fetch all distinct papers and series
@app.get("/papers")
def get_papers():
    res = requests.get(f"{SUPABASE_REST_URL}/questions?select=paper,series&limit=9999", headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    rows = res.json()

    grouped = {}
    for r in rows:
        paper = r.get("paper", "").strip().title()
        series = r.get("series", "").strip().title()
        if paper and series:
            grouped.setdefault(paper, set()).add(series)

    return {p: sorted(list(s)) for p, s in grouped.items()}

# 2️⃣ Fetch questions by paper + series
@app.get("/questions")
def get_questions(paper: str, series: str):
    paper = paper.strip()
    series = series.strip()
    query = f"paper=eq.{paper}&series=eq.{series}&limit=9999"
    res = requests.get(f"{SUPABASE_REST_URL}/questions?{query}&select=*", headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    data = res.json()
    if not data:
        return []
    return data

# 3️⃣ Save attempts
@app.post("/attempt")
async def post_attempt(request: Request):
    data = await request.json()
    res = requests.post(f"{SUPABASE_REST_URL}/attempts", json=data, headers=headers)
    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return {"status": "saved"}

# 4️⃣ Fetch past attempts by user_id
@app.get("/attempts")
def get_attempts(user_id: str):
    query = f"user_id=eq.{user_id}&select=*"
    res = requests.get(f"{SUPABASE_REST_URL}/attempts?{query}", headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return res.json()
