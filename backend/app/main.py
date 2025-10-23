from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os, requests

app = FastAPI(title="ApexNurse WebService")

# ---------------------------
# 🌐 CORS CONFIG
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later restrict to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# 🔑 SUPABASE CONFIG
# ---------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set!")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"
headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# ---------------------------
# 🏁 ROOT
# ---------------------------
@app.get("/")
def root():
    return {"status": "✅ ApexNurse API Live", "version": "2.1"}

# ---------------------------
# 📘 GET ALL PAPERS + SERIES
# ---------------------------
@app.get("/papers")
def get_papers():
    """Fetch all distinct papers and series from Supabase."""
    url = f"{SUPABASE_REST_URL}/questions?select=paper,series&limit=9999"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)

    rows = res.json()
    grouped = {}

    # Group by paper and series (normalize titles)
    for r in rows:
        paper = str(r.get("paper", "")).strip().title()
        series = str(r.get("series", "")).strip().title()
        if paper and series:
            grouped.setdefault(paper, set()).add(series)

    # Fallback grouping (handles weird casing or spacing)
    if len(grouped) < 2:
        for r in rows:
            p = str(r.get("paper", "")).strip()
            s = str(r.get("series", "")).strip()
            if p and s:
                grouped.setdefault(p, set()).add(s)

    # Convert to sorted lists for frontend
    return {p: sorted(list(s)) for p, s in grouped.items()}

# ---------------------------
# 📗 GET QUESTIONS BY PAPER + SERIES
# ---------------------------
@app.get("/questions")
def get_questions(paper: str, series: str):
    """Return all questions for a given paper and series (case-insensitive)."""
    paper = str(paper).strip()
    series = str(series).strip()

    # 1️⃣ Try exact match
    query_exact = f"select=*&paper=eq.{paper}&series=eq.{series}&limit=9999"
    res = requests.get(f"{SUPABASE_REST_URL}/questions?{query_exact}", headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    data = res.json()

    # 2️⃣ If nothing found, use ilike (case-insensitive, partial)
    if not data:
        query_fallback = f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{series}%25&limit=9999"
        res2 = requests.get(f"{SUPABASE_REST_URL}/questions?{query_fallback}", headers=headers)
        if res2.status_code == 200:
            data = res2.json()

    # 3️⃣ Still empty? Try fully unfiltered debug log
    if not data:
        print(f"[WARN] No questions found for paper='{paper}', series='{series}'")

    return data or []

# ---------------------------
# 🧩 SAVE ATTEMPT
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
# 📊 GET USER ATTEMPTS
# ---------------------------
@app.get("/attempts")
def get_attempts(user_id: str):
    """Fetch all attempts by user_id."""
    query = f"user_id=eq.{user_id}&select=*"
    res = requests.get(f"{SUPABASE_REST_URL}/attempts?{query}", headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return res.json()

# ---------------------------
# 🧠 DEBUG ENDPOINT
# ---------------------------
@app.get("/debug")
def debug(paper: str, series: str):
    """Return the exact paper/series received by the backend."""
    return {"paper": paper, "series": series}
