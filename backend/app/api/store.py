from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.database.supabase import supabase
from app.api.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/stores", tags=["Stores"])

class StoreCreatePayload(BaseModel):
    name: str
    location: str
    width: float
    height: float

class ZonePayload(BaseModel):
    name: str
    x_min: float
    y_min: float
    x_max: float
    y_max: float

class ShelfPayload(BaseModel):
    zone_name: str
    name: str
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    layers: int = 1

class SaveLayoutPayload(BaseModel):
    zones: list[ZonePayload]
    shelves: list[ShelfPayload]

@router.get("")
async def list_stores(current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("stores").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_store(
    payload: StoreCreatePayload, 
    current_user: dict = Depends(require_roles(["Admin"]))
):
    try:
        res = supabase.table("stores").insert({
            "name": payload.name,
            "location": payload.location,
            "width": payload.width,
            "height": payload.height
        }).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Store registration failed")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{store_id}/layout")
async def get_store_layout(store_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Fetch zones
        zones_res = supabase.table("zones").select("*").eq("store_id", store_id).execute()
        # Fetch shelves
        shelves_res = supabase.table("shelves").select("*").eq("store_id", store_id).execute()
        # Fetch cameras
        cameras_res = supabase.table("cameras").select("*").eq("store_id", store_id).execute()
        
        return {
            "store_id": store_id,
            "zones": zones_res.data,
            "shelves": shelves_res.data,
            "cameras": cameras_res.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{store_id}/layout")
async def save_store_layout(
    store_id: str, 
    payload: SaveLayoutPayload, 
    current_user: dict = Depends(require_roles(["Admin", "Store Manager"]))
):
    try:
        # 1. Clear existing shelves and zones for this store (cascade will apply if needed, but we clear explicitly)
        # Note: Shelves depend on Zones so delete shelves first
        supabase.table("shelves").delete().eq("store_id", store_id).execute()
        supabase.table("zones").delete().eq("store_id", store_id).execute()
        
        # 2. Insert new zones
        inserted_zones = {}
        for z in payload.zones:
            z_res = supabase.table("zones").insert({
                "store_id": store_id,
                "name": z.name,
                "x_min": z.x_min,
                "y_min": z.y_min,
                "x_max": z.x_max,
                "y_max": z.y_max
            }).execute()
            if z_res.data:
                inserted_zones[z.name] = z_res.data[0]["id"]
                
        # 3. Insert new shelves
        for s in payload.shelves:
            zone_id = inserted_zones.get(s.zone_name)
            if not zone_id:
                # If zone not found, assign to first inserted zone or create a default zone
                if inserted_zones:
                    zone_id = list(inserted_zones.values())[0]
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Zone '{s.zone_name}' must be defined in the zones array first."
                    )
            
            supabase.table("shelves").insert({
                "store_id": store_id,
                "zone_id": zone_id,
                "name": s.name,
                "x_min": s.x_min,
                "y_min": s.y_min,
                "x_max": s.x_max,
                "y_max": s.y_max,
                "layers": s.layers
            }).execute()
            
        return {"status": "success", "message": "Store layout updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
