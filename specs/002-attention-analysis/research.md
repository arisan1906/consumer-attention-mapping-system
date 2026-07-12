# Phase 0 Research: Technical Decisions for Shopper Tracking

## 1. Pixel-to-Physical Coordinate Mapping (Homography)

### Decision
Use **2D Homography Transformation** (`cv2.getPerspectiveTransform` and `cv2.perspectiveTransform`) to map camera image pixel coordinates $(u, v)$ of the shopper's feet onto the 2D layout plane $(x, y)$ in meters.

### Rationale
- Standard camera perspectives are angled and distorted. Directly using pixel coordinates yields inaccurate spatial mappings.
- Homography matrices require 4 calibration points with known physical coordinates (e.g., corners of a zone or shelf).
- Once calibrated, projecting the bottom-center of the person's bounding box gives accurate physical $(x,y)$ location on the layout canvas.

---

## 2. Real-Time Person Tracking

### Decision
Utilize the built-in **YOLOv8 + ByteTrack** engine provided by Ultralytics (`yolov8n.pt` or `yolov8s.pt` with CUDA enabled).

### Rationale
- Ultralytics YOLOv8 integrates ByteTrack natively via the `model.track(..., persist=True, tracker='bytetrack.yaml')` API.
- The Nano model (`yolov8n`) runs at extremely high speeds (40+ FPS) on the GeForce RTX 3050, leaving ample GPU compute budget for MediaPipe face analysis.
- ByteTrack resolves frame-to-frame occlusions dynamically using association based on detection box overlap and Kalman filtering.

---

## 3. Gaze & Head Pose Attention Estimation

### Decision
Use **MediaPipe Face Mesh (468 landmarks)** in combination with 3D-to-2D Perspective-n-Point (**solvePnP**) face geometry mapping.

### Rationale
- solvePnP matches 2D landmarks (nose tip, chin, eye corners, mouth corners) with generic 3D facial coordinates to compute the head's rotation vector (yaw, pitch, roll).
- Gaze focus is registered if the head yaw/pitch vector intersects with the shelf's vertical plane bounds.
- MediaPipe Face Mesh is highly optimized and operates with high accuracy without needing deep neural network gaze trackers.
