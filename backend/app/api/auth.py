from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database.supabase import supabase

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    role: str
    store_id: Optional[str] = None

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

# Helper to verify token and extract user profile + role
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Validate session/JWT token with Supabase GoTrue Auth
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        # Retrieve user profile role and store mapping
        profile_res = supabase.table("profiles").select("*").eq("id", res.user.id).execute()
        if not profile_res.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not found in database"
            )
        
        profile = profile_res.data[0]
        return {
            "id": res.user.id,
            "email": res.user.email,
            "role": profile.get("role"),
            "store_id": profile.get("store_id")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

# Helper to restrict endpoints by role
def require_roles(allowed_roles: list[str]):
    async def dependency(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return dependency

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterPayload):
    if payload.role not in ['Admin', 'Store Manager', 'Retail Analyst', 'Marketing Manager']:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    try:
        # Sign up user in Supabase auth
        auth_res = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password
        })
        
        if not auth_res.user:
            raise HTTPException(status_code=400, detail="Authentication signup failed")
            
        # Write role & store mapping to profiles table
        profile_data = {
            "id": auth_res.user.id,
            "role": payload.role,
            "store_id": payload.store_id
        }
        
        supabase.table("profiles").insert(profile_data).execute()
        
        return {
            "id": auth_res.user.id,
            "email": payload.email,
            "role": payload.role
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(payload: LoginPayload):
    try:
        # Sign in with password
        auth_res = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        
        if not auth_res.session:
            raise HTTPException(status_code=400, detail="Authentication login failed")
            
        # Get role
        profile_res = supabase.table("profiles").select("role").eq("id", auth_res.user.id).execute()
        role = profile_res.data[0].get("role") if profile_res.data else "User"
        
        return {
            "access_token": auth_res.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": auth_res.user.id,
                "email": auth_res.user.email,
                "role": role
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user
