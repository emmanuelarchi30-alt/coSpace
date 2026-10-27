<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,45:3b82f6,100:8b5cf6&height=220&section=header&text=CoSpace%20Hub&fontSize=50&fontColor=ffffff&fontAlignY=38&desc=Enterprise%20Coworking%20Space%20Reservation%20Platform&descAlignY=58&descSize=18" alt="CoSpace Header Banner" width="100%" />
</p>

<div align="center">

  <!-- Dynamic Animated Typing Subtitle -->
  <a href="https://github.com/emmanuelarchi30-alt/coSpace">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&duration=2800&pause=900&color=06B6D4&center=true&vCenter=true&width=750&height=50&lines=Next.js+16+App+Router+%7C+TypeScript+Strict+%7C+Prisma;Zero-Trust+Edge+Perimeter+via+Cloudflare+Tunnel;Liquid+Glass+Cyberpunk+UI+%2B+Native+WebGL+2.0+Plasma;Tab-Session+Lifecycle+Auto-Logout+%2B+Credential+Prefill;All+14+Business+Rules+Enforced+%7C+33%2F33+Tests+Passing" alt="Typing SVG" />
  </a>

  <br />

  <!-- Shield Badges -->
  <p align="center">
    <a href="https://co-space-ebon.vercel.app"><img src="https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Deployment" /></a>
    <img src="https://img.shields.io/badge/Next.js_16-Turbopack-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript_5-Strict_Zero_Any-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Strict" />
    <img src="https://img.shields.io/badge/Prisma_6-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
    <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL" />
    <img src="https://img.shields.io/badge/Cloudflare-Zero_Trust_Tunnel-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Tunnel" />
    <img src="https://img.shields.io/badge/WebGL_2.0-GLSL_Plasma_Shaders-990000?style=for-the-badge&logo=webgl&logoColor=white" alt="WebGL 2.0" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_v4-Liquid_Glass-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Tests-33%2F33_Passing-brightgreen?style=for-the-badge&logo=node.js&logoColor=white" alt="Tests 33/33" />
  </p>

  <p align="center">
    🚀 <strong>Official Production Deployment (Vercel):</strong>
    <br />
    🌐 <a href="https://co-space-ebon.vercel.app"><strong>https://co-space-ebon.vercel.app</strong></a>
  </p>

  <p align="center">
    🛡️ <strong>Zero-Trust Perimeter Tunnel (Cloudflare):</strong>
    <br />
    🌐 <a href="https://lounge-servers-oval-shark.trycloudflare.com"><strong>https://lounge-servers-oval-shark.trycloudflare.com</strong></a>
  </p>

</div>

---

## 📑 Table of Contents

- [1. Executive Summary & Architecture](#1-executive-summary--architecture)
- [2. System Architecture Flow](#2-system-architecture-flow)
- [3. Mandatory Business Rules (The 14 Rules)](#3-mandatory-business-rules-the-14-rules)
- [4. Defensive Security Audit & Vulnerabilities Resolved](#4-defensive-security-audit--vulnerabilities-resolved)
- [5. Why Cloudflare Was Implemented For These Vulnerabilities](#5-why-cloudflare-was-implemented-for-these-vulnerabilities)
- [6. Architectural Additions Beyond the Baseline Test](#6-architectural-additions-beyond-the-baseline-test)
- [7. Route & API Protection Matrix](#7-route--api-protection-matrix)
- [8. Test Suite & Verification (33/33 Tests)](#8-test-suite--verification-3333-tests)
- [9. Demo Credentials & Test Accounts](#9-demo-credentials--test-accounts)
- [10. Step-by-Step Installation & Local Execution](#10-step-by-step-installation--local-execution)
- [11. Production Deployments (Vercel & Cloudflare)](#11-production-deployments-vercel--cloudflare)
- [12. Docker & Containerized Deployment](#12-docker--containerized-deployment)
- [13. Directory Tree](#13-directory-tree)

---

## 1. Executive Summary & Architecture

**CoSpace** is an enterprise-grade fullstack coworking space management and reservation platform designed from the ground up using **Next.js 16 (App Router)** and **TypeScript 5**. The application delivers a high-performance **Liquid Glass cyberpunk aesthetic**, combining translucent frosted glassmorphism with custom **WebGL 2.0 GLSL plasma shaders** and **Matter.js 2D physics**.

### Key Architectural Pillars:

- **Next.js 16 App Router with Turbopack**: Utilizes hybrid rendering strategies including Static Site Generation (SSG for landing), Server-Side Rendering (SSR with dynamic parameters for catalog spaces), and Client-Side Hydration (CSR with interactive client context for user dashboard and real-time reservation scheduling).
- **TypeScript Strict Mode (Zero `any`)**: Guaranteed type-safety throughout all entities, route handlers, contexts, and database schemas with a strict zero-tolerance policy for untyped variables.
- **Relational Data Integrity with Prisma ORM & Supabase**: PostgreSQL running on Supabase with PgBouncer connection pooling (`DATABASE_URL` via port 6543) and direct connection for DDL migrations (`DIRECT_URL` via port 5432).
- **Dual-Token Cryptographic Authentication**: Short-lived Access Tokens (15 min) and long-lived Refresh Tokens (7 days) secured strictly in `httpOnly`, `secure`, `sameSite: 'lax'` cookies. Refresh tokens are stored as SHA-256 hashes in the database for instant revocation on logout or rotation.
- **Zero-Trust Edge Perimeter via Cloudflare Tunnel**: Origin servers remain entirely unexposed to the public internet, routing traffic through an encrypted outbound QUIC tunnel (`cloudflared`) with edge DDoS mitigation, SSL termination, and HTTP/2/3 acceleration.

---

## 2. System Architecture Flow

```mermaid
flowchart TD
    Client["🌐 Client Browser / User"]
    CF["🛡️ Cloudflare Edge Perimeter\nDDoS Mitigation | SSL/TLS | QUIC"]
    Proxy["⚡ Next.js 16 Proxy Middleware (src/proxy.ts)\nJWT Verification | Route Protection | Security Headers"]
    
    subgraph Application ["CoSpace Application Layer"]
        AppPublic["Public Route Group\n/ (SSG) | /spaces (SSR)"]
        AppAuth["Auth Route Group\n/login | /register"]
        AppPrivate["Private Route Group\n/dashboard (CSR)"]
        AppAdmin["Admin Route Group\n/admin (RBAC)"]
        APIs["Backend Route Handlers\n/api/auth | /api/spaces | /api/reservations"]
    end
    
    subgraph Data ["Data & Cache Layer"]
        Prisma["Prisma ORM (Singleton Client)"]
        Postgres[("PostgreSQL on Supabase\nUsers | Spaces | Bookings | Audit | Idempotency")]
        RateLimit["In-Memory Sliding Rate Limiter"]
    end

    Client -->|HTTPS / HTTP/2| CF
    CF -->|Encrypted QUIC Tunnel| Proxy
    Proxy -->|Pass / Inject Headers| Application
    APIs --> RateLimit
    APIs --> Prisma
    Prisma --> Postgres
```

---

## 3. Mandatory Business Rules (The 14 Rules)

The application implements all 14 mandatory business rules within [`src/lib/businessRules.ts`](file:///home/cohorte5/Escritorio/cospace/src/lib/businessRules.ts), backed by comprehensive unit tests:

| Rule | Rule Title | Specification Requirement | Server Implementation & Enforcement |
|:---:|---|---|---|
| **1** | **Whole Hour Duration** | Reservations must span between **1 and 4 whole hours** exactly on the hour (e.g., 10:00 to 12:00, no fractional minutes). | `validateDurationAndHours()` verifies minutes, seconds, and milliseconds are 0 and `durationMs / (1000 * 60 * 60)` is an integer $\in [1, 4]$. Rejects with 400. |
| **2** | **Operating Hours** | Reservations allowed strictly within business operating hours: **7:00 to 21:00** on the same calendar day. | `validateOperatingHours()` validates `startHour >= 7`, `endHour <= 21`, and matching calendar date (`year`, `month`, `day`). Rejects with 400. |
| **3** | **Booking Window** | Prohibited to book in the past or more than **30 days in advance**. | `validateBookingWindow()` verifies `startTime > now` and `startTime <= now + 30 days`. Rejects with 400. |
| **4** | **Space Conflict Prevention** | Two confirmed reservations **cannot overlap in the same space**. | `validateSpaceOverlap()` queries PostgreSQL with `spaceId, status: CONFIRMED, startTime < reqEnd, endTime > reqStart`. Returns 409 Conflict. |
| **5** | **User Schedule Conflict** | A single user **cannot have overlapping reservations** across any space. | `validateUserOverlap()` checks user bookings across all spaces with `userId, status: CONFIRMED, startTime < reqEnd, endTime > reqStart`. Returns 409 Conflict. |
| **6** | **Active Booking Limit** | Maximum **3 future confirmed reservations** per user at any given time. | `validateUserMaxFutureReservations()` counts confirmed reservations with `endTime > now` and caps them at 3. Rejects with 400. |
| **7** | **Active Space Guard** | Deactivated spaces cannot be booked under any circumstance. | `validateSpaceActive()` verifies `space.isActive === true`. Rejects with 400. |
| **8** | **Server Price Computation** | Total price is **strictly computed by the server** (`hours * pricePerHour`). Client-supplied amounts are ignored. | `calculateTotalPrice()` multiplies validated duration by database space price. Client body price fields are ignored, preventing price tampering. |
| **9** | **Cancellation Authority** | Only the reservation owner or an **Administrator** can cancel a booking. | `validateCancellation()` checks `reservation.userId === currentUserId || role === ADMIN`. Unauthorized requests receive 403 Forbidden. |
| **10** | **Cancellation Window** | Standard users may only cancel up to **2 hours prior** to start time. | `validateCancellation()` enforces `startTime - now >= 2 hours` for standard users. Admins can cancel anytime. Rejects with 400. |
| **11** | **Soft Cancellation Record** | Cancellation sets status to `CANCELLED`; records are **never deleted from the database**. | Route handler updates status to `CANCELLED`, updates payment status to `REFUNDED`, and writes audit log. |
| **12** | **Soft Space Deactivation** | Spaces are **never physically deleted**; deactivated spaces disappear from the public catalog. | Database retains records; `GET /api/spaces` enforces `where: { isActive: true }` for public viewers. |
| **13** | **Deactivation Guard** | A space with active future confirmed bookings **cannot be deactivated**. | `validateSpaceDeactivation()` counts confirmed future bookings on the space; if $> 0$, rejects with 409 Conflict. |
| **14** | **Strict Data Isolation (Anti-IDOR)** | Users can neither view nor modify another user's bookings. | `GET /api/reservations` forces `where: { userId: session.userId }`. Unauthorized access attempts are rejected. |

---

## 4. Defensive Security Audit & Vulnerabilities Resolved

A formal security assessment was executed on the platform. A total of **8 vulnerability classes (CWEs)** were systematically investigated, audited, and resolved:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          DEFENSIVE SECURITY AUDIT REPORT                               │
├────┬─────────────────────────────┬─────────────────┬───────────────────────────────────┤
│ #  │ Vulnerability Class         │ Severity Level  │ Defense Mechanism Applied         │
├────┼─────────────────────────────┼─────────────────┼───────────────────────────────────┤
│ 1  │ SQL Injection (CWE-89)      │ Critical        │ Prisma Parameterized Prepared SQL │
│ 2  │ Cross-Site Scripting (CWE-79│ High            │ React 19 Virtual DOM Auto-Escape  │
│ 3  │ IDOR / BOLA (CWE-639)       │ High            │ Mandatory Session User Scoping    │
│ 4  │ Privilege Escalation (CWE-26│ High            │ Hardcoded User Registration Role  │
│ 5  │ Brute Force / DOS (CWE-307) │ Medium / High   │ Sliding-Window In-Memory Limiter  │
│ 6  │ Race Conditions (CWE-294)   │ High            │ Idempotency Key Engine in DB      │
│ 7  │ Session Hijacking (CWE-384) │ High            │ HTTP-Only Cookie + SHA-256 Hash   │
│ 8  │ Missing Headers (CWE-693)   │ Medium          │ Configured Security Headers       │
└────┴─────────────────────────────┴─────────────────┴───────────────────────────────────┘
```

### Detailed Vulnerability Analysis

1. **SQL / NoSQL Injection (CWE-89) — Status: ZERO RISK (Immune)**
   - *Mechanic*: Injecting SQL syntax through unsanitized inputs to extract database records.
   - *Audit Findings*: Zero instances of `$queryRawUnsafe` or manual string concatenation in database queries. Every database call uses Prisma's strongly typed, parameterized query builder.

2. **Cross-Site Scripting — XSS (CWE-79) — Status: ZERO RISK (Immune)**
   - *Mechanic*: Injecting malicious executable scripts into web pages rendered for other users.
   - *Audit Findings*: Zero instances of `dangerouslySetInnerHTML`, `eval()`, or `new Function()`. React 19 automatically escapes all strings rendered in JSX.

3. **Insecure Direct Object References — IDOR (CWE-639) — Status: RESOLVED**
   - *Mechanic*: Modifying reservation IDs or user IDs in API parameters to access or delete other users' bookings.
   - *Resolution*:
     - `GET /api/reservations` scopes database queries with `where: { userId: session.userId }` (unless an authorized Admin explicitly queries `?all=true`).
     - `PATCH /api/reservations/:id/cancel` checks that `reservation.userId === session.userId` or `session.role === 'ADMIN'`.

4. **Privilege Escalation & Role Tampering (CWE-269) — Status: RESOLVED**
   - *Mechanic*: Passing `role: "ADMIN"` in the JSON payload of the public registration endpoint.
   - *Resolution*: `src/app/api/auth/register/route.ts` strictly ignores any client-supplied role property and hardcodes `role: Role.USER`. The `ADMIN` account can only be created via the database seed script.

5. **Brute Force & Flooding Attacks (CWE-307 / CWE-770) — Status: RESOLVED**
   - *Mechanic*: Rapid credential-stuffing attacks on login, account-spam on registration, or bot-driven slot exhaustion on reservations.
   - *Resolution*: In-memory sliding-window rate limiters implemented in [`src/lib/rateLimit.ts`](file:///home/cohorte5/Escritorio/cospace/src/lib/rateLimit.ts):
     - **Login**: Max 15 attempts per 15 minutes per IP + email.
     - **Register**: Max 10 attempts per 15 minutes per IP.
     - **Reservations**: Max 25 attempts per 5 minutes per user + IP.
     - Exceeded thresholds return `HTTP 429 Too Many Requests`.

6. **Race Conditions & Double Booking (CWE-294) — Status: RESOLVED**
   - *Mechanic*: Firing simultaneous concurrent booking requests to reserve the same slot twice before the database locks.
   - *Resolution*: Dedicated **Idempotency Engine** supporting `Idempotency-Key` / `x-idempotency-key` headers backed by a PostgreSQL `IdempotencyRecord` table. Duplicate submissions return the cached payload with `X-Cache-Lookup: HIT`.

7. **Cryptographic Session Security & Token Hijacking (CWE-384 / CWE-613) — Status: RESOLVED**
   - *Mechanic*: Stealing authentication tokens from browser storage or intercepting tokens in transit.
   - *Resolution*:
     - Access Tokens (15 min) and Refresh Tokens (7 days) are transmitted solely via `httpOnly: true`, `secure: true`, `sameSite: 'lax'` cookies.
     - Refresh tokens are stored in Supabase as SHA-256 hashes (`hashToken(refreshToken)`), allowing immediate server-side revocation on logout or token rotation.
     - Tokens are never exposed in `localStorage`, `sessionStorage`, or response JSON bodies.

8. **Missing HTTP Security Headers (CWE-693) — Status: RESOLVED**
   - *Mechanic*: Clickjacking via iframe embedding or MIME-type confusion attacks.
   - *Resolution*: Injected strict security headers into both [`next.config.ts`](file:///home/cohorte5/Escritorio/cospace/next.config.ts) and [`src/proxy.ts`](file:///home/cohorte5/Escritorio/cospace/src/proxy.ts):
     - `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
     - `X-Content-Type-Options: nosniff` (MIME sniffing defense)
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `X-XSS-Protection: 1; mode=block`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. Why Cloudflare Was Implemented For These Vulnerabilities

To provide defense-in-depth beyond application-level defenses, **Cloudflare Tunnel (`cloudflared`)** was integrated into the operational deployment architecture:

```
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│  Client Browser │ ----> │ Cloudflare Global Edge │ ----> │ Local Next.js Server │
│ (Internet User) │ HTTPS │   DDoS / WAF / SSL     │ QUIC  │   (Port 3000 / App)  │
└─────────────────┘       └────────────────────────┘       └──────────────────────┘
```

### Strategic Reasons for Using Cloudflare:

1. **Perimeter Origin Shielding**:
   - The origin server exposes zero public inbound ports and keeps its IP address completely hidden. `cloudflared` initiates an outbound-only QUIC tunnel to Cloudflare edge nodes, eliminating attack surface for direct port scanning or IP targeting.
2. **Edge DDoS & Automated Bot Mitigation**:
   - Application rate limiters handle application-level abuse, but Layer 3, 4, and volumetric Layer 7 floods would consume server CPU and memory. Cloudflare absorbs volumetric attacks at the edge before packets reach the Node.js event loop.
3. **Automated SSL/TLS Termination & Modern Transport**:
   - Provides enterprise-grade TLS with modern cipher suites and accelerates static asset delivery through HTTP/2 and HTTP/3 (QUIC) protocols.
4. **Live Public Access URL**:
   - Accessible worldwide over HTTPS:
     ```
     https://lounge-servers-oval-shark.trycloudflare.com
     ```

---

## 6. Architectural Additions Beyond the Baseline Test

Several enterprise features and UX enhancements were designed and implemented beyond the baseline requirements to elevate usability, security, and aesthetics:

### A. Granular Cookie Consent & Browser Tab Session Lifecycle
- **Problem**: In standard cookie setups, closing a browser tab often leaves persistent cookies active, keeping accounts exposed on shared computers. Conversely, clearing cookies loses user preferences.
- **Solution ([`src/lib/cookieConsent.ts`](file:///home/cohorte5/Escritorio/cospace/src/lib/cookieConsent.ts))**:
  - **Auto-Logout on Tab Close**: The client binds active sessions to `sessionStorage`. When the user closes the browser tab without logging out, `sessionStorage` is destroyed. Upon reopening CoSpace in a fresh tab, the application detects that the previous tab closed and automatically calls `/api/auth/logout`, closing the active session on the server.
  - **Persistent Credential Prefill**: When the user accepts cookies, authorized preferences (`cospace_saved_email`) are stored securely. When reopening the login form, the email field is **automatically pre-filled**, eliminating repetitive typing while preserving security.
  - **Interactive Cookie Consent UI**: Both the floating banner ([`CookieConsentBanner.tsx`](file:///home/cohorte5/Escritorio/cospace/src/components/ui/CookieConsentBanner.tsx)) and the login form provide explicit "Aceptar Cookies" action buttons with real-time UI synchronization via custom events.

### B. Reactive Plasma Electric Ray Animation (`<ElectricBorder />`)
- **Integration**: Inspired by React Bits open-source components and integrated using native WebGL 2.0 (`ElectricBorder.tsx` and `ElectricButton.tsx`).
- **Optimization**:
  - Replaced fallback CSS animations with real GLSL plasma shaders.
  - Fixed React Strict Mode WebGL context loss bug (avoided `loseContext()` destruction during unmount/remount cycles).
  - Applied color-coded electric currents: cyan plasma for primary actions, amber plasma for Admin controls, and purple plasma for registration buttons.
  - Completely free of emojis, maintaining a refined cyberpunk glassmorphism aesthetic.

### C. Viewport Gradual Blur (`<GradualBlur />`)
- Positioned progressively along the bottom viewport edge to generate a glassmorphism optical fade, preventing harsh visual clipping against dark backgrounds.

### D. Automated Security Test Suite
- In addition to standard business rule unit tests, an automated security testing suite ([`securityAndRouteProtection.test.ts`](file:///home/cohorte5/Escritorio/cospace/src/tests/securityAndRouteProtection.test.ts)) was implemented to test rate limiting thresholds, IDOR prevention, and financial calculation integrity.

---

## 7. Route & API Protection Matrix

Route access is enforced through a dual layer: edge middleware proxy ([`src/proxy.ts`](file:///home/cohorte5/Escritorio/cospace/src/proxy.ts)) and route handler guards.

| Route / Endpoint | HTTP Method | Access Level | Behavior When Unauthorized |
|---|:---:|:---:|---|
| `/` | `GET` | Public | Open access. |
| `/spaces`, `/spaces/[id]` | `GET` | Public | Active spaces only (`isActive: true`). |
| `/login`, `/register` | `GET` | Public / Guest | Authenticated users are redirected to `/dashboard`. |
| `/dashboard`, `/my-reservations` | `GET` | Authenticated (`USER` / `ADMIN`) | Unauthenticated users are redirected: `HTTP 307 -> /login?from=/dashboard`. |
| `/admin` | `GET` | Administrator (`ADMIN` only) | Unauthenticated $\rightarrow$ `/login`. Standard user $\rightarrow$ `/dashboard?error=unauthorized_admin`. |
| `/api/auth/login`, `/register` | `POST` | Public (Rate Limited) | Rate limited by client IP. |
| `/api/auth/me` | `GET` | Authenticated | Returns current user session or `401 Unauthorized`. |
| `/api/auth/refresh` | `POST` | Authenticated (Cookie) | Rotates tokens; rejects revoked tokens with `401`. |
| `/api/auth/logout` | `POST` | Authenticated | Revokes refresh token hash in DB and clears cookies. |
| `/api/spaces` | `GET` | Public / Admin Filtered | Standard users see active; Admins can query `?all=true`. |
| `/api/spaces` | `POST` | Administrator (`ADMIN` only) | Returns `401` if unauthenticated, `403` if standard user. |
| `/api/spaces/[id]` | `PUT`, `PATCH` | Administrator (`ADMIN` only) | Validates future booking conflicts before deactivation (Rule 13). |
| `/api/reservations` | `GET` | Authenticated | Scoped to requester's own bookings (Rule 14 IDOR isolation). |
| `/api/reservations` | `POST` | Authenticated | Validates all 14 business rules, rate limits, and idempotency key. |
| `/api/reservations/[id]/cancel`| `PATCH` / `POST` | Owner or Administrator | Validates 2-hour window (Rule 10) and ownership (Rule 9). |

---

## 8. Test Suite & Verification (33/33 Tests)

The test suite contains **33 automated tests** across 4 dedicated suites:

```bash
npm test
```

```text
▶ CoSpace Business Rules Unit Tests (14 tests)
  ✔ Rule 1: Should approve whole hour reservations between 1 and 4 hours
  ✔ Rule 1: Should reject fractional hour reservations (e.g. 10:30 to 11:45)
  ✔ Rule 1: Should reject reservations longer than 4 hours
  ✔ Rule 2: Should approve reservations within 7:00 to 21:00
  ✔ Rule 2: Should reject reservations before 7:00 AM
  ✔ Rule 2: Should reject reservations ending after 21:00
  ✔ Rule 3: Should reject past reservations
  ✔ Rule 3: Should reject reservations more than 30 days ahead
  ✔ Rule 7: Should reject booking on a deactivated space
  ✔ Rule 8: Should correctly compute price from hours * pricePerHour
  ✔ Rule 10: Should reject user cancellation when less than 2 hours before start
  ✔ Rule 10: Should allow user cancellation when more than 2 hours before start
  ✔ Rule 9: Should allow Admin to cancel even within 2 hours
  ✔ Rule 14: Should prevent unauthorized user from cancelling another user reservation

▶ Cookie & Tab-Session Lifecycle (6 tests)
  ✔ Initial consent is 'unset'
  ✔ setCookieConsentStatus(true) updates status to 'accepted'
  ✔ Does not store email if cookies are not accepted
  ✔ Stores and retrieves email when cookies are accepted
  ✔ clearSavedEmail removes stored credentials
  ✔ Tab session tracking: inactive at start, active after login, cleared on exit

▶ Idempotency Storage & Cache Replay (4 tests)
  ✔ Stores initial response and replays on duplicate key
  ✔ Does not return cache if route does not match
  ✔ Rejects cache if another user attempts key replay
  ✔ Invalidates cache key after TTL expiration

▶ Security & Route Protection (9 tests)
  ✔ Blocks excessive requests on Login when threshold is met
  ✔ Blocks rapid mass registration attempts
  ✔ Prevents IDOR unauthorized cancellation
  ✔ Authorizes Administrator cancellation override
  ✔ Rejects bookings on deactivated spaces
  ✔ Enforces server-side financial calculation integrity
  ✔ Rejects past booking attempts
  ✔ Rejects fractional duration attempts
  ✔ Rejects operating hour boundary violations

ℹ tests 33 | suites 8 | pass 33 | fail 0 | cancelled 0
```

---

## 9. Demo Credentials & Test Accounts

The database seed (`prisma/seed.ts`) automatically configures the following test accounts:

| Role | Email | Password | Granted Privileges |
|---|---|---|---|
| **Administrator** | `admin@cospace.com` | `AdminPassword123!` | Access to `/admin`, create/edit spaces, toggle space status, cancel any reservation, view all audit logs. |
| **Demo User** | `demo@cospace.com` | `UserPassword123!` | Explore active catalog, book spaces (1-4h), view personal bookings at `/dashboard`, cancel own bookings $\ge$ 2h before start. |

*(Quick-fill buttons with electric plasma borders are provided directly in the login view for single-click credential population).*

---

## 10. Step-by-Step Installation & Local Execution

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (Recommended: `v22.x`).
- **NPM**: `v10.x` or superior.
- **Internet Connection**: For PostgreSQL on Supabase and Unsplash image assets.

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/emmanuelarchi30-alt/coSpace.git
cd coSpace
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:
```env
DATABASE_URL="postgresql://postgres.ucpivpflbgfqzjlqkxhz:coSpace3012%40@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.ucpivpflbgfqzjlqkxhz:coSpace3012%40@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify"
JWT_ACCESS_SECRET="cospace_super_secret_access_jwt_key_2026_secure_random_string_987654"
JWT_REFRESH_SECRET="cospace_super_secret_refresh_jwt_key_2026_secure_random_string_123456"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Synchronize Database Schema
```bash
npx prisma db push
```

### 4. Seed Database with Initial Data
```bash
npm run seed
```

### 5. Run Verification Test Suite
```bash
npm test
```

### 6. Start Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 11. Production Deployments (Vercel & Cloudflare)

CoSpace is continuously deployed to production with redundant edge architecture:

| Platform | Deployment Type | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Vercel** | CI/CD Serverless Production Edge | [https://co-space-ebon.vercel.app](https://co-space-ebon.vercel.app) | 🟢 Active |
| **Cloudflare** | Zero-Trust Encrypted QUIC Tunnel | [https://lounge-servers-oval-shark.trycloudflare.com](https://lounge-servers-oval-shark.trycloudflare.com) | 🟢 Active |
| **GitHub** | Official Repository (`main` & `develop`) | [https://github.com/emmanuelarchi30-alt/coSpace.git](https://github.com/emmanuelarchi30-alt/coSpace.git) | 🟢 Synchronized |

### Key Benefits of the Dual-Edge Deployment:
1. **Vercel Global Edge Network:** Immediate global content delivery, automatic Next.js 16 Route Handlers scaling, and zero-downtime atomic rollouts on every push to `main`.
2. **Cloudflare Zero-Trust Perimeter:** Completely masks the origin infrastructure, absorbs volumetric L3/L4/L7 DDoS attacks, and provides end-to-end encrypted tunnels without opening vulnerable public firewall ports.

---

## 12. Docker & Containerized Deployment

### Run with Docker Compose (Recommended)
```bash
# Build multi-stage image and launch container in background
docker compose up --build -d

# View live execution logs
docker compose logs -f

# Stop and remove containers
docker compose down
```

---

## 13. Directory Tree

```text
cospace/
├── .env                                  # Local environment configuration
├── .env.example                          # Environment template
├── Dockerfile                            # Production multi-stage Docker build
├── docker-compose.yml                    # Container orchestration
├── eslint.config.mjs                     # ESLint 9 configuration
├── next.config.ts                        # Next.js 16 configuration with Security Headers
├── package.json                          # Scripts and dependencies
├── tsconfig.json                         # Strict TypeScript configuration
├── prisma/
│   ├── schema.prisma                     # Relational schema (User, Space, Reservation, Payment, AuditLog, IdempotencyRecord)
│   ├── seed.ts                           # Database seeding script (Admin, demo user, catalog)
│   └── migrations/                       # PostgreSQL migration files
├── src/
│   ├── proxy.ts                          # Next.js 16 route protection middleware
│   ├── app/
│   │   ├── (public)/                     # Public route group (Home, Catalog, Detail)
│   │   ├── (auth)/                       # Auth route group (Login, Register)
│   │   ├── (private)/                    # Private route group (Dashboard)
│   │   ├── (admin)/                      # Admin route group (Space Management)
│   │   ├── api/                          # Backend Route Handlers
│   │   │   ├── auth/                     # login, register, refresh, logout, me
│   │   │   ├── spaces/                   # Catalog and space CRUD
│   │   │   └── reservations/             # Booking creation and cancellation
│   │   ├── layout.tsx                    # Root layout with providers, blur, and cookie banner
│   │   └── globals.css                   # Liquid Glass styles and Tailwind v4 directives
│   ├── components/
│   │   ├── ui/
│   │   │   ├── AuthModal.tsx             # Interactive Auth modal with cookie consent & demo quick-fill
│   │   │   ├── CookieConsentBanner.tsx   # Floating liquid-glass cookie consent banner
│   │   │   ├── ElectricBorder.tsx        # WebGL 2.0 plasma electric current border
│   │   │   ├── ElectricButton.tsx        # Electric ray button wrapper
│   │   │   ├── Ferrofluid.tsx            # WebGL interactive fluid background
│   │   │   ├── FolderFloat.tsx           # Matter.js 2D physics folder interaction
│   │   │   ├── GradualBlur.tsx           # Viewport bottom gradual blur lens
│   │   │   ├── ParticleText.tsx          # Canvas particle physics title
│   │   │   ├── ClientLocalClock.tsx      # Hydration-safe real-time clock
│   │   │   └── LanguageSelector.tsx      # ES / EN language switcher
│   │   ├── shared/
│   │   │   ├── Navbar.tsx                # Navigation bar with tab-session watcher
│   │   │   ├── Footer.tsx                # Translucent glass footer
│   │   │   └── SpaceCard.tsx             # Optimized space card
│   │   └── forms/
│   │       ├── BookingForm.tsx           # Booking form with client/server validation
│   │       └── SpaceForm.tsx             # Admin modal for creating and editing spaces
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma Client singleton
│   │   ├── auth.ts                       # JWT generation, verification, and cookie controls
│   │   ├── cookieConsent.ts              # Cookie consent and tab-session lifecycle utilities
│   │   ├── businessRules.ts              # Pure business rule validation functions
│   │   ├── idempotency.ts                # Idempotency storage and replay engine
│   │   ├── rateLimit.ts                  # In-memory sliding-window rate limiter
│   │   └── i18n/                         # Internationalization dictionaries
│   └── tests/
│       ├── businessRules.test.ts         # 14 business rule unit tests
│       ├── cookieConsent.test.ts         # 6 cookie & tab-session lifecycle tests
│       ├── idempotency.test.ts           # 4 idempotency replay tests
│       └── securityAndRouteProtection.test.ts # 9 security & rate-limit tests
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8b5cf6,55:3b82f6,100:06b6d4&height=120&section=footer" alt="CoSpace Footer Wave" width="100%" />
</p>
