from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os

# --- Load environment ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")

# --- Create Supabase client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="ApexNurse API", version="2.0")

# --- Allow frontend to connect ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "✅ ApexNurse backend is running successfully"}


# ✅ Fetch available papers and series
@app.get("/papers")
def get_papers():
    try:
        response = supabase.table("questions").select("paper, series").execute()
        papers = {}

        for item in response.data:
            paper = item.get("paper", "Unknown Paper")
            series = item.get("series", "Unknown Series")
            if paper not in papers:
                papers[paper] = set()
            papers[paper].add(series)

        result = [{"paper": p, "series": sorted(list(s))} for p, s in papers.items()]
        return {"status": "success", "papers": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ✅ Fetch all questions for a specific paper and series
@app.get("/questions")
def get_questions(paper: str = Query(...), series: str = Query(...)):
    try:
        response = (
            supabase.table("questions")
            .select("*")
            .eq("paper", paper)
            .eq("series", series)
            .limit(200)
            .execute()
        )

        if not response.data:
            print(f"[WARN] No questions found for {paper} → {series}")
            return {"questions": []}

        cleaned = []
        for q in response.data:
            text = q.get("question") or q.get("text") or ""
            # Remove "Answer:" or "Ans:" to prevent auto-reveal
            if "Answer:" in text:
                text = text.split("Answer:")[0].strip()
            if "Ans:" in text:
                text = text.split("Ans:")[0].strip()

            cleaned.append({
                "id": q.get("id"),
                "question": text,
                "option_a": q.get("option_a"),
                "option_b": q.get("option_b"),
                "option_c": q.get("option_c"),
                "option_d": q.get("option_d"),
                "answer": q.get("answer"),
                "rationale": q.get("rationale", ""),
            })

        return {"questions": cleaned}
    except Exception as e:
        return {"status": "error", "message": str(e)}
