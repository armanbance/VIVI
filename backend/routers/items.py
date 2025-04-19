from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/items", tags=["items"])

# Sample Item model
class Item(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float

# Sample in-memory database
items_db = [
    Item(id=1, name="Item 1", description="This is item 1", price=10.5),
    Item(id=2, name="Item 2", description="This is item 2", price=20.0),
    Item(id=3, name="Item 3", price=15.75)
]

@router.get("/", response_model=List[Item])
async def get_items():
    return items_db

@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: int):
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@router.post("/", response_model=Item, status_code=201)
async def create_item(item: Item):
    items_db.append(item)
    return item 