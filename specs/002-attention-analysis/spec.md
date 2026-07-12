# Feature Specification: Shopper Tracking & Attention Analysis

**Feature Branch**: `002-attention-analysis`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Implement Milestone 2: Shopper tracking with YOLOv8 & ByteTrack, gaze estimation & head pose using MediaPipe, and dwell time analytics with live database storage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Shopper Detection & Tracking (Priority: P1)

An analyst needs to monitor unique shoppers walking through store zones and view their paths in real-time on the store layout.

**Why this priority**: Core foundation of behavioral analytics. Requires detecting people and tracking them continuously across frames even with temporary occlusions.

**Independent Test**: Feed a video stream containing multiple walking people to the tracking engine, verify that bounding boxes are drawn, unique Track IDs are assigned, and track coordinates are updated continuously.

**Acceptance Scenarios**:

1. **Given** a camera stream containing a shopper entering a zone, **When** processed by the tracking engine, **Then** a unique track ID is initialized, and their coordinates are mapped to the store layout.
2. **Given** a shopper temporarily blocked behind an obstacle, **When** they reappear, **Then** ByteTrack re-identifies them with the same track ID (within 3 seconds of occlusion).

---

### User Story 2 - Shelf Engagement & Dwell Time Analytics (Priority: P1)

A retail store manager needs to see how long each shopper dwells inside specific zones and in front of individual product shelves.

**Why this priority**: Directly measures product shelf performance.

**Independent Test**: Measure the time a tracked shopper stays within the bounding coordinate box of a shelf zone and verify that a Dwell Event is logged with correct start/end times and total duration.

**Acceptance Scenarios**:

1. **Given** a tracked shopper whose bounding box overlaps with a defined zone, **When** they stay in that zone, **Then** the system accumulates their dwell time.
2. **Given** a shopper exiting the zone, **When** the session ends, **Then** the total dwell time is logged to the database.

---

### User Story 3 - Gaze Focus & Head Pose Estimation (Priority: P2)

A marketing manager needs to know if a shopper is actively looking at a shelf or just passing by.

**Why this priority**: Disentangles physical presence from active attention.

**Independent Test**: Feed a close-up camera frame of a shopper's face to the head pose estimator and verify it correctly detects whether they are facing forward/looking toward the shelf plane.

**Acceptance Scenarios**:

1. **Given** a shopper standing near a shelf, **When** their head pose yaw/pitch values align with the shelf orientation plane, **Then** an "Attention Focus Event" is registered.

---

### Edge Cases

- **Crowded Store (Occlusions)**: When multiple shoppers overlap, tracking IDs must not swap arbitrarily.
- **Fast Passing Shoppers**: Shoppers crossing a zone in under 1 second should not be counted as a "dwell" event (minimum threshold of 2 seconds required).
- **Face Occlusions**: If a shopper turns away from the camera completely, head pose estimation should fall back gracefully to body orientation estimation or register status as "Unknown gaze".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run YOLOv8 object detection on camera frames.
- **FR-002**: System MUST use ByteTrack/DeepSORT to assign unique track IDs to detected people.
- **FR-003**: System MUST compute shopper physical layout coordinates by projecting pixel coordinates onto the 2D store plane.
- **FR-004**: System MUST check if shopper coordinates intersect with defined Zone/Shelf bounding boxes.
- **FR-005**: System MUST compute dwell time duration for each unique shopper in active zones.
- **FR-006**: System MUST estimate head pose yaw/pitch/roll angles using MediaPipe Face Mesh.
- **FR-007**: System MUST log tracking sessions, dwell times, and attention focus events directly to the database.

### Key Entities

- **Tracking Session**:
  - `id`: UUID (Primary Key)
  - `store_id`: UUID (Foreign Key)
  - `track_id`: INTEGER (YOLO/ByteTrack assigned ID)
  - `start_time`: TIMESTAMP
  - `end_time`: TIMESTAMP
- **Telemetry Frame Log**:
  - `session_id`: UUID (Foreign Key)
  - `camera_id`: UUID (Foreign Key)
  - `x_coord`: FLOAT, `y_coord`: FLOAT
  - `head_yaw`: FLOAT, `head_pitch`: FLOAT
  - `timestamp`: TIMESTAMP
- **Dwell Event**:
  - `id`: UUID (Primary Key)
  - `session_id`: UUID (Foreign Key)
  - `zone_id`: UUID (Foreign Key)
  - `shelf_id`: UUID (Foreign Key, optional)
  - `duration`: FLOAT (seconds)
  - `gaze_duration`: FLOAT (seconds)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Object detection and tracking runs at minimum 15 frames per second (FPS) on the RTX 3050 GPU.
- **SC-002**: Tracking ID retention accuracy is above 85% during standard shopper path overlaps.
- **SC-003**: Dwell time calculations are accurate to within 1.0 second compared to manual stopwatch measurements.
- **SC-004**: Telemetry logs are flushed to database in batches with write latency under 150ms.

## Assumptions

- Camera streams are fed continuously to the backend script.
- MediaPipe Face Mesh will run on CPU or GPU dynamically depending on configuration.
- We will store tracking analytics and Dwell Events in PostgreSQL for query dashboard retrieval, and raw frame logs in MongoDB or as JSON arrays.
