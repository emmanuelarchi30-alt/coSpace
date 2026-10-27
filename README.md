# CoSpace — Enterprise Coworking Space Booking Platform

CoSpace is a fullstack, production-grade coworking space reservation platform built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM**, and **PostgreSQL (Supabase)**. It enables professionals and teams to discover, book, and manage high-focus desks, meeting rooms, and acoustic booths by whole hours with real-time validation, hybrid rendering, and a state-of-the-art **Liquid Glass** user experience.

The platform is fortified with strict route protections, cryptographic session rotation, end-to-end idempotency, in-memory rate limiting, and an edge perimeter powered by **Cloudflare**.

---

## 1. Architecture & Technology Stack

| Layer | Technology | Justification & Role in the Project |
|---|---|---|
| **Framework** | **Next.js 16.4.3 (App Router with Turbopack)** | Native server and client component hybrid rendering (SSG, SSR, CSR), route handlers, and proxy middleware. |
| **Language** | **TypeScript 5.x (Strict Mode)** | 100% type safety with zero `any` across the entire codebase for enterprise reliability. |
| **Database & ORM** | **PostgreSQL (Supabase) + Prisma ORM 6.4.1** | Strongly typed relational models with connection pooling (PgBouncer) and automated schema migrations. |
| **Authentication** | **JWT (jose & jsonwebtoken) + bcryptjs** | Dual-token authentication (Access Token 15m + Refresh Token 7d) in HTTP-only, Secure, SameSite cookies with SHA-256 database token rotation. |
| **Edge Security** | **Cloudflare Tunnel (`cloudflared`)** | Zero-trust perimeter shielding origin server from direct exposure, DDoS mitigation, and edge SSL/TLS. |
| **UI & Styling** | **Tailwind CSS v4 + Liquid Glass Theme** | Custom glassmorphism, responsive navigation, drop-shadow glows, and fluid micro-interactions. |
| **Visual Computing** | **WebGL 2.0 (`<ElectricBorder />` & `<Ferrofluid />`)** | Custom GLSL shader pipelines delivering reactive plasma electric current animations without emojis or third-party UI bloat. |
| **Physics Simulation** | **Matter.js 2D Engine (`<FolderFloat />`)** | Interactive 2D rigid-body physics for rule exploration. |
| **Internationalization** | **Custom React Context (`I18nContext`)** | Instant language switching (Spanish / English) without page reloads. |

---

## 2. Mandatory Business Rules & Implementation

All 14 business rules required by the specification are strictly enforced on the server within [`src/lib/businessRules.ts`](file:///home/cohorte5/Escritorio/cospace/src/lib/businessRules.ts) and validated by automated unit tests:

| Rule | Specification Requirement | Server Implementation & Enforcement |
|:---:|---|---|
| **Rule 1** | Reservation duration must be between **1 and 4 whole hours** (exact on-the-hour marks, e.g. 10:00 to 12:00, no fractional minutes). | `validateDurationAndHours()` verifies minutes, seconds, and milliseconds are strictly zero and duration is an integer between 1 and 4. |
| **Rule 2** | Reservations allowed strictly within business operating hours: **7:00 to 21:00** on the same calendar day. | `validateOperatingHours()` validates start $\ge$ 7:00, end $\le$ 21:00, and ensures start and end dates share identical year, month, and day. |
| **Rule 3** | Prohibited to book in the past or more than **30 days in advance**. | `validateBookingWindow()` verifies `startTime > now` and `startTime <= now + 30 days`. |
| **Rule 4** | Two confirmed reservations **cannot overlap in the same space**. | `validateSpaceOverlap()` queries PostgreSQL with `startTime < requestedEnd AND endTime > requestedStart` for confirmed records. |
| **Rule 5** | A single user **cannot have overlapping reservations** across any space. | `validateUserOverlap()` validates user schedules across the entire database to prevent concurrent booking conflicts. |
| **Rule 6** | Maximum **3 future confirmed reservations** per user at any given time. | `validateUserMaxFutureReservations()` counts active future bookings (`endTime > now`) and caps them at 3. |
| **Rule 7** | Deactivated spaces cannot be booked. | `validateSpaceActive()` verifies `space.isActive === true` before processing any booking attempt. |
| **Rule 8** | Total price is **strictly computed by the server** (`hours * pricePerHour`). Client-supplied amounts are ignored. | `calculateTotalPrice()` multiplies validated duration by database space price, preventing financial tampering. |
| **Rule 9** | Only the reservation owner or an **Administrator** can cancel a booking. | `validateCancellation()` enforces strict identity ownership checks; unauthorized third parties receive a 403 Forbidden. |
| **Rule 10** | Standard users may only cancel up to **2 hours prior** to start time. | `validateCancellation()` checks `startTime - now >= 2 hours` for standard users; Admins retain override cancellation privileges. |
| **Rule 11** | Cancellation sets status to `CANCELLED`; records are **never deleted from the database**. | Route handler updates status to `CANCELLED` and marks associated payment as `REFUNDED` with audit trail recording. |
| **Rule 12** | Spaces are **never physically deleted**; deactivated spaces (`isActive: false`) disappear from public catalog. | Database retains space records; `GET /api/spaces` filters `where: { isActive: true }` for non-admin viewers. |
| **Rule 13** | A space with active future confirmed bookings **cannot be deactivated**. | `validateSpaceDeactivation()` checks future active bookings and rejects deactivation with HTTP 409 Conflict if any exist. |
| **Rule 14** | Strict data isolation (Anti-IDOR): users can neither view nor modify another user's bookings. | Route handlers scope all user queries to `where: { userId: session.userId }`. |

---

## 3. Comprehensive Security Audit & Vulnerabilities Addressed

A full defensive security audit was conducted on the application codebase. A total of **8 vulnerability classes (CWEs)** were systematically evaluated, audited, and resolved:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SECURITY AUDIT MATRIX & REMEDIATION                   │
├──────────────────────────────────┬─────────────────┬────────────────────────┤
│ Vulnerability Class              │ Severity Level  │ Defense Mechanism      │
├──────────────────────────────────┼─────────────────┼────────────────────────┤
│ 1. SQL Injection (CWE-89)        │ Critical        │ Prisma Parameterized   │
│ 2. Cross-Site Scripting (CWE-79) │ High            │ React 19 Auto-Escaping │
│ 3. IDOR / Broken Auth (CWE-639)  │ High            │ Session Scoping        │
│ 4. Privilege Escalation (CWE-269)│ High            │ Hardcoded User Role    │
│ 5. Brute-Force/Flooding (CWE-307)│ Medium / High   │ Sliding Rate Limiter   │
│ 6. Race Conditions (CWE-294)     │ High            │ Idempotency Key Engine │
│ 7. Token Session Attacks(CWE-384)│ High            │ HTTP-Only Cookie + SHA │
│ 8. Missing HTTP Headers (CWE-693)│ Medium          │ Configured Headers     │
└──────────────────────────────────┴─────────────────┴────────────────────────┘
```

### Detailed Vulnerability Analysis

1. **SQL / NoSQL Injection (CWE-89) — Status: ZERO RISK (Immune)**
   - *Mechanic*: Attackers inject malicious SQL statements through inputs to manipulate backend queries.
   - *Audit Result*: Zero instances of raw SQL concatenation or `$queryRawUnsafe`. Every database query is executed through Prisma's typed, parameterized prepared statements.

2. **Cross-Site Scripting — XSS (CWE-79) — Status: ZERO RISK (Immune)**
   - *Mechanic*: Injecting malicious JavaScript payloads into client-side views.
   - *Audit Result*: Zero instances of `dangerouslySetInnerHTML`, `eval()`, or `new Function()`. React 19 automatically escapes all dynamic content rendered in the virtual DOM.

3. **Insecure Direct Object References — IDOR (CWE-639) — Status: MITIGATED**
   - *Mechanic*: Modifying IDs in API requests to view or alter records belonging to other users.
   - *Remediation*:
     - `GET /api/reservations` forces `where: { userId: session.userId }` unless the requester is an authorized Administrator.
     - `PATCH /api/reservations/:id/cancel` inspects `reservation.userId === session.userId` before allowing state transitions.

4. **Privilege Escalation & Role Tampering (CWE-269) — Status: MITIGATED**
   - *Mechanic*: Submitting `role: "ADMIN"` during user registration to gain elevated privileges.
   - *Remediation*: `src/app/api/auth/register/route.ts` strictly ignores any client-provided role and explicitly hardcodes `role: Role.USER`. Administrators can only be created via the database seed script.

5. **Brute Force & Flooding Attacks (CWE-307 / CWE-770) — Status: MITIGATED**
   - *Mechanic*: Automated credential stuffing on login or script-based reservation flooding to exhaust inventory.
   - *Remediation*: In-memory sliding-window rate limiters implemented in [`src/lib/rateLimit.ts`](file:///home/cohorte5/Escritorio/cospace/src/lib/rateLimit.ts):
     - **Login**: Max 15 attempts per 15 minutes per IP + email.
     - **Register**: Max 10 attempts per 15 minutes per IP.
     - **Reservations**: Max 25 booking attempts per 5 minutes per user + IP.
     - Requests exceeding thresholds are rejected with `HTTP 429 Too Many Requests`.

6. **Race Conditions & Double Booking (CWE-294) — Status: MITIGATED**
   - *Mechanic*: Sending rapid concurrent booking requests with identical timestamps to bypass overlap checks.
   - *Remediation*: Full **Idempotency Engine** via `Idempotency-Key` / `x-idempotency-key` headers backed by a PostgreSQL `IdempotencyRecord` table. Duplicate submissions receive the cached response with `X-Cache-Lookup: HIT`.

7. **Cryptographic Session Security & Token Hijacking (CWE-384 / CWE-613) — Status: MITIGATED**
   - *Mechanic*: Stealing authentication tokens from browser storage or intercepting tokens in transit.
   - *Remediation*:
     - Access Tokens (15 min) and Refresh Tokens (7 days) are transmitted solely via `httpOnly: true`, `secure: true`, `sameSite: 'lax'` cookies.
     - Refresh tokens are stored in Supabase as SHA-256 hashes (`hashToken(refreshToken)`), allowing immediate server-side revocation on logout or token rotation.
     - Tokens are never exposed in `localStorage`, `sessionStorage`, or response JSON bodies.

8. **Missing HTTP Security Headers (CWE-693) — Status: RESOLVED**
   - *Mechanic*: Clickjacking via iframe embedding or MIME-type confusion attacks.
   - *Remediation*: Injected strict security headers into both [`next.config.ts`](file:///home/cohorte5/Escritorio/cospace/next.config.ts) and [`src/proxy.ts`](file:///home/cohorte5/Escritorio/cospace/src/proxy.ts):
     - `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
     - `X-Content-Type-Options: nosniff` (MIME sniffing defense)
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `X-XSS-Protection: 1; mode=block`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 4. Why Cloudflare Was Implemented For These Vulnerabilities

To provide defense-in-depth beyond application-level defenses, **Cloudflare Tunnel (`cloudflared`)** was integrated into the operational deployment architecture:

```
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│  Client Browser │ ----> │ Cloudflare Global Edge │ ----> │ Local Next.js Server │
│ (Internet User) │ HTTPS │   DDoS / WAF / SSL     │ QUIC  │   (Port 3000 / App)  │
└─────────────────┘       └────────────────────────┘       └──────────────────────┘
```

### Strategic Reasons for Using Cloudflare:

1. **Perimeter Origin Shielding**:
   - The application origin does not open public inbound ports or expose its IP address. `cloudflared` initiates an outbound-only QUIC tunnel to Cloudflare edge nodes, completely hiding the origin from network scanners.
2. **Edge DDoS & Automated Bot Mitigation**:
   - Application rate limiters handle application-level abuse, but Layer 3, 4, and volumetric Layer 7 floods would consume server CPU and memory. Cloudflare absorbs volumetric attacks at the edge before packets reach the Node.js event loop.
3. **Automated SSL/TLS Termination & Modern Transport**:
   - Provides enterprise-grade TLS with modern cipher suites and accelerates static asset delivery through HTTP/2 and HTTP/3 (QUIC) protocols.
4. **Live Public Access URL**:
   - The project is accessible globally via the secure TryCloudflare tunnel:
     ```
     https://lounge-servers-oval-shark.trycloudflare.com
     ```

---

## 5. Architectural Additions Beyond the Baseline Test

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

## 6. Route Protection Matrix

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

## 7. Project Structure

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

## 8. Installation & Setup Guide

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (Recommended: Node `v22.x`).
- **NPM**: `v10.x` or superior.
- **Internet Connection**: For PostgreSQL on Supabase and Unsplash images.

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <REPOSITORY_URL>
cd cospace
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following variables are present in `.env`:
```env
DATABASE_URL="postgresql://postgres.ucpivpflbgfqzjlqkxhz:coSpace3012%40@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://postgres.ucpivpflbgfqzjlqkxhz:coSpace3012%40@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify"
JWT_ACCESS_SECRET="cospace_super_secret_access_jwt_key_2026_secure_random_string_987654"
JWT_REFRESH_SECRET="cospace_super_secret_refresh_jwt_key_2026_secure_random_string_123456"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Synchronize Database Schema
```bash
npx prisma db push
```

### Step 4: Seed Database with Initial Data
Generates the Administrator, demo user, and initial catalog of spaces:
```bash
npm run seed
```

### Step 5: Run Automated Tests
```bash
npm test
```
*Expected Output*: **33/33 tests passing** across all suites.

### Step 6: Start Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 9. Test Credentials

| Role | Email | Password | Granted Privileges |
|---|---|---|---|
| **Administrator** | `admin@cospace.com` | `AdminPassword123!` | Access to `/admin`, create/edit spaces, toggle space status, cancel any reservation, view all audit logs. |
| **Demo User** | `demo@cospace.com` | `UserPassword123!` | Explore active catalog, book spaces (1-4h), view personal bookings at `/dashboard`, cancel own bookings $\ge$ 2h before start. |

*(Quick-fill buttons with electric plasma borders are provided directly in the login view for single-click credential population).*

---

## 10. Docker Deployment

### Run with Docker Compose (Recommended)
```bash
docker compose up --build -d
```
Monitor logs:
```bash
docker compose logs -f
```
Stop container:
```bash
docker compose down
```

---

## 11. Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | Starts local Next.js development server with Turbopack. |
| `npm run build` | Compiles production build, verifies TypeScript types, and validates SSG/SSR pages. |
| `npm start` | Launches compiled production server. |
| `npm run lint` | Runs ESLint 9 checks for strict code quality standards. |
| `npm run seed` | Executes `prisma/seed.ts` to populate users and catalog spaces. |
| `npm test` | Runs the full 33-test suite (business rules, idempotency, session, security). |
