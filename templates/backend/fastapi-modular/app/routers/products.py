from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4, UUID
from datetime import datetime

router = APIRouter(prefix="/products", tags=["products"])

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ProductResponse(ProductCreate):
    id: UUID
    is_active: bool = True
    created_at: datetime

# In-memory sample data
db_products: List[ProductResponse] = [
    ProductResponse(
        id=uuid4(),
        name="FastAPI Starter Item",
        description="Async High-Performance Python",
        price=79.99,
        is_active=True,
        created_at=datetime.utcnow()
    )
]

@router.get("", response_model=List[ProductResponse])
def list_products():
    return db_products

@router.post("", response_model=ProductResponse, status_code=201)
def create_product(payload: ProductCreate):
    item = ProductResponse(
        id=uuid4(),
        name=payload.name,
        description=payload.description,
        price=payload.price,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db_products.append(item)
    return item
