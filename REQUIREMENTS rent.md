# RentShield — Software Requirements Document
**Version:** 2.0  
**Status:** Draft  
**Last Updated:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Stakeholders & Roles](#2-stakeholders--roles)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Architecture](#5-system-architecture)
6. [Database Requirements](#6-database-requirements)
7. [API Requirements](#7-api-requirements)
8. [AI Layer Requirements](#8-ai-layer-requirements)
9. [Real-Time Requirements](#9-real-time-requirements)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Security Requirements](#11-security-requirements)
12. [Performance & Scalability](#12-performance--scalability)
13. [DevOps & Infrastructure](#13-devops--infrastructure)
14. [Demo & Seed Data](#14-demo--seed-data)
15. [Deliverables Checklist](#15-deliverables-checklist)
16. [Glossary](#16-glossary)

---

## 1. Project Overview

### 1.1 Purpose

RentShield is a production-grade, multi-role housing transparency platform built to empower tenants, hold landlords accountable, and facilitate fair dispute resolution through community governance.

### 1.2 Goals

- Enable tenants to anonymously report housing issues without fear of retaliation
- Use AI to verify evidence integrity and auto-categorize complaints
- Use a simulated DAO (Decentralized Autonomous Organization) model to resolve disputes fairly
- Expose a public landlord reputation system based on issue history
- Display a geographic heatmap of housing issues across city areas

### 1.3 Scope

This document covers all functional and non-functional requirements for the full-stack RentShield platform — backend REST API, frontend React application, AI integration, real-time communication, and database design.

---

## 2. Stakeholders & Roles

### 2.1 Role Definitions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `tenant` | Renter who files housing complaints | Report issues, upload evidence, view own cases |
| `landlord` | Property owner registered on the platform | View complaints against their properties, respond to disputes |
| `dao_member` | Community juror who reviews escalated disputes | Access case queue, cast votes, view vote history |
| `admin` | Platform administrator | Full access — user management, role changes, case escalation, system stats |

### 2.2 Role Assignment

- Users self-select their role at registration (`tenant`, `landlord`)
- `dao_member` and `admin` roles are assigned by an existing `admin` via the admin panel
- A user can only hold one role at a time

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Users must register with email, password, display name, and role selection | Must Have |
| AUTH-02 | Users must be able to log in and receive a JWT access token (15-min expiry) | Must Have |
| AUTH-03 | A refresh token (7-day expiry) must be issued in an httpOnly cookie | Must Have |
| AUTH-04 | Token refresh must silently renew the access token without re-login | Must Have |
| AUTH-05 | Logout must invalidate the refresh token server-side | Must Have |
| AUTH-06 | Every protected route must enforce role-based access control | Must Have |
| AUTH-07 | Passwords must be hashed using bcrypt with a minimum of 12 salt rounds | Must Have |

### 3.2 Issue Reporting (Tenant)

| ID | Requirement | Priority |
|----|-------------|----------|
| ISS-01 | Tenants must be able to create a housing issue report via a multi-step form | Must Have |
| ISS-02 | Issue form must capture: property, category, severity (1–5), and description (min 50 chars) | Must Have |
| ISS-03 | Tenants must be able to toggle anonymous reporting; when anonymous, `reporterId` must NOT be stored | Must Have |
| ISS-04 | Issues must default to status `Reported` on creation | Must Have |
| ISS-05 | Tenants must be able to view all their previously submitted issues | Must Have |
| ISS-06 | Issue categories must be limited to: Safety, Maintenance, Harassment, Discrimination | Must Have |
| ISS-07 | Issue severity must be an integer from 1 (low) to 5 (critical) | Must Have |

### 3.3 Evidence Management

| ID | Requirement | Priority |
|----|-------------|----------|
| EVI-01 | Tenants must be able to upload multiple evidence files (images, PDFs, videos) per issue | Must Have |
| EVI-02 | Evidence files must be uploaded to Cloudinary via Multer | Must Have |
| EVI-03 | Server must validate MIME type of uploaded files (not just file extension) | Must Have |
| EVI-04 | Maximum file size per upload must be enforced at 10MB | Must Have |
| EVI-05 | EXIF metadata must be extracted from image files using the `exifr` npm package | Must Have |
| EVI-06 | A `tamperScore` (0.0–1.0) must be computed for each image based on EXIF analysis rules | Must Have |
| EVI-07 | Raw EXIF data must be stored as JSON in the `Evidence.metadata` field | Should Have |
| EVI-08 | Evidence upload must automatically trigger AI analysis of the parent issue | Must Have |

#### 3.3.1 Tamper Score Computation Rules

| Condition | Score Addition |
|-----------|---------------|
| Missing GPS or timestamp fields | +0.2 |
| Software tag present (Photoshop, GIMP, etc.) | +0.4 |
| Inconsistent timestamp (EXIF vs file modified date) | +0.2 |
| Implausible metadata (future dates, etc.) | +0.2 |
| **Maximum cap** | **1.0** |

### 3.4 AI Verdict System

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-01 | Upon issue creation or evidence upload, the AI service must be triggered automatically | Must Have |
| AI-02 | The AI must analyze the issue description and return a structured JSON verdict | Must Have |
| AI-03 | AI verdict must include: `category`, `confidenceScore`, `reasoning`, `flaggedKeywords`, `severitySuggestion` | Must Have |
| AI-04 | The AI verdict must be stored in the `AIVerdict` table linked to the issue | Must Have |
| AI-05 | The Anthropic Claude API (`claude-sonnet-4-20250514`) must be used for NLP analysis | Must Have |
| AI-06 | The AI confidence score must be displayed to DAO members during case review | Must Have |
| AI-07 | If AI confidence is below 0.5, the issue must be flagged for manual DAO review | Should Have |

### 3.5 DAO Dispute Resolution

| ID | Requirement | Priority |
|----|-------------|----------|
| DAO-01 | Admins must be able to escalate any issue to a DAO case | Must Have |
| DAO-02 | Each DAO case must be assigned exactly 10 jurors (randomly selected from `dao_member` pool) | Must Have |
| DAO-03 | Each assigned juror must be able to cast one vote per case: Sustain or Dismiss | Must Have |
| DAO-04 | Jurors must provide a written reason alongside their vote | Should Have |
| DAO-05 | A juror must not be able to vote more than once per case (enforced by unique DB constraint) | Must Have |
| DAO-06 | Cases must be resolved by simple majority (>5 votes) | Must Have |
| DAO-07 | Admins must be able to manually close a case and record the resolution | Must Have |
| DAO-08 | DAO members must be able to view their full voting history | Must Have |
| DAO-09 | Live vote tally must update in real-time via Socket.io without page refresh | Must Have |

### 3.6 Issue Lifecycle & Status

Issue status must follow this state machine:

```
Reported → Under_Review → Resolved
                       → Dismissed
```

| ID | Requirement | Priority |
|----|-------------|----------|
| LIF-01 | Issue status must only be changed by Admin or DAO members | Must Have |
| LIF-02 | Every status change must broadcast a Socket.io event to relevant users | Must Have |
| LIF-03 | Issue detail page must show a full timeline of status changes | Should Have |

### 3.7 Property & Landlord System

| ID | Requirement | Priority |
|----|-------------|----------|
| PROP-01 | Landlords must be able to create and manage their properties | Must Have |
| PROP-02 | Each property must have an address, area, city, and optional GPS coordinates | Must Have |
| PROP-03 | Each property must have a `riskScore` (integer) that is recalculated on issue resolution | Must Have |
| PROP-04 | Landlord public profiles must display: all properties, issue history, reputation score trend | Must Have |
| PROP-05 | Landlord reputation score must be derived from severity and resolution outcomes | Must Have |
| PROP-06 | Landlords must be able to respond to disputes via the comment system | Must Have |

### 3.8 Public Heatmap

| ID | Requirement | Priority |
|----|-------------|----------|
| MAP-01 | A publicly accessible heatmap page must display issue density by location | Must Have |
| MAP-02 | The map must use Mapbox GL JS with a heatmap layer | Must Have |
| MAP-03 | Heatmap data must be served as GeoJSON from `/api/heatmap` | Must Have |
| MAP-04 | Users must be able to filter the heatmap by category, severity, and date range | Must Have |
| MAP-05 | Clicking a cluster must display a popup with the list of issues in that area | Should Have |
| MAP-06 | At high zoom levels, individual property markers must appear | Should Have |
| MAP-07 | No authentication must be required to view the heatmap | Must Have |

### 3.9 Comment System

| ID | Requirement | Priority |
|----|-------------|----------|
| COM-01 | Authenticated users must be able to post comments on any issue | Must Have |
| COM-02 | Each comment must record the author's role (tenant, landlord, dao) | Must Have |
| COM-03 | Admins must be able to delete any comment | Must Have |

### 3.10 Admin Panel

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | Admins must be able to view a list of all registered users | Must Have |
| ADM-02 | Admins must be able to change any user's role | Must Have |
| ADM-03 | Admins must be able to delete users | Must Have |
| ADM-04 | Admins must have access to platform-wide statistics | Must Have |
| ADM-05 | Admin dashboard must include a 30-day issue trend chart (Recharts area chart) | Must Have |
| ADM-06 | Admins must be able to escalate issues to DAO cases | Must Have |

---

## 4. Non-Functional Requirements

### 4.1 Reliability

- The API must return appropriate HTTP status codes for all error conditions
- All database writes must use transactions where multiple tables are affected
- The application must handle and log all unhandled promise rejections

### 4.2 Maintainability

- Codebase must follow a clear monorepo structure with `/client` and `/server` directories
- All environment configuration must be managed via `.env` files — no hardcoded secrets
- Prisma ORM must be used for all database interactions — no raw SQL queries
- Code must be organized by domain (routes, services, middleware, hooks, pages)

### 4.3 Usability

- The application must be WCAG 2.1 Level AA compliant
- Dark mode must be the default theme with a persistent toggle
- All data-loading states must use skeleton loaders (not spinners)
- All empty states must include clear calls to action
- Form validation errors must be shown inline below the relevant field

### 4.4 Portability

- The full stack must be runnable locally with `npm run dev` from the root after `npm install` and DB migration
- A `docker-compose.yml` must be provided to run PostgreSQL (and optionally the full app)
- Environment variable templates (`.env.example`) must be included for both client and server

---

## 5. System Architecture

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────┐
│                   CLIENT                     │
│   React 18 + Vite + Tailwind + shadcn/ui    │
│   react-router-dom │ Axios │ Socket.io-client│
│   Recharts │ Mapbox GL JS │ React Hook Form  │
└──────────────────────┬──────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────┐
│                   SERVER                     │
│         Node.js 20+ + Express.js            │
│   JWT Auth │ Multer │ Socket.io │ Zod       │
│   Morgan + Winston │ express-rate-limit      │
└──────┬──────────────┬───────────────┬────────┘
       │              │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────────┐
│  PostgreSQL │ │ Cloudinary │ │ Anthropic API │
│  (Prisma)   │ │  Storage   │ │ Claude Sonnet │
└─────────────┘ └────────────┘ └───────────────┘
```

### 5.2 Monorepo Structure

```
rentshield/
├── docker-compose.yml
├── package.json              ← runs client + server concurrently
├── .env.example
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── index.js
│       ├── socket.js
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── lib/
└── client/
    └── src/
        ├── contexts/
        ├── hooks/
        ├── lib/
        ├── components/
        └── pages/
```

---

## 6. Database Requirements

### 6.1 Database Engine

- **Engine:** PostgreSQL 15+
- **ORM:** Prisma (schema-first)
- **Migrations:** Managed via `prisma migrate dev`
- **Connection:** Single Prisma client singleton in `server/src/lib/prisma.js`

### 6.2 Enums

| Enum Name | Values |
|-----------|--------|
| `Role` | `tenant`, `landlord`, `dao_member`, `admin` |
| `IssueCategory` | `Safety`, `Maintenance`, `Harassment`, `Discrimination` |
| `IssueStatus` | `Reported`, `Under_Review`, `Resolved`, `Dismissed` |
| `CommentAuthorRole` | `tenant`, `landlord`, `dao` |

### 6.3 Models

#### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | String | Unique |
| passwordHash | String | bcrypt hashed |
| role | Role | Enum |
| displayName | String? | Optional |
| refreshToken | String? | Stored server-side for rotation |
| createdAt | DateTime | Auto |

#### Property
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| landlordId | UUID | FK → User |
| address | String | Full street address |
| area | String | Neighbourhood |
| city | String | City name |
| latitude | Float? | Optional GPS |
| longitude | Float? | Optional GPS |
| riskScore | Int | Default 0, recalculated on events |
| createdAt | DateTime | Auto |

#### Issue
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| propertyId | UUID | FK → Property |
| category | IssueCategory | Enum |
| severity | Int | 1–5 |
| status | IssueStatus | Default: Reported |
| description | String | Min 50 chars (enforced client-side) |
| isAnonymous | Boolean | Default: true |
| reporterId | UUID? | Null when isAnonymous = true |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto-updated |

#### Evidence
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| issueId | UUID | FK → Issue |
| fileUrl | String | Cloudinary URL |
| fileType | String | image / pdf / video |
| exifValid | Boolean | Default: false |
| tamperScore | Float | 0.0 = clean, 1.0 = tampered |
| metadata | Json? | Raw EXIF data |
| uploadedAt | DateTime | Auto |

#### AIVerdict
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| issueId | UUID | Unique FK → Issue |
| confidenceScore | Float | 0.0–1.0 |
| autoCategory | String | AI-suggested category |
| reasoning | String | Explanation from Claude |
| flaggedKeywords | String[] | Array of matched terms |
| generatedAt | DateTime | Auto |

#### DAOCase
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| issueId | UUID | Unique FK → Issue |
| status | String | Pending / Voting / Closed |
| resolution | String? | Final decision text |
| openedAt | DateTime | Auto |
| closedAt | DateTime? | Set on case close |

#### DAOVote
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| caseId | UUID | FK → DAOCase |
| jurorId | UUID | FK → User |
| vote | Boolean | true = Sustain, false = Dismiss |
| reason | String? | Juror explanation |
| votedAt | DateTime | Auto |
| **Constraint** | | @@unique([caseId, jurorId]) |

#### Comment
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| issueId | UUID | FK → Issue |
| authorId | UUID | FK → User |
| authorRole | CommentAuthorRole | Enum |
| content | String | Comment body |
| createdAt | DateTime | Auto |

---

## 7. API Requirements

### 7.1 General Conventions

- All endpoints prefixed with `/api`
- All responses return JSON
- Success responses: `{ success: true, data: {...} }`
- Error responses: `{ success: false, message: "..." }`
- Authentication via `Authorization: Bearer <token>` header
- Rate limiting applied globally and per-endpoint group

### 7.2 Auth Routes (`/api/auth`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | /register | Public | Create account (email, password, role, displayName) |
| POST | /login | Public | Returns JWT + sets httpOnly refresh cookie |
| POST | /refresh | Public | Rotates access + refresh tokens |
| POST | /logout | Authenticated | Clears refresh token server-side |
| GET | /me | Authenticated | Returns current user object |

### 7.3 Issues Routes (`/api/issues`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | / | Public | List issues; filterable by status, category, area |
| POST | / | Tenant | Create new issue |
| GET | /:id | Public | Single issue with evidence + verdict |
| PATCH | /:id/status | Admin / DAO | Update issue status |
| DELETE | /:id | Admin | Delete issue |
| GET | /my | Tenant | Authenticated tenant's own issues |

### 7.4 Evidence Routes (`/api/evidence`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | /upload/:issueId | Tenant | Upload file → Cloudinary → trigger AI |
| GET | /:issueId | Authenticated | Get evidence list for issue |
| DELETE | /:id | Admin | Remove evidence |

### 7.5 AI Routes (`/api/ai`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | /analyze/:issueId | Internal | Trigger NLP + EXIF analysis |
| GET | /verdict/:issueId | Authenticated | Get AI verdict for an issue |

### 7.6 DAO Routes (`/api/dao`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | /cases | DAO Member | List active cases assigned to this juror |
| POST | /cases/:issueId | Admin | Open a DAO case for an issue |
| POST | /cases/:caseId/vote | DAO Member | Submit vote with optional reason |
| GET | /cases/:caseId/votes | DAO Member | Get full vote tally |
| POST | /cases/:caseId/close | Admin | Finalize resolution |
| GET | /history | DAO Member | Own voting history |

### 7.7 Properties Routes (`/api/properties`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | / | Public | List all properties |
| POST | / | Landlord | Create property |
| GET | /:id | Public | Property details + linked issues |
| PATCH | /:id | Landlord | Update property (own only) |

### 7.8 Landlords Routes (`/api/landlords`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | / | Public | All landlords with reputation scores |
| GET | /:id | Public | Full public landlord profile + history |

### 7.9 Heatmap Route (`/api/heatmap`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | / | Public | GeoJSON FeatureCollection for Mapbox heatmap layer |

### 7.10 Comments Routes (`/api/comments`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | /:issueId | Authenticated | Get all comments for an issue |
| POST | /:issueId | Authenticated | Post a comment |
| DELETE | /:id | Admin | Delete a comment |

### 7.11 Admin Routes (`/api/admin`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | /users | Admin | List all users with roles |
| PATCH | /users/:id/role | Admin | Change user role |
| DELETE | /users/:id | Admin | Remove user |
| GET | /stats | Admin | Platform-wide metrics |

---

## 8. AI Layer Requirements

### 8.1 Model

- **Provider:** Anthropic
- **Model:** `claude-sonnet-4-20250514`
- **Location:** `server/src/services/aiService.js`

### 8.2 NLP Issue Analysis

**Trigger:** Automatically on issue creation and evidence upload.

**System Prompt:**
> You are an expert housing issue analyst for a tenant rights platform. Analyze the issue description and return ONLY valid JSON. Do not include any text outside the JSON object.

**Required Response Schema:**
```json
{
  "category": "Safety | Maintenance | Harassment | Discrimination",
  "confidenceScore": 0.0,
  "reasoning": "brief explanation",
  "flaggedKeywords": ["keyword1", "keyword2"],
  "severitySuggestion": 1
}
```

### 8.3 Evidence Integrity Analysis

- Extract EXIF using `exifr` npm package
- Compute `tamperScore` using the rules in section 3.3.1
- Store raw EXIF as JSON in `Evidence.metadata`
- Optionally call Claude with EXIF summary for a natural language integrity report

### 8.4 Error Handling for AI

- If Claude API returns an error, log it and set `confidenceScore` to `null`
- Do not block the issue creation flow if AI analysis fails
- Retry failed AI calls once before giving up

---

## 9. Real-Time Requirements

### 9.1 Technology

- **Library:** Socket.io (server) + Socket.io-client (React)
- **Transport:** WebSocket with long-polling fallback

### 9.2 Rooms

| Room | Members | Purpose |
|------|---------|---------|
| `tenant:${userId}` | Individual tenant | Personal issue notifications |
| `dao` | All DAO members | Vote and case updates |
| `admin` | All admins | System-wide events |

### 9.3 Server-Emitted Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `issue:status_changed` | `{ issueId, newStatus }` | Admin/DAO updates status |
| `dao:vote_cast` | `{ caseId, voteTally }` | Any juror submits a vote |
| `ai:verdict_ready` | `{ issueId, verdict }` | AI analysis completes |
| `evidence:analyzed` | `{ evidenceId, tamperScore }` | Evidence processing finishes |

### 9.4 Client Behavior

- On `issue:status_changed`: show toast notification and refresh issue status pill
- On `dao:vote_cast`: update live vote tally bar chart without page refresh
- On `ai:verdict_ready`: display verdict card on tenant's issue detail page
- On `evidence:analyzed`: update tamper score display on evidence item

---

## 10. UI/UX Requirements

### 10.1 Design System — "Civic Noir"

A dark, authoritative government-tech aesthetic — sharp, trustworthy, data-forward.

#### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0a0f1e` | Page background |
| `--bg-secondary` | `#111827` | Card backgrounds |
| `--bg-tertiary` | `#1a2235` | Elevated surfaces |
| `--border` | `#1f2d45` | Borders |
| `--accent-primary` | `#3b82f6` | CTAs, links, focus rings |
| `--accent-secondary` | `#06b6d4` | Highlights, badges |
| `--accent-danger` | `#ef4444` | High severity, alerts, errors |
| `--accent-warning` | `#f59e0b` | Medium severity, warnings |
| `--accent-success` | `#10b981` | Resolved, success states |
| `--text-primary` | `#f1f5f9` | Body text |
| `--text-secondary` | `#94a3b8` | Labels, subtitles |
| `--text-muted` | `#475569` | Placeholders, disabled |

#### Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | DM Sans (Google Fonts) | 500–700 |
| Body | Inter | 400–500 |
| Monospace (IDs, scores) | JetBrains Mono | 400 |

### 10.2 Page Requirements

#### Landing Page (`/`)
- Hero with tagline and dual CTA buttons ("Report an Issue", "View Heatmap")
- Live stats bar: total issues, landlords tracked, DAO resolutions
- 4-step visual "How It Works" flow
- Anonymized recent issues ticker
- No authentication required

#### Tenant Dashboard (`/dashboard/tenant`)
- Summary cards: My Issues count, Pending AI Review count, Active DAO Cases
- My Issues table with status pills and quick actions
- Prominent "Report New Issue" button
- Real-time socket notifications

#### Report Issue Page (`/report`)
- Multi-step stepper form (4 steps)
- Step 1: Property selection or manual address
- Step 2: Category dropdown, severity slider, description textarea
- Step 3: Drag-and-drop evidence upload with previews
- Step 4: Anonymity toggle + review + submit
- Zod validation enforced at each step
- AI verdict result card displayed after submission

#### Landlord Dashboard (`/dashboard/landlord`)
- Properties list with color-coded risk scores (green ≤ 30, yellow ≤ 60, red > 60)
- Issues against properties table (read-only)
- "Respond to Dispute" action per issue (opens comment thread)
- Reputation score widget with Recharts trend line

#### DAO Dashboard (`/dashboard/dao`)
- Case queue — issues awaiting this juror's vote
- Per-case: issue summary, AI verdict, evidence thumbnails, confidence score bar
- Voting panel: Sustain / Dismiss radio buttons + reason textarea
- Already-voted cases greyed out showing their vote
- Live vote tally bar chart via Socket.io

#### Admin Dashboard (`/dashboard/admin`)
- 4 stat cards: Total Issues, Open Cases, Active Users, Avg Resolution Time
- Recharts area chart — issues created over last 30 days
- User management table with inline role change dropdown
- Issue escalation queue
- System health panel

#### Public Heatmap (`/map`)
- Full-screen Mapbox GL JS map
- Heatmap layer from GeoJSON API response
- Sidebar filters: category, severity, date range
- Cluster click popup showing issue list
- Property markers at high zoom levels
- No authentication required

#### Landlord Public Profile (`/landlord/:id`)
- All properties with issue counts
- Reputation score history (Recharts line chart)
- Issue category breakdown (pie chart)
- Recent resolved/dismissed cases
- Fully public — no authentication required

### 10.3 Component Standards

| Component | Requirement |
|-----------|-------------|
| Status pills | Color-coded: Reported (blue), Under Review (amber), Resolved (green), Dismissed (grey) |
| Severity display | 1–2 = green, 3 = amber, 4–5 = red |
| Confidence bars | Animated gradient fill, percentage label |
| Loading states | Skeleton loaders only — no spinners |
| Empty states | Descriptive message + relevant CTA button |
| Forms | Inline validation errors below each field |
| Notifications | `react-hot-toast` for all success/error feedback |

### 10.4 Dark / Light Mode

- Dark mode is the default
- Toggle accessible from the navbar
- Preference persisted to `localStorage`
- Implemented via `ThemeContext` with CSS variables on the `<html>` element
- All component colors must reference CSS variables — no hardcoded hex in JSX

### 10.5 Accessibility

- All interactive elements must have visible focus indicators
- All images must have descriptive `alt` attributes
- Color alone must not be the sole means of conveying information
- Form labels must be explicitly associated with their inputs
- Minimum contrast ratio: 4.5:1 for normal text (WCAG AA)

---

## 11. Security Requirements

| ID | Requirement |
|----|-------------|
| SEC-01 | Access tokens stored in React memory (not localStorage) |
| SEC-02 | Refresh tokens in httpOnly, Secure, SameSite=Strict cookies only |
| SEC-03 | CORS restricted to `CLIENT_URL` environment variable |
| SEC-04 | Global rate limit: 100 requests per 15 minutes per IP |
| SEC-05 | Auth route rate limit: 10 requests per 15 minutes per IP |
| SEC-06 | All inputs validated and sanitized with Zod before any DB write |
| SEC-07 | File MIME type validated server-side — extension alone is insufficient |
| SEC-08 | Maximum file upload size enforced at 10MB server-side |
| SEC-09 | `requireRole(...)` middleware enforced on every protected route |
| SEC-10 | Anonymous reports must never persist `reporterId` to the database |
| SEC-11 | All DB interactions via Prisma ORM — zero raw SQL queries |
| SEC-12 | All secrets referenced from `.env` — never hardcoded in source |

---

## 12. Performance & Scalability

| Metric | Target |
|--------|--------|
| Concurrent users | 10,000 |
| Issue volume | High-density urban scale |
| API response time (p95) | < 300ms |
| Page initial load (LCP) | < 2.5 seconds |
| Heatmap data load | < 1 second for up to 10,000 points |
| Socket.io latency | < 100ms for event delivery |
| DB query timeout | 5 seconds max before error |

### 12.1 Optimization Requirements

- Paginate all list endpoints (default page size: 20)
- Index foreign keys and frequently queried columns in Prisma schema
- Debounce map filter changes before triggering API refetch
- Use skeleton loaders to prevent layout shift during data loading

---

## 13. DevOps & Infrastructure

### 13.1 Environment Variables

#### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Min 32 characters |
| `JWT_REFRESH_SECRET` | Min 32 characters |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend origin for CORS |
| `NODE_ENV` | development / production |

#### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Socket.io server URL |
| `VITE_MAPBOX_TOKEN` | Mapbox public access token |

### 13.2 Docker

- `docker-compose.yml` must include PostgreSQL 15 with a persistent named volume
- `server/Dockerfile` — Node.js 20 Alpine image
- `client/Dockerfile` — Nginx serving Vite production build
- Full stack must boot with `docker-compose up`

### 13.3 Scripts

| Script | Command | Location |
|--------|---------|----------|
| Run dev (both) | `npm run dev` | Root |
| Run server only | `npm run dev:server` | Root |
| Run client only | `npm run dev:client` | Root |
| DB migrate | `npx prisma migrate dev` | `/server` |
| DB seed | `npx prisma db seed` | `/server` |
| Build client | `npm run build` | `/client` |

---

## 14. Demo & Seed Data

All demo accounts use the password: **`Password123!`** (bcrypt-hashed in seed).

### 14.1 Demo Users

| Role | Count | Email Pattern |
|------|-------|---------------|
| admin | 1 | admin@rentshield.com |
| landlord | 15 | landlord1@rentshield.com … landlord15@rentshield.com |
| dao_member | 10 | juror1@rentshield.com … juror10@rentshield.com |
| tenant | 5 | tenant1@rentshield.com … tenant5@rentshield.com |

### 14.2 Seed Properties

- 30 properties total, 2 per landlord
- Spread across 6 city areas: Downtown, Midtown, East Side, West End, Harbor District, Riverside
- Each with realistic addresses and approximate GPS coordinates

### 14.3 Seed Issues

- 50 issues with varied attributes:
  - Categories: evenly distributed across all 4
  - Severities: weighted toward 2–4
  - Statuses: mix of all 4 statuses
  - Dates: spread across last 90 days
  - Descriptions: realistic and category-appropriate

### 14.4 Seed AI Verdicts

- Plausible `AIVerdict` records for all 50 issues
- Confidence scores ranging from 0.3 to 0.97
- Realistic `flaggedKeywords` and `reasoning` text

### 14.5 Seed DAO Cases

- 15 DAO cases in varied states (Pending, Voting, Closed)
- Votes distributed among 10 jurors with realistic reasons

### 14.6 Seed Comments

- 2–5 comments per issue
- Mix of tenant, landlord, and dao author roles

---

## 15. Deliverables Checklist

### Infrastructure
- [ ] `docker-compose.yml` — PostgreSQL + app services
- [ ] `server/Dockerfile`
- [ ] `client/Dockerfile`
- [ ] Root `package.json` with `concurrently` dev script
- [ ] `.env.example` for both server and client

### Backend
- [ ] `server/prisma/schema.prisma` — exact schema from Section 6
- [ ] `server/prisma/seed.js` — all demo data from Section 14
- [ ] `server/src/index.js` — Express app entry with middleware pipeline
- [ ] `server/src/socket.js` — Socket.io setup and room management
- [ ] `server/src/middleware/auth.js` — JWT verify middleware
- [ ] `server/src/middleware/roles.js` — Role-based access control
- [ ] `server/src/middleware/upload.js` — Multer + Cloudinary config
- [ ] `server/src/middleware/rateLimit.js` — Rate limiters
- [ ] `server/src/lib/prisma.js` — Prisma client singleton
- [ ] `server/src/lib/cloudinary.js` — Cloudinary config
- [ ] `server/src/services/aiService.js` — Claude API NLP + evidence scoring
- [ ] `server/src/services/evidenceService.js` — EXIF extraction + tamper score
- [ ] `server/src/services/daoService.js` — Juror selection + vote tallying
- [ ] `server/src/services/reputationService.js` — Risk score recalculation
- [ ] All route files: auth, issues, evidence, ai, dao, properties, landlords, heatmap, comments, admin

### Frontend
- [ ] `client/vite.config.js` and `client/tailwind.config.js`
- [ ] `client/src/main.jsx` and `client/src/App.jsx` (routes + providers)
- [ ] `client/src/contexts/AuthContext.jsx` — full auth state + token management
- [ ] `client/src/contexts/ThemeContext.jsx` — dark/light with localStorage
- [ ] `client/src/lib/axios.js` — Axios instance with JWT refresh interceptor
- [ ] All hooks: useAuth, useSocket, useIssues, useDAO
- [ ] All layout components: Navbar, Sidebar, Footer
- [ ] All shared components: RoleBadge, StatusPill, ConfidenceBar, ReputationScore
- [ ] All issue components: IssueCard, IssueForm, IssueTimeline, EvidenceUploader
- [ ] All DAO components: VotingPanel, JurorBadge
- [ ] HeatmapView component (Mapbox GL JS)
- [ ] All pages: Landing, Login, Register, TenantDashboard, ReportIssue, MyIssues, LandlordDashboard, PropertyManager, DisputeResponse, DAODashboard, CaseReview, VotingHistory, AdminDashboard, UserManager, SystemStats, HeatmapPage, LandlordProfile, NotFound

### Documentation
- [ ] `README.md` — full local setup instructions (install, env config, migrate, seed, run)

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **DAO** | Decentralized Autonomous Organization — here simulated off-chain as a community juror pool |
| **Juror** | A `dao_member` user assigned to review and vote on a dispute case |
| **Tamper Score** | A float (0.0–1.0) indicating the likelihood that an uploaded image has been edited or manipulated |
| **Confidence Score** | A float (0.0–1.0) from the AI indicating how certain it is about an issue's category and severity |
| **Risk Score** | An integer assigned to a property reflecting the volume and severity of unresolved issues |
| **Reputation Score** | A derived score for a landlord based on their properties' risk scores and issue resolution history |
| **EXIF** | Exchangeable Image File Format — metadata embedded in image files (GPS, timestamps, camera info) |
| **Heatmap** | A geographic visualization using color intensity to show issue density across city areas |
| **Escalation** | The admin action of moving an issue from `Under_Review` into formal DAO case proceedings |
| **Anonymous Report** | An issue submitted with `isAnonymous: true`, where `reporterId` is not stored |

---

*RentShield Requirements Document — v2.0 | Confidential*
