from fastapi import APIRouter, HTTPException
import os, requests

router = APIRouter()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise RuntimeError("❌ Missing DEEPSEEK_API_KEY environment variable")

DEEPSEEK_URL = "https://api.deepseek.com/v1/reasoning"

@router.post("/deepseek")
def deepseek_reason(payload: dict):
    """
    Ask DeepSeek for reasoning or explanations.
    Expected payload: { "question": "text" }
    """
    question = payload.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing question text")

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "deepseek-reasoner",
        "messages": [
            {"role": "system", "content": "You are a medical reasoning assistant that clearly explains exam questions."},
            {"role": "user", "content": question},
        ],
        "max_tokens": 300,
    }

    try:
        res = requests.post(DEEPSEEK_URL, headers=headers, json=body)
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)

        data = res.json()
        answer = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
        return {"response": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
