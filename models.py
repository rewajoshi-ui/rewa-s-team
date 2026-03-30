from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class Action(BaseModel):
    command: str = Field(..., description="search/select/init/confirm")
    payload: Dict = Field(default_factory=dict)


class Observation(BaseModel):
    step: int
    phase: str
    last_error: Optional[str] = None
    market_condition: str
    available_items: List[Dict] = []
    reward_signal: float
    is_terminal: bool = False