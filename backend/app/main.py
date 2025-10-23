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
def get_questions(paper: str, series: str = ""):
    """Return questions for one or more series within a paper."""
    paper = paper.strip()
    series_list = [s.strip() for s in series.split(";") if s.strip()]

    all_questions = []
    base_url = f"{SUPABASE_REST_URL}/questions"
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"}

    if not paper:
        raise HTTPException(status_code=400, detail="Missing paper parameter")

    # Build queries
    if not series_list:
        query = f"select=*&paper=ilike.%25{paper}%25&limit=9999"
        res = requests.get(f"{base_url}?{query}", headers=headers)
        if res.status_code == 200:
            all_questions.extend(res.json())
    else:
        for s in series_list:
            query = f"select=*&paper=ilike.%25{paper}%25&series=ilike.%25{s}%25&limit=9999"
            res = requests.get(f"{base_url}?{query}", headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data:
                    all_questions.extend(data)

    if not all_questions:
        print(f"[WARN] No questions found for paper='{paper}', series='{series}'")
        sample = requests.get(f"{base_url}?select=paper,series,id&limit=10", headers=headers).json()
        print("ℹ️  Example rows:", sample)

    return all_questions

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
