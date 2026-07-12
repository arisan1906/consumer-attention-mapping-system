Milestone 1: Structural Foundations & Core Infrastructure [ you guys can follow your AI recommended flow also, i'm just sharing one of the flows but make sure u meet all expected outcomes]
Welcome to your first major milestone! For this phase, our goal is not to dive headfirst into complex AI models, but rather to lay down the "plumbing"—the robust backend, frontend, database, and stream-handling infrastructure that will support our future retail intelligence workflows.

🎯 Project Overview
Problem Statement
Modern retail environments lack a seamless, automated way to understand how customers interact with physical store shelves. To build a robust Consumer Attention Mapping System, we first need a rock-solid, secure, and scalable infrastructure capable of managing store layouts, user access, and high-throughput video streams before deploying computer vision tracking models.

Aim
To establish a functional, end-to-end foundational architecture—spanning codebase initialization, relational database design, secure user authentication, CRUD operations for retail entities, and camera stream integration using OpenCV.

Objectives
Initialize separate, clean repositories for the frontend and backend.

Design and deploy a PostgreSQL database schema for roles, users, stores, and shelves.

Implement a secure, JWT-based Authentication & Authorization system.

Build RESTful API endpoints for managing store and shelf layouts.

Create a verification script to ingest, process, and display live camera/video streams.

🛠️ Step-by-Step Completion Process
Step 1: Codebase Initialization & Environment Setup
Action: Create two separate repositories: one for the backend (e.g., Node.js/Express, Python/FastAPI, or Django) and one for the frontend (e.g., React, Vue, or Next.js).

Action: Set up environment configuration files (.env) to handle sensitive keys, database URLs, and port numbers securely. Ensure a strict .gitignore is in place.

Step 2: Database Schema Design & Migration
Action: Initialize a PostgreSQL database/ MongoDB

Action: Write and execute migration scripts to build the following core tables:

roles (SuperAdmin, StoreManager, Analyst)

users (Linked to roles with encrypted passwords)

stores (ID, name, location, metadata)

shelves (ID, store_id, shelf_name, zone_coordinates)

Step 3: JWT-Based Authentication & Middleware
Action: Build /api/auth/register and /api/auth/login endpoints. Passwords must be hashed (e.g., using bcrypt).

Action: Generate a JSON Web Token (JWT) upon successful login.

Action: Write authorization middleware to protect subsequent endpoints, ensuring only authorized roles (e.g., StoreManagers) can modify store structures.

Step 4: Store & Shelf Management Endpoints (CRUD)
Action: Build out secure RESTful API routes:

GET /api/stores & POST /api/stores

GET /api/stores/:storeId/shelves & POST /api/stores/:storeId/shelves

Action: Connect these routes to your PostgreSQL database using an ORM (like Prisma, Sequelize, or SQLAlchemy) or raw SQL queries.

Step 5: Video Stream Ingestion (OpenCV Verification)
Action: In the backend, create a dedicated utility script or background service using OpenCV (cv2).

Action: Write a script that hooks into a local webcam, an RTSP video stream, or a sample .mp4 retail video file.

Action: Ensure the script can read frames sequentially, resize them if necessary, and log frame metadata (e.g., timestamp, frame count) to verify stable processing without memory leaks.

📦 Expected Outcomes & Deliverables
By the end of Milestone 1, the following must be delivered and verified:

GitHub Repositories: Two functional repos (Frontend & Backend) with a clean commit history and a structured README detailing how to spin up the local environment.

Database Schema: A live PostgreSQL database matching the architectural design (provide an Entity-Relationship Diagram or a schema dump file).

Postman Collection: A shared Postman collection testing Registration, Login, Token generation, and Store/Shelf CRUD API endpoints (including failure states like unauthorized access).

Stream Script Demo: A working Python/Node script using OpenCV that successfully streams a video file or webcam input to the console/window without crashing.

📚 Recommended Resources & Repositories
To help you hit the ground running, leverage these open-source boilerplate structures and dataset samples:

GitHub Repos & Boilerplates
Backend Auth & Database Foundations:

Node.js/Express: express-js-bootstrap (Excellent architecture pattern for production-ready apps).

Python/FastAPI: fastapi-tiangolo-boilerplate (Includes PostgreSQL setup, JWT auth, and clean routing out of the box).

OpenCV Video Ingestion Patterns:

opencv-video-stream-templates (Look into VideoStream classes for optimized, threaded video processing).

Sample Datasets for Video Testing
Because our next step will involve tracking customers around shelves, you can use these datasets to test your OpenCV stream pipelines:

AICity Dataset / Retail Video Tracking: Look into the AICity Challenge datasets or public security camera feeds on Kaggle.

Retail Store Simulation Videos: You can use generic retail foot-traffic videos from open-source archives like Pexels Retail Footage or the EPFL Shopping Center Dataset to test frame-by-frame processing.

💻 For the Backend Developers (FastAPI, OpenCV, PostgreSQL)
Do not invent your own folder structures. We are using the official FastAPI production blueprint as our standard.

1. Structure Your Repo Exactly Like This:
Make sure your individual repository root matches this layout so your routes, models, and scripts can be copied directly into the main project later:

Plaintext

backend/
├── app/
│   ├── api/          # Put your specific routers here (e.g., video.py, auth.py, layout.py)
│   ├── core/         # DB connections, security/JWT configurations, and core settings
│   ├── models/       # Your SQLModel / PostgreSQL database schemas
│   ├── services/     # Put your OpenCV frame-processing and tracking logic here
│   └── main.py       # FastAPI application initialization
2. Core References:
Architecture & Auth Blueprint: Study tiangolo/full-stack-fastapi-template. Look at how it handles JWT token validation and dependency injection (Depends) for database sessions. Replicate that pattern exactly.

OpenCV / Analytics Ingestion: If you are handling the video processing side, isolate your OpenCV scripts into pure functions inside services/. They should accept a frame or stream buffer and return clean data (like coordinate arrays) without tightly coupling to the FastAPI route logic itself.

🎨 For the Frontend Developers (React)
If you are building dashboard views, layout tools, or user management screens individually, they must look like they belong to the same application when merged.

1. The Design Standard:
We are using Tailwind CSS and shadcn/ui components.

Do not write custom, heavy CSS sheets.

Use Shadcn primitives (Tables, Dialogs, Cards, Buttons) so that your UI components share the exact same styling tokens, spacing, and dark/light mode configurations.

2. Core Reference:
Look at the standard dashboard previews on the Shadcn website. If you are building the user management view, copy their table component structure. If you are building the layout configuration view, use their card and canvas layout patterns.

🚦 The Golden Rule for Everyone: The API Contract
Before you write a single line of logic that connects the frontend to the backend, you must agree on the data shapes. Do not guess what the payload looks like.

Ensure your endpoints match these JSON structures exactly:

User Management Object:

JSON

{
  "id": "uuid",
  "email": "user@company.com",
  "role": "admin",
  "is_active": true
}
Store Layout Object:

JSON

{
  "layout_id": "uuid",
  "name": "Main Floor Plan",
  "zones": [
    {"zone_id": 1, "name": "Aisle 3", "coordinates": [[x1, y1], [x2, y2]]}
  ]
}