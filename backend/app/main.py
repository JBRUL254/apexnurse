# backend/app/main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase.client import create_client, Client
import os

# --- Environment setup ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="ApexNurse API", version="2.0")

# --- CORS for frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your Render frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Fetch all papers and series dynamically
@app.get("/papers")
def get_papers():
    try:
        response = supabase.table("questions").select("paper, series").execute()
        papers = {}

        for item in response.data:
            paper = item["paper"]
            series = item["series"]
            if paper not in papers:
                papers[paper] = set()
            papers[paper].add(series)

        result = [{"paper": k, "series": sorted(list(v))} for k, v in papers.items()]
        return {"status": "success", "papers": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ✅ Fetch questions for a given paper and series
@app.get("/questions")
def get_questions(paper: str = Query(...), series: str = Query(...)):
    try:
        query = (
            supabase.table("questions")
            .select("*")
            .eq("paper", paper)
            .eq("series", series)
            .limit(1000)
            .execute()
        )

        if not query.data:
            print(f"[WARN] No questions found for {paper} - {series}")
            return {"questions": []}

        # Clean up data before sending
        cleaned = []
        for q in query.data:
            text = q.get("question") or q.get("text") or ""
            # remove "Answer:" portion if it exists
            if "Answer:" in text:
                text = text.split("Answer:")[0].strip()

            cleaned.append({
                "id": q.get("id"),
                "question": text,
                "option_a": q.get("option_a"),
                "option_b": q.get("option_b"),
                "option_c": q.get("option_c"),
                "option_d": q.get("option_d"),
                "answer": q.get("answer"),
                "rationale": q.get("rationale", "")
            })
        return {"questions": cleaned}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def root():
    return {"message": "ApexNurse API is running 🚀"}
