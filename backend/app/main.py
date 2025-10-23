from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os, requests

app = FastAPI(title="ApexNurse WebService")

# ---------------------------
# 🔐 CORS Configuration
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can later restrict this to your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# 🔑 Supabase Configuration
# ---------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set!")

headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# ---------------------------
# 🧭 Root Endpoint
# ---------------------------
@app.get("/")
def root():
    return {"status": "✅ ApexNurse API Live", "version": "2.0"}

# ---------------------------
# 📘 Get all papers + series
# ---------------------------
@app.get("/papers")
def get_papers():
    """Fetch all distinct papers and their series from Supabase."""
    url = f"{SUPABASE_REST_URL}/questions?select=paper,series&limit=9999"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    rows = res.json()
    grouped = {}
    for r in rows:
        paper = str(r.get("paper", "")).strip().title()
        series = str(r.get("series", "")).strip().title()
        if paper and series:
            grouped.setdefault(paper, set()).add(series)

    return {p: sorted(list(s)) for p, s in grouped.items()}

# ---------------------------
# 📗 Get questions by paper + series
# ---------------------------
@app.get("/questions")
def get_questions(paper: str, series: str):
    """Return all questions for a given paper and series."""
    paper = str(paper).strip().title()
    series = str(series).strip().title()

    # Case-insensitive search using ilike
    query = f"select=*&paper=ilike.{paper}&series=ilike.{series}&limit=9999"
    url = f"{SUPABASE_REST_URL}/questions?{query}"
    res = requests.get(url, headers=headers)

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    data = res.json()
    return data or []

# ---------------------------
# 🧩 Save a user's attempt
# ---------------------------
@app.post("/attempt")
async def post_attempt(request: Request):
    """Insert a single attempt record."""
    try:
        payload = await request.json()
        res = requests.post(f"{SUPABASE_REST_URL}/attempts", json=payload, headers=headers)
        if res.status_code not in (200, 201):
            raise HTTPException(status_code=res.status_code, detail=res.text)
        return {"status": "✅ saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------
# 📊 Get attempts for a user
# ---------------------------
@app.get("/attempts")
def get_attempts(user_id: str):
    """Fetch all attempts by user_id."""
    query = f"user_id=eq.{user_id}&select=*"
    url = f"{SUPABASE_REST_URL}/attempts?{query}"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return res.json()

# ---------------------------
# 🧠 Debug endpoint (optional)
# ---------------------------
@app.get("/debug")
def debug(paper: str, series: str):
    """Debug helper — confirms paper and series passed to backend."""
    return {"paper": paper, "series": series}
