# Quickstart & Verification Guide (Milestone 2)

This guide provides instructions to run and verify the computer vision tracking and gaze estimation engine.

## Prerequisites

- **NVIDIA GPU** (RTX 3050 Laptop)
- **CUDA 12.1+ / 13.1**
- **pip packages**:
  ```bash
  pip install ultralytics mediapipe opencv-python supabase websockets
  ```

## Running the Tracking Engine

To run the tracking worker on a live camera stream:
```bash
# Navigate to backend/
python -m app.services.cv.tracking_engine --camera-id <camera-uuid>
```

## Verification

### 1. WebSocket Live Stream Verification
Connect a WebSocket client (e.g. Hoppscotch or websocat) to:
`ws://localhost:8000/api/stores/<store-uuid>/live-telemetry`
Verify that JSON updates containing coordinate paths (`active_tracks`) are received continuously.

### 2. Gaze Vector Inspection
Run the gaze visualizer script:
```bash
python -m app.services.cv.gaze_estimator --debug-window
```
It displays the webcam/video feed with head orientation vectors rendered as 3D lines.
