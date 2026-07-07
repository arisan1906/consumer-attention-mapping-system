# Quickstart & Verification Guide

This guide provides commands to set up, run, and verify the Project Initialization & Core Setup.

## Prerequisites

- **Python 3.12+**
- **Node.js v20+ & npm**
- **Supabase CLI** (optional, database schema can be applied using the Supabase MCP or Console dashboard)
- **Git**

## Setup Instructions

### 1. Database Schema Deployment
Use the Supabase Console SQL Editor or the Supabase MCP server to run the SQL definitions located in [data-model.md](file:///c:/Users/ARISAN%20A/OneDrive/Desktop/consumer-attention-mapping-system/specs/001-core-setup/data-model.md).

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1   # Windows powershell
   ```
3. Install required packages:
   ```bash
   pip install fastapi uvicorn supabase opencv-python pydantic python-dotenv pytest httpx
   ```
4. Create a `.env` file in the `backend/` root directory:
   ```env
   SUPABASE_URL=https://famuonvjmgakdumlmujk.supabase.co
   SUPABASE_KEY=your-supabase-service-role-key-or-anon-key
   ```

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Create React Vite skeleton:
   ```bash
   npx create-vite@latest . --template react
   ```
3. Install dependencies:
   ```bash
   npm install
   npm install @supabase/supabase-js lucide-react
   ```
4. Create a `.env` file in the `frontend/` root:
   ```env
   VITE_SUPABASE_URL=https://famuonvjmgakdumlmujk.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_gV7BO_PQ3fYNH4fH7e3Exg_3yC2sjVb
   ```

---

## Running the Servers

### Run Backend
From the `backend/` directory:
```bash
uvicorn app.main:app --reload --port 8000
```

### Run Frontend
From the `frontend/` directory:
```bash
npm run dev
```

---

## Verification Commands

### 1. Verification of Auth JWT API
To verify user profile retrieval:
```bash
# Register a test user and obtain a JWT
# Replace with actual curl/Postman commands
curl -X POST http://localhost:8000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@store.com\",\"password\":\"secure123\",\"role\":\"Admin\"}"
```

### 2. Verification of Database Layout Operations
```bash
# Get store layout
curl -X GET http://localhost:8000/api/stores/test-store-uuid/layout -H "Authorization: Bearer <JWT>"
```

### 3. Verification of Video stream relay
Open `http://localhost:8000/api/cameras/<camera-uuid>/stream` in browser. It should display the continuous live MJPEG camera feed.
