# Tasks: Shopper Tracking & Attention Analysis

**Input**: Design documents from `/specs/002-attention-analysis/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

---

## Phase 1: Setup & Dependencies

- [ ] T001 Install `ultralytics` and `mediapipe` inside the backend virtual environment
- [ ] T002 Verify CUDA and PyTorch integration (`torch.cuda.is_available()`) on the RTX 3050 GPU

---

## Phase 2: Foundational (CV Core)

- [ ] T003 Implement `backend/app/services/cv/projector.py` supporting 2D homography matrix perspective transform
- [ ] T004 Implement `backend/app/services/cv/gaze_estimator.py` utilizing MediaPipe Face Mesh and solvePnP to extract head pitch, yaw, and roll
- [ ] T005 Implement `backend/app/services/cv/tracking_engine.py` integrating YOLOv8 and ByteTrack to track people and record dwell logs

---

## Phase 3: User Story 1 - Real-Time Shopper Tracking (Priority: P1)

- [ ] T006 Add WebSocket server endpoint in `backend/app/api/tracking.py` to stream live coordinates to clients
- [ ] T007 Add WebSocket support in `frontend/src/services/supabaseClient.js` to connect to layout channels
- [ ] T008 Update React Canvas layout component to subscribe to live WebSocket coordinates and render moving dots representing shoppers in real-time

---

## Phase 4: User Story 2 - Shelf Engagement & Dwell Time Analytics (Priority: P1)

- [ ] T009 Implement active zone intersection detector checking if shopper physical coordinates reside in zone/shelf bounding box
- [ ] T010 Implement stateful session timer logging dwell duration when a shopper enters/exits a bounding box
- [ ] T011 Implement db transaction logging completed Dwell Events to Supabase `dwell_events` table

---

## Phase 5: User Story 3 - Gaze Focus (Priority: P2)

- [ ] T012 Intersect gaze estimation angle vector with vertical shelf coordinates plane to determine focus target
- [ ] T013 Accumulate gaze duration and update Supabase `dwell_events.gaze_duration` metrics

---

## Phase 6: Verification & Polish

- [ ] T014 Run backend tracking tests verifying FPS benchmarks on CUDA GPU
- [ ] T015 Verify real-time WebSockets synchronization under multi-shopper loads
