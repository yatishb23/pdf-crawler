from pydantic import BaseModel


class BookResult(BaseModel):
    title: str
    url: str
    source: str
    type: str = "PDF"
