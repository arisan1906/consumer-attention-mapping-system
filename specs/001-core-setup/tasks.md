# Tasks: Project Initialization & Core Setup

**Input**: Design documents from `/specs/001-core-setup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Pytest (backend) and Vitest (frontend) are used to verify the requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize React + Vite project in `frontend/`
- [ ] T002 Initialize FastAPI python project in `backend/`
- [ ] T003 Configure Supabase project environment variables in both `backend/.env` and `frontend/.env`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database tables and API routing skeleton

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Setup PostgreSQL schemas and tables in Supabase by running SQL from `data-model.md`
- [ ] T005 Setup FastAPI core configuration and client initializer for Supabase in `backend/app/database/supabase.py`
- [ ] T006 [P] Configure global CORS, error handling, and logger middleware in `backend/app/main.py`
- [ ] T007 Configure `@supabase/supabase-js` client in `frontend/src/services/supabaseClient.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Secure Authentication & Role-Based Access (Priority: P1) 🎯 MVP

**Goal**: Implement User Registration, Email/Password login, Google OAuth2, JWT validation, and RBAC middleware.

**Independent Test**: Register a user via the UI/API, login, check that JWT is stored, verify the user's role, and access role-restricted API endpoints.

### Tests for User Story 1
- [ ] T008 [P] [US1] Write backend auth contract and JWT validation tests in `backend/tests/test_auth.py`
- [ ] T009 [P] [US1] Write frontend auth flow integration tests in `frontend/tests/auth.test.jsx`

### Implementation for User Story 1
- [ ] T010 [P] [US1] Implement Auth sign-up, sign-in, and OAuth routes in `backend/app/api/auth.py`
- [ ] T011 [US1] Implement FastAPI JWT verification and role-based access control (RBAC) dependency injection middleware
- [ ] T012 [P] [US1] Create frontend login and registration screens using design tokens in `frontend/src/components/Auth/`
- [ ] T013 [US1] Integrate Google OAuth2 sign-in button in frontend using Supabase Auth Client

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Store & Shelf Visual Layout Configuration (Priority: P1)

**Goal**: Implement visual store layout grid/canvas where zones, shelves, and cameras are configured and saved to PostgreSQL.

**Independent Test**: Load the visual editor, drag and place a new shelf/zone, place a camera node, click save, reload page, and verify they load from PostgreSQL.

### Tests for User Story 2
- [ ] T014 [P] [US2] Write layout CRUD endpoint contract tests in `backend/tests/test_layout.py`

### Implementation for User Story 2
- [ ] T015 [P] [US2] Implement store management database queries and routes in `backend/app/api/store.py`
- [ ] T016 [US2] Create responsive React layout canvas using SVG editor rendering store dimensions in `frontend/src/components/LayoutEditor/Canvas.jsx`
- [ ] T017 [US2] Add tools to the SVG editor to place, resize, and delete shelves, zones, and camera markers
- [ ] T018 [US2] Bind layout canvas save/load actions to Supabase API endpoints

**Checkpoint**: Store layouts can be completely configured visually and loaded live.

---

## Phase 5: User Story 3 - Live Camera Stream Integration (Priority: P2)

**Goal**: Stream and view live RTSP/HTTP video feeds directly on the dashboard.

**Independent Test**: Add a camera with an RTSP link in the layout editor and view the live streaming frames playing in the React dashboard.

### Implementation for User Story 3
- [ ] T019 [US3] Implement RTSP camera MJPEG transcoder and relay generator in `backend/app/services/camera_streamer.py` using OpenCV
- [ ] T020 [US3] Expose live camera streaming HTTP endpoints in `backend/app/api/camera.py`
- [ ] T021 [US3] Create live camera player component in `frontend/src/components/LiveStream/CameraPlayer.jsx` rendering the FastAPI multipart HTTP boundary stream

**Checkpoint**: Live RTSP camera feeds display successfully in the dashboard.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and styling polish

- [ ] T022 Apply Data-Dense Dashboard styles, colors, and Fira Sans/Code fonts to all components using `MASTER.md` guidelines
- [ ] T023 Run validation scenarios described in `quickstart.md`
- [ ] T024 Perform final build checks on frontend Vite and backend FastAPI
