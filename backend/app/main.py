from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, store, camera

app = FastAPI(
    title="Consumer Attention Mapping System API", 
    description="Live backend API supporting real-time retail store layout tracking and live video feed relays.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for strict production environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints routers
app.include_router(auth.router)
app.include_router(store.router)
app.include_router(camera.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Consumer Attention Mapping System API",
        "database": "Supabase PostgreSQL connected"
    }
