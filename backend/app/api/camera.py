from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.database.supabase import supabase
from app.api.auth import get_current_user, require_roles
from app.services.camera_streamer import CameraStreamer

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])

class CameraCreatePayload(BaseModel):
    store_id: str
    name: str
    stream_url: str
    location_x: float
    location_y: float

@router.get("")
async def list_cameras(current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("cameras").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_camera(
    payload: CameraCreatePayload,
    current_user: dict = Depends(require_roles(["Admin", "Store Manager"]))
):
    try:
        res = supabase.table("cameras").insert({
            "store_id": payload.store_id,
            "name": payload.name,
            "stream_url": payload.stream_url,
            "location_x": payload.location_x,
            "location_y": payload.location_y,
            "status": "Offline"
        }).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to register camera")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{camera_id}/stream")
async def stream_camera(camera_id: str):
    try:
        # Query database to retrieve stream URL
        res = supabase.table("cameras").select("stream_url").eq("id", camera_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        stream_url = res.data[0]["stream_url"]
        streamer = CameraStreamer(stream_url)
        
        return StreamingResponse(
            streamer.gen_frames(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
