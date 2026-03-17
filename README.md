# RentShield 2.0 🛡️

**Housing Transparency, Powered by Community**

RentShield is a production-grade multi-role web application designed to empower tenants, hold landlords accountable, and create a transparent ecosystem for housing issues using AI verification and a decentralized tribunal system.

---

## 🌟 Features

*   **Anonymous Reporting:** Tenants can file maintenance or safety issues without fear of retaliation.
*   **AI Evidence Verification:** Uploaded photos and videos are scanned for EXIF tampering and automatically severity-mapped using Anthropic Claude context engines.
*   **DAO Tribunal Architecture:** Complex or disputed cases are escalated to verified platform jurors who vote to sustain or dismiss based on immutable facts, generating binding resolutions.
*   **Reputation Scoring:** Landlords are assigned dynamic trust metrics reflecting their historic responsiveness.
*   **Live Geospatial Heatmaps:** A MapBox-powered public terminal showing aggregated issue density to prospective renters securely.
*   **Multi-Role Dashboards:** Distinct tailored interfaces for Tenants, Landlords, DAO Jurors, and Admins.
*   **Dark Mode Native:** A sleek, "Civic Noir" design language with comprehensive light mode support.

---

## 🏗️ Technology Stack

**Frontend:**
*   React 18 & Vite
*   Tailwind CSS (Civic Noir Aesthetic) & Shadcn/UI
*   React Router, React Hook Form, Zod
*   React-Map-GL (Mapbox)
*   Socket.io Client

**Backend:**
*   Node.js 20+ & Express.js
*   PostgreSQL 15+ & Prisma ORM
*    JWT Authentication (Access & Refresh strategies)
*   Socket.io (Real-time events)
*   Multer & Cloudinary (Evidence Uploads)
*   Anthropic Claude API (AI Context Generation)

---

## 🚀 Quick Run (Development Shell)

RentShield utilizes a monorepo structure. You can spin up both the client and server concurrently from the root directory.

### Prerequisites
*   Node.js v20+
*   Docker & Docker Compose (For the local PostgreSQL instance)
*   API Keys for Anthropic, Cloudinary, and Mapbox.

### 1. Environment Setup

1. Copy `.env.example` to `.env` in the root, `client`, and `server` directories and fill in the required keys.
2. Ensure you have Docker running.

### 2. Database Initialization

```bash
docker-compose up -d db
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed
```
*Note: `npm run seed` will populate the database with comprehensive mock test users, active properties, issues, evidence entries, AI verdicts, and completed DAO tribunal cases.*

### 3. Launching the App

From the **root** directory:
```bash
npm install
npm run dev
```

This will concurrently start:
*   The Backend API on `http://localhost:5000`
*   The Frontend Client on `http://localhost:5173`

---

## 👥 Demo Accounts (From Seeds)

After running the database seed, you can log in directly using these profiles:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@rentshield.com` | `Password123!` | Global oversight, role reassignment, case escalation, system stats. |
| **Tenant** | `tenant1@rentshield.com` | `Password123!` | File anonymous reports, upload evidence, track active issues. |
| **Tenant** | `tenant2@rentshield.com` | `Password123!` | Alternative tenant account for multi-user testing. |
| **Landlord** | `landlord1@rentshield.com` | `Password123!` | View complaints, respond to disputes, track reputation score. |
| **Landlord** | `landlord2@rentshield.com` | `Password123!` | Alternative landlord account for multi-property testing. |
| **DAO Juror** | `juror1@rentshield.com` | `Password123!` | Review escalated cases, cast Sustain/Dismiss votes. |
| **DAO Juror** | `juror2@rentshield.com` | `Password123!` | Alternative juror for live vote tally testing. |

> **Note:** All accounts use the same password `Password123!` (capital P, ends with exclamation mark).
> Full account list: `tenant1–5`, `landlord1–15`, `juror1–10`, `admin` — all at `@rentshield.com`.

## 📦 Deployment (Docker)

RentShield provides Dockerfiles for both services, ready for production orchestration.

```bash
# Build Server
cd server
docker build -t rentshield-server .

# Build Client (Injecting build args for VITE_API_URL)
cd client
docker build --build-arg VITE_API_URL=https://api.yourdomain.com -t rentshield-client .
```

---

## 🔒 Security Posture

*   **Zero-Trust Defaults:** All APIs validate JWT chains on every request.
*   **Role Constraint Middleware:** Distinct separation of concerns via global express router decorators.
*   **Media Sanitization:** File signatures and EXIF structures are natively scanned.
*   **Rate Limiting:** Heavy throttling applied to Auth boundaries preventing bruteforce.

## 📄 License
MIT License.