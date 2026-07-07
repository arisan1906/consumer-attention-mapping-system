from supabase import create_client, Client
from app.core.config import settings

# Ensure variables are set
if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment")

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
