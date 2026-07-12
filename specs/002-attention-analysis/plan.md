# Implementation Plan: Shopper Tracking & Attention Analysis

**Branch**: `002-attention-analysis` | **Date**: 2026-07-07 | **Spec**: [spec.md](file:///c:/Users/ARISAN%20A/OneDrive/Desktop/consumer-attention-mapping-system/specs/002-attention-analysis/spec.md)

**Input**: Feature specification from `/specs/002-attention-analysis/spec.md`

## Summary

This feature implements the computer vision worker that handles real-time consumer tracking and gaze attention analysis. Using YOLOv8 and ByteTrack, we detect and track shoppers. Using MediaPipe, we estimate head poses to determine looking focus. A coordinates projection module maps pixel positions to store 2D layout coordinates, logs dwell time data, and streams real-time telemetry to the dashboard via WebSockets.

## Technical Context

**Language/Version**: Python 3.12, JavaScript (Node 20+)

**Primary Dependencies**: ultralytics, mediapipe, opencv-python, supabase-py, FastAPI, WebSockets

**Storage**: Supabase PostgreSQL (Tables: `tracking_sessions`, `dwell_events`, `telemetry_logs`)

**Testing**: Pytest (backend)

**Target Platform**: NVIDIA RTX 3050 Laptop GPU (CUDA 13.1), modern web browsers

**Project Type**: AI Telemetry Service & Real-Time Dashboard

**Performance Goals**: Video processing at 15+ FPS, coordinate calculation < 10ms, database flush batch size = 50 logs.

**Constraints**: GPU VRAM budget 6GB max. Processing must run asynchronously to avoid blocking the main FastAPI web server.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I (Library-First): CV tracking logic and coordinate projection must be written as self-contained Python libraries under `backend/app/services/cv/`.
- Principle II (API / WebSockets): Live telemetry coordinates are broadcasted via a FastAPI WebSocket endpoint.
- Principle III (Observability): Continuous logs reporting processing FPS, camera connection status, and active track count.

## Project Structure

```text
specs/002-attention-analysis/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── telemetry-contracts.md # WebSocket schemas
```

### Source Code Changes

```text
backend/
├── app/
│   ├── api/
│   │   ├── tracking.py     # New API and WebSocket routes
│   │   └── camera.py       # Updated stream router
│   └── services/
│       └── cv/
│           ├── tracking_engine.py  # YOLOv8 + ByteTrack tracker
│           ├── gaze_estimator.py   # MediaPipe Face Mesh head pose
│           └── projector.py        # Homography projection
```

---

## Complexity Tracking

*No violations.*
