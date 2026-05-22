from typing import Optional, Any
from pydantic import BaseModel

class Message(BaseModel):
    message: str
    contextId: Optional[str] = None

class RefreshRequest(BaseModel):
    model: Any
    routes: list[Any]