# API Contracts Design

This document details the interface contracts for the FastAPI backend services.

## Authentication Restrictive Gateway

All `/api/` endpoints except `/api/auth/login` and `/api/auth/register` require a valid JWT header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### POST `/api/auth/register`
Creates a new user profile linked to Supabase Auth.
* **Request Body:**
  ```json
  {
    "email": "user@store.com",
    "password": "SecurePassword123",
    "role": "Store Manager",
    "store_id": "optional-store-uuid"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "user-uuid",
    "email": "user@store.com",
    "role": "Store Manager"
  }
  ```

### GET `/api/auth/profile`
Retrieves current user's profile metadata and role.
* **Response (200 OK):**
  ```json
  {
    "id": "user-uuid",
    "email": "user@store.com",
    "role": "Store Manager",
    "store_id": "store-uuid"
  }
  ```

---

## 2. Store & Shelf Management Endpoints

### GET `/api/stores`
Lists all registered retail stores.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "store-uuid",
      "name": "Supermarket Downtown",
      "location": "Avenue 5, Block B",
      "width": 30.5,
      "height": 15.0
    }
  ]
  ```

### POST `/api/stores`
Registers a new store location. (Admin role required)
* **Request Body:**
  ```json
  {
    "name": "Supermarket Downtown",
    "location": "Avenue 5, Block B",
    "width": 30.5,
    "height": 15.0
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "store-uuid",
    "name": "Supermarket Downtown"
  }
  ```

### GET `/api/stores/{store_id}/layout`
Retrieves the visual layout details (Zones, Shelves, Camera positions).
* **Response (200 OK):**
  ```json
  {
    "store_id": "store-uuid",
    "zones": [
      {
        "id": "zone-uuid",
        "name": "FMCG Aisle",
        "x_min": 1.2,
        "y_min": 0.5,
        "x_max": 5.4,
        "y_max": 2.8
      }
    ],
    "shelves": [
      {
        "id": "shelf-uuid",
        "zone_id": "zone-uuid",
        "name": "Shelf A1",
        "x_min": 1.5,
        "y_min": 0.6,
        "x_max": 4.5,
        "y_max": 1.2,
        "layers": 4
      }
    ],
    "cameras": [
      {
        "id": "camera-uuid",
        "name": "Front Camera 1",
        "location_x": 3.0,
        "location_y": 0.1,
        "status": "Online"
      }
    ]
  }
  ```

### POST `/api/stores/{store_id}/layout`
Saves the modified store layout (Zones, Shelves, Cameras). (Admin/Store Manager roles)
* **Request Body:**
  ```json
  {
    "zones": [
      {
        "name": "FMCG Aisle",
        "x_min": 1.2,
        "y_min": 0.5,
        "x_max": 5.4,
        "y_max": 2.8
      }
    ],
    "shelves": [
      {
        "name": "Shelf A1",
        "zone_name": "FMCG Aisle",
        "x_min": 1.5,
        "y_min": 0.6,
        "x_max": 4.5,
        "y_max": 1.2,
        "layers": 4
      }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Store layout updated successfully"
  }
  ```

---

## 3. Camera Live Feed Relay Endpoints

### GET `/api/cameras/{camera_id}/stream`
Relays the RTSP stream from the specific camera URL as a browser-compatible Multipart MJPEG stream.
* **Headers returned:**
  * `Content-Type: multipart/x-mixed-replace; boundary=frame`
* **Response:** Continuous binary stream of JPEG image frames.
