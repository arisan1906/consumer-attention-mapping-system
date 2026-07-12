# Startup & Feature Navigation Walkthrough

This guide details the step-by-step instructions to configure, run, and navigate the **Consumer Attention Mapping System** (Milestone 1).

---

## 1. Prerequisites

Ensure you have the following software installed:
- **Python**: Version 3.12+
- **Node.js**: Version 20+ (with `npm`)
- **Supabase Account / Project Access**

---

## 2. Setting Up Environment Variables

### A. Backend Environment (`backend/.env`)
Ensure `backend/.env` is configured with the live Supabase credentials:
```env
SUPABASE_URL=https://famuonvjmgakdumlmujk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbXVvbnZqbWdha2R1bWxtdWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDU5MjUsImV4cCI6MjA5ODk4MTkyNX0.VfcV5VXhvhkHDnG3aVgps_PdwSdIAu8lwGQKgDZFPGM
JWT_SECRET=sb_publishable_gV7BO_PQ3fYNH4fH7e3Exg_3yC2sjVb
```

### B. Frontend Environment (`frontend/.env`)
Create `frontend/.env` (if not already present) or verify its parameters:
```env
VITE_SUPABASE_URL=https://famuonvjmgakdumlmujk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbXVvbnZqbWdha2R1bWxtdWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDU5MjUsImV4cCI6MjA5ODk4MTkyNX0.VfcV5VXhvhkHDnG3aVgps_PdwSdIAu8lwGQKgDZFPGM
```

---

## 3. Starting the Servers

### Step 1: Start the Backend FastAPI Server
1. Open a terminal window and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI application using Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. The API will start on **`http://127.0.0.1:8000`**. You can verify it by opening `http://127.0.0.1:8000/docs` in your browser to view the interactive Swagger API documentation.

---

### Step 2: Start the Frontend Vite-React App
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will start on **`http://localhost:5173/`**. Open this link in your browser to interact with the application.

---

## 4. Feature Navigation Walkthrough

Follow this pathway to test and explore the system features in your browser:

### 🔑 1. Role-Based Authentication
1. Go to `http://localhost:5173/`.
2. To sign up a new account, click the **"Sign Up"** link at the bottom.
3. Select your dashboard role:
   - **Admin**: Has full access, including registering new store locations.
   - **Store Manager / Retail Analyst**: Restricted from creating new store locations, but can modify visual layouts.
4. Fill in an email and password and click **"Sign Up"**. The database automatically activates and confirms the account immediately.
5. If logging in to an existing account, use:
   - **Email**: `test_admin@store.com`
   - **Password**: `Password123!`

---

### 🏢 2. Stores Directory Dashboard
1. Once logged in, you are greeted by the **Stores Directory**.
2. **Register a Store (Admin only)**: 
   - Fill out the form on the right panel (Store Name, Location/Address, Width, and Height).
   - Click **"Register Store"**. The store is instantly saved to Supabase and renders in the left-hand stores list.
3. Every store in the directory features two actions: **Edit Layout** and **Live Feeds**.

---

### 🎨 3. Interactive Store Layout Canvas Editor
1. Click **"Edit Layout"** on any store. The 2D grid canvas editor will load.
2. **Add a Zone**:
   - Click the **"+ Add Zone"** button in the toolbar.
   - Draw a zone by clicking and dragging on the grid coordinate canvas.
   - Type in the Zone Name (e.g. `Dairy Section`) when prompted. A transparent blue border box will appear.
3. **Add a Shelf**:
   - Click the **"+ Add Shelf"** button.
   - Click and drag inside your zone to create a shelf block.
   - Enter the name (e.g. `Milk Rack A`) and layers count (e.g. `4`). A solid dark blue block will render.
4. **Place a Camera Node**:
   - Click the **"+ Place Camera"** button.
   - Click anywhere on the grid where the physical camera is located.
   - A modal will slide in. Name your camera (e.g. `Entrance Camera`) and enter its live RTSP link.
   - Click **"Save Camera"** to write the camera directly to PostgreSQL.
5. **Save Changes**:
   - Click the orange **"Save Layout"** button to store all zone and shelf coordinates in the database.

---

### 📹 4. Live Video Streaming Relay
1. Click **"Back to Stores"** in the top-left to return to the directory.
2. Click **"Live Feeds"** for your store.
3. The dashboard loads all registered cameras for that location.
4. Each camera card features built-in Play/Pause and Reload buttons. The player frame proxies raw RTSP frames into standard multipart MJPEG video stream buffers in the browser seamlessly.

---

## 5. Verification & Tests

To execute tests and verify that the system is fully healthy:

- **Backend API Tests**:
  ```bash
  cd backend
  pytest
  ```
- **Frontend Unit Tests**:
  ```bash
  cd frontend
  npm run test
  ```
- **Frontend Production Compilation**:
  ```bash
  cd frontend
  npm run build
  ```
