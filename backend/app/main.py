from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os

# Load environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable")

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# FastAPI app
app = FastAPI(title="ApexNurse WebService API", version="2.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "✅ ApexNurse API running successfully"}

@app.get("/papers")
def get_papers():
    """Return a list of available papers and their series"""
    try:
        data = supabase.table("questions").select("paper,series").execute()
        papers = {}
        for row in data.data:
            paper = row["paper"]
            series = row["series"]
            if paper not in papers:
                papers[paper] = set()
            papers[paper].add(series)
        return {"papers": {p: sorted(list(s)) for p, s in papers.items()}}
    except Exception as e:
        print("Error fetching papers:", e)
        return {"error": str(e)}

@app.get("/questions")
def get_questions(
    paper: str = Query(..., description="e.g. Paper1 or Paper2"),
    series: str = Query(..., description="Series name, e.g. Paper1_revision_series_1")
):
    """Fetch questions filtered by paper and series"""
    try:
        response = supabase.table("questions").select("*").eq("paper", paper).eq("series", series).execute()

        if not response.data or len(response.data) == 0:
            print(f"[WARN] No questions found for paper='{paper}', series='{series}'")
            return []

        # Normalize question structure for frontend
        formatted = []
        for q in response.data:
            formatted.append({
                "id": q.get("id"),
                "question": q.get("question") or q.get("text"),
                "options": q.get("options") or [
                    q.get("option_a"),
                    q.get("option_b"),
                    q.get("option_c"),
                    q.get("option_d"),
                ],
                "correct_answer": q.get("correct_answer"),
                "rationale": q.get("rationale", ""),
            })
        return formatted
    except Exception as e:
        print("❌ Error fetching questions:", e)
        return {"error": str(e)}

@app.get("/health")
def health_check():
    return {"status": "ok"}
