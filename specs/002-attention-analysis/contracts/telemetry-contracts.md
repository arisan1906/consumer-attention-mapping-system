# Telemetry Contracts Design

This document details the interface contract for the WebSocket live telemetry streaming.

## WS `/api/stores/{store_id}/live-telemetry`

Establishes a WebSocket connection to stream real-time shopper physical positions and gaze indicators directly to client dashboards.

### 1. Connection Handshake
* **Request Headers:**
  * `Sec-WebSocket-Protocol: jwt-access-token` (required for authentication verification)

---

### 2. Server-to-Client Broadcast (Every 100ms)
The backend streams current active tracking paths.
* **Payload Format (JSON):**
  ```json
  {
    "store_id": "store-uuid",
    "timestamp": "2026-07-07T14:40:00Z",
    "active_tracks": [
      {
        "track_id": 105,
        "x": 5.4,
        "y": 2.1,
        "is_looking_at_shelf": true,
        "focused_shelf_id": "shelf-uuid",
        "active_zone_id": "zone-uuid",
        "gaze_vector": {
          "yaw": -12.4,
          "pitch": 4.5
        }
      }
    ]
  }
  ```

---

### 3. Error Codes (WS Close Status)
- `4001`: Invalid JWT token credentials.
- `4002`: Selected store does not exist.
- `4003`: Unauthorized role permissions.
