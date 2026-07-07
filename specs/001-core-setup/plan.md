# Implementation Plan: Project Initialization & Core Setup

**Branch**: `001-core-setup` | **Date**: 2026-07-07 | **Spec**: [spec.md](file:///c:/Users/ARISAN%20A/OneDrive/Desktop/consumer-attention-mapping-system/specs/001-core-setup/spec.md)

**Input**: Feature specification from `/specs/001-core-setup/spec.md`

## Summary

This feature initializes the React.js frontend, FastAPI backend, and Supabase integration to support live data (no mocks) for User Authentication (Email/Password + Google OAuth2), Store & Shelf Layout mapping, and live camera feed streaming.

## Technical Context

**Language/Version**: Python 3.12, JavaScript (ES6+ / Node 20+)

**Primary Dependencies**: FastAPI, Uvicorn, Python-Supabase, `@supabase/supabase-js`, React 19, Vite, Lucide-React, OpenCV-Python (for RTSP camera stream relaying)

**Storage**: Supabase PostgreSQL (Primary DB & Auth), MongoDB (Secondary telemetry store, initialized but idle)

**Testing**: Pytest (backend), Vitest (frontend)

**Target Platform**: Linux Server / Docker containers, Chrome / modern web browsers

**Project Type**: Web application (Vite-React frontend + FastAPI backend)

**Performance Goals**: Auth API response < 200ms, Live camera stream latency < 2 seconds, Database save/read < 100ms.

**Constraints**: Zero hardcoded mock data. Real live data for all schemas and active RTSP/HTTP streams.

**Scale/Scope**: Up to 10 concurrent camera streams, 100+ stores, 500+ shelves, 4 user roles.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I (Library-First): Backend endpoints and streaming logic should be structured as clean, modular services/libraries under `backend/app/services`.
- Principle II (CLI / API Interface): Expose structured JSON APIs with clear validation errors using Pydantic.
- Principle III (Test-First): Write test cases for auth verification, schema validation, and layout storage endpoints.

## Project Structure

```text
specs/001-core-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── api-contracts.md # API endpoints schema
```

### Source Code Layout

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── store.py
│   │   └── camera.py
│   ├── core/
│   │   └── config.py
│   ├── database/
│   │   └── supabase.py
│   └── services/
│       ├── camera_streamer.py
│       └── layout_manager.py
└── tests/
    ├── conftest.py
    ├── test_auth.py
    └── test_layout.py

frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── LayoutEditor/
│   │   └── LiveStream/
│   ├── services/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

**Structure Decision**: Web Application structure utilizing backend/ for FastAPI server and frontend/ for React SPA built with Vite.

## Complexity Tracking

*No violations.*
