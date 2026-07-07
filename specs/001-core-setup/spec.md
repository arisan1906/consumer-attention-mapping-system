# Feature Specification: Project Initialization & Core Setup

**Feature Branch**: `001-core-setup`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Implement Milestone 1: Setup React + FastAPI, Supabase Database & Auth, and Store/Shelf mapping layout management, with live camera streaming (no mock data)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Authentication & Role-Based Access (Priority: P1)

Retail staff must register and sign in securely to access appropriate dashboards. Google OAuth2 and Email/Password flows must be supported.

**Why this priority**: Core security boundary. Role-based access ensures only authorized roles (Store Manager, Retail Analyst, Marketing Manager, Administrator) can view dashboards and manage configurations.

**Independent Test**: Can be verified by creating a user via sign-up, logging in via Email/Password or Google OAuth, and confirming that the received JWT contains the correct role and allows access to restricted endpoints.

**Acceptance Scenarios**:

1. **Given** a new user on the sign-up page, **When** they fill out email, password, and select a role (e.g., Retail Analyst) or connect via Google, **Then** a secure profile is created in Supabase Auth and metadata points to their role.
2. **Given** an existing user, **When** they login with credentials, **Then** they receive a JWT and are redirected to their role-specific dashboard.

---

### User Story 2 - Store & Shelf Visual Layout Configuration (Priority: P1)

An administrator or store manager needs to define the physical layout of the store, shelves, zones, and camera placements visually.

**Why this priority**: Required for consumer movement tracking and attention analytics in future milestones. Stores physical dimensions and maps layout coords.

**Independent Test**: User can drag/resize zones and place cameras on a visual canvas representing the store layout, click "Save", and verify the coordinates are saved live to the Supabase database.

**Acceptance Scenarios**:

1. **Given** an authorized Administrator, **When** they open the layout designer, **Then** they can input store dimensions, view a visual grid, add shelves/zones, place camera markers, and click Save.
2. **Given** saved layout coordinates, **When** the page is reloaded, **Then** the canvas renders the shelves, zones, and camera locations correctly from Supabase.

---

### User Story 3 - Live Camera Stream Integration (Priority: P2)

A store manager needs to link a live security/retail camera feed to a store layout position and monitor it.

**Why this priority**: Ensures the video stream is live and accessible before tracking models are applied in Milestone 2.

**Independent Test**: Link an RTSP or HTTP video stream to a camera on the layout canvas and watch the live stream render directly in the UI dashboard.

**Acceptance Scenarios**:

1. **Given** a camera feed URL (RTSP/HTTP), **When** assigned to a layout camera, **Then** the UI plays the live video stream with low latency.

---

### Edge Cases

- **Session Expiry**: When a user's JWT expires, they must be redirected automatically to the login page without losing unsaved canvas layout states (auto-save or warn user).
- **Invalid Stream URL**: If a camera stream URL is offline or invalid, the UI should show a graceful "Camera Offline" placeholder instead of crashing the dashboard.
- **Concurrent Layout Edits**: If two managers edit the same store layout simultaneously, conflicts should be prevented or handled (last-write-wins with warning, or session locking).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: FastAPI backend MUST connect to Supabase database.
- **FR-002**: React frontend MUST connect to Supabase Auth and DB via client library.
- **FR-003**: System MUST support Email/Password sign-up/login and Google OAuth2 login.
- **FR-004**: System MUST store Store, Zone, Shelf, and Camera metadata in Supabase PostgreSQL tables.
- **FR-005**: UI MUST provide an interactive SVG or Canvas-based visual editor to define shelves, zones, and cameras.
- **FR-006**: Backend/Frontend MUST stream and render live video feeds (transcoding RTSP to WebRTC/MJPEG/HLS if needed).
- **FR-007**: API endpoints MUST enforce JWT verification and role restrictions.

### Key Entities

- **User Profile**:
  - `id`: UUID (Primary Key, matches Supabase Auth ID)
  - `role`: VARCHAR (Admin, Store Manager, Analyst, Marketing)
  - `store_id`: UUID (Foreign Key to Store, optional)
- **Store**:
  - `id`: UUID (Primary Key)
  - `name`: VARCHAR
  - `location`: VARCHAR
  - `width`: FLOAT (meters)
  - `height`: FLOAT (meters)
- **Zone**:
  - `id`: UUID (Primary Key)
  - `store_id`: UUID (Foreign Key)
  - `name`: VARCHAR
  - `x_min`: FLOAT, `y_min`: FLOAT, `x_max`: FLOAT, `y_max`: FLOAT (bounding coordinates in layout)
- **Shelf**:
  - `id`: UUID (Primary Key)
  - `store_id`: UUID (Foreign Key)
  - `zone_id`: UUID (Foreign Key)
  - `name`: VARCHAR
  - `x_min`: FLOAT, `y_min`: FLOAT, `x_max`: FLOAT, `y_max`: FLOAT
  - `layers`: INTEGER (number of vertical shelves)
- **Camera**:
  - `id`: UUID (Primary Key)
  - `store_id`: UUID (Foreign Key)
  - `name`: VARCHAR
  - `stream_url`: VARCHAR (RTSP/HTTP live feed URI)
  - `location_x`: FLOAT, `location_y`: FLOAT (x, y placement coordinates)
  - `status`: VARCHAR (Online, Offline)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authentication JWT issue and role validation is completed under 200ms.
- **SC-002**: Visual layout canvas successfully saves up to 50 active elements (shelves/zones) to Supabase within 1 second.
- **SC-003**: Live video streams render in under 2 seconds latency from the source feed.
- **SC-004**: System supports multi-role access control, blocking unauthorized roles from viewing layouts/cameras.

## Assumptions

- We are using Supabase Auth, PostgreSQL, and storage capabilities.
- Live video streams will be transcoded to a browser-compatible format (like HLS or WebRTC) by FastAPI if browsers cannot play RTSP directly.
- The default styling follows the design system tokens defined in `MASTER.md` (colors, spacing, and Fira Sans/Fira Code fonts).
