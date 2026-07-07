# Phase 0 Research: Technical Decisions for Core Setup

## 1. Primary Database & Authentication Layer

### Decision
Use **Supabase** as the primary backend-as-a-service for database storage (PostgreSQL) and user authentication (Email/Password + Google OAuth2).

### Rationale
- Supabase provides a production-ready PostgreSQL instance with built-in Auth, Row Level Security (RLS), and Realtime subscriptions.
- The `supabase` MCP server allows direct project management, table creation, and schema migration natively.
- Using `@supabase/supabase-js` simplifies OAuth2 (Google/Azure) and JWT verification dramatically.

### Alternatives Considered
- **Self-hosted PostgreSQL & MongoDB with Custom Auth**: Rejected because implementing secure OAuth2, session refresh tokens, and JWT parsing on a custom FastAPI server takes significant boilerplate.
- **Firebase**: Rejected because PostgreSQL is preferred for relational store-shelf mapping.

---

## 2. Live Video Streaming Pipeline

### Decision
Use **FastAPI** to transcode/relay RTSP camera feeds into browser-compatible **MJPEG (Multipart HTTP Boundary) streams**, which can be rendered directly in a standard `<img />` tag.

### Rationale
- Modern web browsers do not support RTSP natively.
- OpenCV can read RTSP frames continuously, and FastAPI can stream them as an asynchronous generator.
- MJPEG has near-zero latency (<500ms) compared to HLS (which introduces 4-8 seconds of chunk buffering).
- No complex external transcoding servers (like GStreamer or WebRTC gateways) are required for the initial setup.

### Alternatives Considered
- **HLS (HTTP Live Streaming)**: Rejected due to high latency (typically 5-10s), which violates the user's "live data, no mocks" requirement.
- **WebRTC Relay**: Rejected due to high complexity in setup for Milestone 1, though it remains a viable target for Milestone 2.

---

## 3. Interactive Store Layout Editor

### Decision
Build a custom **React SVG-based Canvas Editor**.

### Rationale
- SVG elements are fully interactive, scale responsively, and hook directly into React's event handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`) for drag-and-drop operations.
- Storing coordinates as fractional/percentage dimensions (0 to 100) or meter-based values simplifies storing them in PostgreSQL.

### Alternatives Considered
- **HTML5 Canvas**: Rejected because SVG is easier to style, inspect, and binds directly to React DOM events.
- **React-Grid-Layout**: Too rigid for arbitrary coordinates and physical camera placements.
