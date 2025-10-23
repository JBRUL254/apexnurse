from pydantic import BaseModel
from typing import Optional

class AttemptCreate(BaseModel):
    user_id: str
    question_id: int
    selected_option: Optional[str]
    correct: Optional[bool]
    time_spent_seconds: Optional[int]
