# Zylo — Subscription Management System

## Complete Implementation Plan (6–7 Hour Hackathon Build)

> **Goal:** Build a simple, well-architected subscription management system from scratch using local PostgreSQL — no BaaS platforms. Replace spreadsheets, eliminate missed renewals, and give Indian SMBs real-time financial clarity.

---

## 1. The Real Problem

### What Brightloop Does Today (Thousands of Indian SMBs Face This)

| Task | How it's done now | What goes wrong |
|---|---|---|
| Track subscriptions | Google Sheets / Excel | Rows get deleted, versions conflict, no audit trail |
| Remember renewals | Whoever notices first | ₹2-5L revenue lost per quarter from missed renewals |
| Create invoices | Typed manually in Word/Tally | Wrong amounts, wrong dates, 2-3 hours daily wasted |
| Match payments | Scroll bank statements by eye | Payments misattributed, customers chased wrongly |
| Revenue reports | Built manually each quarter | Takes 3-5 days, always out of date, never trusted |

### Gap in Existing Software (Why Build Zylo?)

| Gap | Detail |
|---|---|
| **Price barrier** | Chargebee = $249/month. A 10-person Indian company can't justify ₹20,000+/month for billing software |
| **Complexity overkill** | Enterprise tools have 200+ settings. A small team needs 10 things, not a cockpit |
| **No actionable work queue** | Every tool shows charts. Nobody shows "call this customer NOW or lose ₹47,000" |
| **Payment reality mismatch** | Indian SMBs receive UPI, bank transfer, cash. Western tools assume Stripe auto-charge |
| **No follow-up tracking** | Who called the customer? When? What did they say? Lives in WhatsApp and memory |
| **Billing-day chaos** | On the 1st of every month, someone spends 4 hours creating 100+ invoices by hand |

### How Zylo Makes It 10x Better

**Today:** 5 tools (Sheets + Word + Tally + Bank App + Memory) → 3-4 hours/day, error-prone  
**With Zylo:** 1 system → login, see what needs doing, do it, done in 20 minutes

---

## 2. Tech Stack (Built From Scratch — No BaaS)

> [!IMPORTANT]
> **Hackathon requirement:** Use local databases (PostgreSQL/MySQL), NOT backend-as-a-service platforms like Firebase, Supabase, or MongoDB Atlas. Build from scratch with minimal third-party dependencies.

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **Next.js 15** (App Router) + TypeScript | Full-stack in one project. Server Components for fast reads, API Routes for clean backend |
| **Database** | **PostgreSQL** (local via Docker or native install) | Industry-standard relational DB. Perfect for financial data. Shows strong DB design skills |
| **ORM** | **Prisma** | Type-safe queries, clean schema file (acts as living documentation), auto-generated migrations |
| **Authentication** | **Custom JWT** + bcrypt (built from scratch) | No auth service dependency. Shows understanding of security fundamentals |
| **Validation** | **Zod** | Runtime type validation on every API input. Clear error messages |
| **Styling** | **Tailwind CSS 4** | Utility-first, mobile-responsive, fast to build clean UIs |
| **Date handling** | **date-fns** | Lightweight, tree-shakable. Handles billing date edge cases (month-end, leap year) |
| **Icons** | **Lucide React** | Clean, consistent icon set |
| **Money** | `Decimal` in Prisma / `NUMERIC(12,2)` in Postgres | No floating-point errors. Displayed as ₹1,23,456.00 via `Intl.NumberFormat('en-IN')` |

### Why These Choices (Not Just Copy-Paste)

- **PostgreSQL over MySQL:** Better support for `NUMERIC` precision (critical for money), `JSONB` for audit details, transactions with proper isolation levels, and CHECK constraints for data integrity
- **Prisma over raw SQL:** The `schema.prisma` file serves as both schema documentation AND migration source. Evaluators can read the data model in one file. Type-safe queries prevent SQL injection without manual parameterization
- **Custom JWT over Supabase/Firebase Auth:** Demonstrates understanding of authentication flow — password hashing with bcrypt (cost factor 12), JWT signing/verification, HTTP-only cookies for session security, middleware-based route protection
- **Next.js API Routes over Express:** Same deployment unit as frontend. No CORS issues. Server Components reduce client-side JavaScript. API routes have built-in request/response handling

### Packages (Minimal — Only What's Needed)

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "^19",
    "react-dom": "^19",
    "@prisma/client": "^6.x",
    "bcryptjs": "^2.4.3",
    "jose": "^5.x",
    "zod": "^3.x",
    "date-fns": "^4.x",
    "clsx": "^2.x",
    "tailwind-merge": "^3.x",
    "lucide-react": "^0.475.0"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "typescript": "^5.x",
    "tailwindcss": "^4.x",
    "@types/bcryptjs": "^2.x"
  }
}
```

> **Why `jose` instead of `jsonwebtoken`?** Next.js middleware runs in the Edge Runtime which doesn't support Node.js `crypto` module. `jose` works in both Node.js and Edge, so one JWT library works everywhere — no workarounds needed.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Admin   │  │    Staff     │  │  Customer Portal │   │
│  │  /admin  │  │   /staff     │  │     /portal      │   │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘   │
└───────┼────────────────┼──────────────────┼──────────────┘
        │                │                  │
  ┌─────▼────────────────▼──────────────────▼──────────────┐
  │               Next.js Middleware                        │
  │  • Reads JWT from HTTP-only cookie                      │
  │  • Verifies token with jose                             │
  │  • Checks role vs route (/admin→admin, /staff→staff,    │
  │    /portal→customer)                                    │
  │  • Rejects unauthorized → redirect to /login            │
  └────────────────────────┬───────────────────────────────┘
                           │
  ┌────────────────────────▼───────────────────────────────┐
  │              Next.js API Routes (/api/*)                │
  │                                                         │
  │  Every endpoint follows this pipeline:                  │
  │                                                         │
  │  1. Extract user from JWT cookie (getUserFromToken)      │
  │  2. Check role permission (requireRole helper)           │
  │  3. Validate input with Zod schema                       │
  │  4. Execute business logic                               │
  │  5. Query/mutate via Prisma (type-safe)                  │
  │  6. Return { data } or { error, code } with HTTP status  │
  │                                                         │
  │  Money rules:                                            │
  │  • NEVER trust browser-submitted totals                  │
  │  • Recalculate server-side using Decimal arithmetic      │
  │  • Round to 2 decimal places at line/tax boundaries      │
  └────────────────────────┬───────────────────────────────┘
                           │
  ┌────────────────────────▼───────────────────────────────┐
  │              PostgreSQL (Local)                          │
  │                                                         │
  │  Safety nets (even if API code has bugs):                │
  │  • UNIQUE constraint on billing_records prevents         │
  │    duplicate invoices for same subscription period       │
  │  • CHECK constraints prevent negative amounts            │
  │  • Foreign keys prevent orphan records                   │
  │  • Transactions ensure atomic billing (all-or-nothing)   │
  │  • Indexes on status, dates, customer_id for speed       │
  │                                                         │
  │  Scale:                                                  │
  │  • All lists paginated (LIMIT/OFFSET in SQL)             │
  │  • Dashboard stats via SQL aggregation (COUNT, SUM)      │
  │  • No "load all rows into memory" anywhere               │
  └────────────────────────────────────────────────────────┘
```

### Modular Code Architecture

```
Zylo/
├── prisma/
│   ├── schema.prisma              # THE source of truth for data model
│   ├── migrations/                # Auto-generated by Prisma
│   └── seed.ts                    # Demo data for development
│
├── lib/
│   ├── db.ts                      # Prisma client singleton
│   ├── auth/
│   │   ├── password.ts            # hashPassword, verifyPassword (bcrypt)
│   │   ├── jwt.ts                 # signToken, verifyToken (jose)
│   │   └── session.ts             # getUserFromRequest, requireRole
│   ├── validations/
│   │   ├── auth.ts                # Login/register schemas
│   │   ├── plans.ts               # Plan create/update schemas
│   │   ├── subscriptions.ts       # Subscription schemas
│   │   ├── invoices.ts            # Invoice schemas
│   │   └── payments.ts            # Payment schemas
│   └── utils/
│       ├── billing.ts             # calculateNextBillingDate, computeBillingPeriod
│       ├── invoice-calc.ts        # calculateInvoiceTotals (server-only)
│       ├── format.ts              # formatINR, formatDate (shared)
│       └── api-response.ts        # success(), error() response helpers
│
├── components/
│   └── ui/
│       ├── page-header.tsx
│       ├── data-table.tsx         # Reusable paginated table
│       ├── status-badge.tsx       # Color-coded status badges
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       ├── error-display.tsx
│       ├── confirm-dialog.tsx
│       ├── form-field.tsx         # Input with label + error message
│       └── pagination.tsx
│
├── app/
│   ├── (auth)/                    # Public auth pages
│   ├── admin/                     # Admin-only pages
│   ├── staff/                     # Staff pages
│   ├── portal/                    # Customer portal
│   └── api/                       # Backend API routes
│
├── middleware.ts                   # JWT verification + role routing
└── .env.local                     # Database URL + JWT secret
```

### Key Design Patterns

| Pattern | Where | Why |
|---|---|---|
| **Repository pattern** | Prisma queries in API routes | Separates data access from business logic. Easy to test/swap |
| **Middleware guard** | `middleware.ts` | Single place for auth. Routes don't repeat auth code |
| **Zod pipeline** | Every POST/PATCH handler | Parse → validate → transform in one step. Type-safe after validation |
| **Atomic transactions** | Billing run, payment recording | `prisma.$transaction()` ensures all-or-nothing. No partial state |
| **Singleton pattern** | `lib/db.ts` | One Prisma client instance. Prevents connection pool exhaustion in dev |
| **Response helpers** | `lib/utils/api-response.ts` | `success(data, 201)` and `error("msg", "CODE", 400)` — consistent API shape |

---

## 4. Database Design (Most Important for Evaluation)

> [!IMPORTANT]
> The hackathon evaluates database design as the **#1 criteria**. This schema is designed for data integrity, performance, and real-world correctness.

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS — Typed status machines, not strings
// ============================================

enum UserRole {
  ADMIN
  STAFF
  CUSTOMER
}

enum BillingFrequency {
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
}

enum InvoiceStatus {
  DRAFT
  CONFIRMED
  PAID
  CANCELLED
}

enum PaymentMethod {
  UPI
  BANK_TRANSFER
  CASH
  CARD
  OTHER
}

// ============================================
// CORE TABLES
// ============================================

model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique
  passwordHash  String    @map("password_hash")
  role          UserRole  @default(CUSTOMER)
  fullName      String    @map("full_name")
  companyName   String?   @map("company_name")
  phone         String?
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  subscriptions    Subscription[]
  invoices         Invoice[]
  payments         Payment[]         @relation("CustomerPayments")
  paymentsRecorded Payment[]         @relation("RecordedByStaff")
  followUps        FollowUp[]
  auditLogs        AuditLog[]

  @@index([role])
  @@index([email])
  @@map("users")
}

model Plan {
  id               String            @id @default(uuid()) @db.Uuid
  name             String
  description      String?
  price            Decimal           @db.Decimal(12, 2)
  billingFrequency BillingFrequency  @map("billing_frequency")
  taxPercent       Decimal           @default(0) @map("tax_percent") @db.Decimal(5, 2)
  isActive         Boolean           @default(true) @map("is_active")
  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime          @updatedAt @map("updated_at")

  // Relations
  subscriptions    Subscription[]

  // Constraints enforced at DB level
  // price >= 0 via CHECK
  // taxPercent 0-100 via CHECK

  @@map("plans")
}

model Subscription {
  id                 String              @id @default(uuid()) @db.Uuid
  subscriptionNumber String              @unique @map("subscription_number")
  customerId         String              @map("customer_id") @db.Uuid
  planId             String              @map("plan_id") @db.Uuid
  startDate          DateTime            @map("start_date") @db.Date
  expiryDate         DateTime?           @map("expiry_date") @db.Date
  nextBillingDate    DateTime            @map("next_billing_date") @db.Date
  status             SubscriptionStatus  @default(ACTIVE)
  unitPrice          Decimal             @map("unit_price") @db.Decimal(12, 2)
  taxPercent         Decimal             @map("tax_percent") @db.Decimal(5, 2)
  totalPerPeriod     Decimal             @map("total_per_period") @db.Decimal(12, 2)
  planName           String              @map("plan_name")
  billingFrequency   BillingFrequency    @map("billing_frequency")
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")

  // Relations
  customer        User              @relation(fields: [customerId], references: [id])
  plan            Plan              @relation(fields: [planId], references: [id])
  invoices        Invoice[]
  billingRecords  BillingRecord[]

  // WHY snapshot planName, unitPrice, taxPercent, billingFrequency?
  // If admin changes plan price later, existing subscriptions keep their
  // agreed price. This is how real billing works — you honor the deal.

  @@index([customerId])
  @@index([status])
  @@index([nextBillingDate])
  @@map("subscriptions")
}

model Invoice {
  id                 String          @id @default(uuid()) @db.Uuid
  invoiceNumber      String          @unique @map("invoice_number")
  customerId         String          @map("customer_id") @db.Uuid
  subscriptionId     String?         @map("subscription_id") @db.Uuid
  billingPeriodStart DateTime?       @map("billing_period_start") @db.Date
  billingPeriodEnd   DateTime?       @map("billing_period_end") @db.Date
  invoiceDate        DateTime        @default(now()) @map("invoice_date") @db.Date
  dueDate            DateTime        @map("due_date") @db.Date
  description        String          @default("")
  quantity           Int             @default(1)
  unitPrice          Decimal         @map("unit_price") @db.Decimal(12, 2)
  subtotal           Decimal         @default(0) @db.Decimal(12, 2)
  taxPercent         Decimal         @default(0) @map("tax_percent") @db.Decimal(5, 2)
  taxAmount          Decimal         @default(0) @map("tax_amount") @db.Decimal(12, 2)
  totalAmount        Decimal         @default(0) @map("total_amount") @db.Decimal(12, 2)
  amountPaid         Decimal         @default(0) @map("amount_paid") @db.Decimal(12, 2)
  outstandingAmount  Decimal         @default(0) @map("outstanding_amount") @db.Decimal(12, 2)
  status             InvoiceStatus   @default(DRAFT)
  notes              String?
  createdAt          DateTime        @default(now()) @map("created_at")
  updatedAt          DateTime        @updatedAt @map("updated_at")

  // Relations
  customer       User            @relation(fields: [customerId], references: [id])
  subscription   Subscription?   @relation(fields: [subscriptionId], references: [id])
  payments       Payment[]
  billingRecord  BillingRecord?

  @@index([customerId])
  @@index([status])
  @@index([dueDate])
  @@index([subscriptionId])
  @@map("invoices")
}

model Payment {
  id               String         @id @default(uuid()) @db.Uuid
  paymentReference String         @unique @map("payment_reference")
  invoiceId        String         @map("invoice_id") @db.Uuid
  customerId       String         @map("customer_id") @db.Uuid
  paymentMethod    PaymentMethod  @map("payment_method")
  amount           Decimal        @db.Decimal(12, 2)
  paymentDate      DateTime       @default(now()) @map("payment_date") @db.Date
  transactionId    String?        @map("transaction_id")
  notes            String?
  createdById      String?        @map("created_by_id") @db.Uuid
  createdAt        DateTime       @default(now()) @map("created_at")

  // Relations
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  customer    User     @relation("CustomerPayments", fields: [customerId], references: [id])
  createdBy   User?    @relation("RecordedByStaff", fields: [createdById], references: [id])

  // amount > 0 via CHECK constraint

  @@index([invoiceId])
  @@index([customerId])
  @@map("payments")
}

// Idempotency engine — prevents duplicate billing
model BillingRecord {
  id                 String   @id @default(uuid()) @db.Uuid
  subscriptionId     String   @map("subscription_id") @db.Uuid
  invoiceId          String?  @unique @map("invoice_id") @db.Uuid
  billingPeriodStart DateTime @map("billing_period_start") @db.Date
  billingPeriodEnd   DateTime @map("billing_period_end") @db.Date
  status             String   // 'success' | 'failed' | 'skipped'
  errorMessage       String?  @map("error_message")
  processedAt        DateTime @default(now()) @map("processed_at")

  // Relations
  subscription  Subscription  @relation(fields: [subscriptionId], references: [id])
  invoice       Invoice?      @relation(fields: [invoiceId], references: [id])

  // THIS IS THE CORE SAFETY CONSTRAINT:
  // Same subscription + same billing period = only ONE record allowed
  // Double-clicking "Generate Invoices" will NOT create duplicates
  @@unique([subscriptionId, billingPeriodStart, billingPeriodEnd])
  @@map("billing_records")
}

// Staff follow-up tracking for Renewal Rescue Queue
model FollowUp {
  id          String   @id @default(uuid()) @db.Uuid
  entityType  String   @map("entity_type")   // 'subscription' | 'invoice'
  entityId    String   @map("entity_id") @db.Uuid
  note        String
  staffId     String   @map("staff_id") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  staff  User  @relation(fields: [staffId], references: [id])

  @@index([entityType, entityId])
  @@index([staffId])
  @@map("follow_ups")
}

model AuditLog {
  id           String   @id @default(uuid()) @db.Uuid
  entityName   String   @map("entity_name")
  entityId     String   @map("entity_id") @db.Uuid
  action       String
  performedBy  String?  @map("performed_by") @db.Uuid
  details      Json?
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  performer  User?  @relation(fields: [performedBy], references: [id])

  @@index([entityName, entityId])
  @@map("audit_logs")
}
```

### Database Design Decisions (What Evaluators Look For)

| Decision | Reasoning |
|---|---|
| **`Decimal(12,2)` for money** | `FLOAT`/`DOUBLE` causes rounding errors (₹99.99 might store as 99.98999...). `NUMERIC(12,2)` stores exact values. Financial apps MUST use exact decimals |
| **UUID primary keys** | Avoids sequential ID guessing attacks. Safe for distributed systems. No auto-increment conflicts |
| **Subscription snapshots plan data** | `unitPrice`, `taxPercent`, `planName`, `billingFrequency` are copied from Plan to Subscription at creation time. Why? If admin changes plan price from ₹4,999 to ₹5,999, existing customers keep their agreed ₹4,999 rate |
| **BillingRecord unique constraint** | `UNIQUE(subscriptionId, billingPeriodStart, billingPeriodEnd)` — the database itself prevents duplicate billing. Even if code has a bug, even if someone double-clicks, even if the server crashes mid-request and retries — ONE invoice per period, guaranteed |
| **Separate FollowUp table** | Staff contact notes (e.g., "Spoke to Ramesh, will pay Friday") are stored separately from audit logs. This allows targeted queries for the Rescue Queue without scanning all audit entries |
| **Timestamps on every table** | `createdAt` + `updatedAt` for audit trail. `@updatedAt` auto-updates via Prisma |
| **Soft deletes (isActive)** | Plans and users are never hard-deleted. Deactivated plans can't be used for new subscriptions but existing ones keep working |
| **Indexed columns** | Every column used in WHERE/JOIN/ORDER BY has an index: `status`, `nextBillingDate`, `customerId`, `dueDate`. Without these, queries scan full tables |

### Entity-Relationship Summary

```
User (1) ──────< (N) Subscription (N) >────── (1) Plan
                        │
                        │ 1:N
                        ▼
                    Invoice (1) ──────< (N) Payment
                        │
                        │ 1:1
                        ▼
                  BillingRecord
                  (idempotency)

User (1) ──────< (N) FollowUp
                  (rescue queue notes)
```

---

## 5. Authentication System (Custom — No Third-Party Auth)

### Why Custom Auth?

The hackathon values building from scratch. Custom auth demonstrates understanding of:
- Password hashing (bcrypt with cost factor 12)
- Token-based sessions (JWT in HTTP-only cookies)
- Middleware-based route protection
- Role-based access control

### Auth Flow

```
REGISTER:
  Client → POST /api/auth/register { email, password, fullName }
  Server → Validate with Zod → Hash password (bcrypt, 12 rounds)
         → Insert user (role=CUSTOMER) → Return success
         → (Admin creates staff accounts separately)

LOGIN:
  Client → POST /api/auth/login { email, password }
  Server → Find user by email → Compare password hash (bcrypt)
         → Generate JWT { userId, role, exp: 24h }
         → Set HTTP-only secure cookie → Return { user }

EVERY REQUEST:
  Middleware → Read cookie → Verify JWT (jose) → Check role vs route
            → Allow or redirect to /login

LOGOUT:
  Client → POST /api/auth/logout
  Server → Clear cookie → Return success
```

### Security Measures

| Measure | Implementation |
|---|---|
| **Password hashing** | bcrypt with cost factor 12 (≈250ms per hash — slow enough to resist brute force) |
| **JWT in HTTP-only cookie** | Token can't be read by JavaScript (XSS-safe). Not in localStorage |
| **Cookie flags** | `httpOnly`, `secure` (in production), `sameSite: lax`, `path: /` |
| **Password requirements** | Min 8 chars, 1 uppercase, 1 lowercase, 1 special character (per problem statement) |
| **Role verification** | Checked in middleware (redirect) AND in every API handler (authorization). Middleware alone is NOT a security boundary |
| **Data isolation** | Customer API queries always filter by `userId`. URL manipulation (`/api/invoices?customerId=other`) returns only their own data |

---

## 6. Unique Features (What Makes Zylo Different)

### Feature 1: 🚨 Renewal Rescue Queue

> **Gap it fills:** Every billing tool shows revenue charts. Nobody tells the staff member "here are the 3 customers you need to call before lunch or you lose ₹47,000."

**What it is:** An actionable, prioritized work queue — NOT a chart dashboard.

**How it works:**
- **🔴 Overdue Invoices** (top section): Confirmed invoices past due date with outstanding > 0
  - Shows: customer name, invoice #, ₹ outstanding, "overdue by X days", last contact note
  - Sorted: most overdue first
- **🟡 Upcoming Renewals** (bottom section): Active subscriptions billing within 7 days
  - Shows: customer name, subscription #, ₹ amount, "due in X days", last contact note
  - Sorted: soonest first
- **Contact tracking**: Staff clicks "Mark Contacted" → adds note ("Spoke to Ramesh, will pay Friday") with timestamp
  - Two staff members won't unknowingly chase the same customer
  - Notes are staff-only — customers never see them
- **Quick stats bar**: Active count, Revenue this month, Outstanding total, Overdue count (SQL aggregations, not client-side math)

### Feature 2: ⚡ One-Click Billing Day

> **Gap it fills:** Brightloop spends 4 hours on the 1st of every month typing 100+ invoices. Zylo does it in one click.

**How it works:**
1. Staff clicks "Generate Due Invoices"
2. System counts subscriptions where `nextBillingDate <= today` and `status = ACTIVE`
3. Staff sees preview: "23 subscriptions are due for billing"
4. Staff clicks "Confirm" → atomic `prisma.$transaction()` runs:
   - For each due subscription:
     - Check BillingRecord — if period already billed → skip (idempotent)
     - Create Invoice with snapshotted price/tax
     - Create BillingRecord (success)
     - Advance `nextBillingDate` by one frequency period
   - If ANY step fails → entire transaction rolls back (no partial invoices)
5. Result: "Generated: 23 | Already billed: 0 | Failed: 0"

**Idempotency guarantee:** Click the button 10 times → still exactly 1 invoice per subscription per period. The `UNIQUE` constraint on BillingRecord makes duplicates impossible at the database level.

### Feature 3: 💰 Smart Payment Tracking

> **Gap it fills:** Indian SMBs receive partial payments ("I'll UPI half now, bank transfer the rest next week"). Tools don't handle this well.

**How it works:**
- Record partial or full payment with method (UPI / Bank Transfer / Cash / Card)
- Outstanding balance updates atomically within a transaction
- Invoice auto-transitions to PAID only when outstanding hits ₹0
- Payment history visible on every invoice (date, method, amount, reference, who recorded it)
- Validation: can't pay ≤ 0, can't overpay, can't pay cancelled/draft invoices

### Feature 4: 👤 Customer Self-Service Portal

> **Gap it fills:** 5-10 daily emails asking "what's my billing date?" or "send my invoice again." Portal reduces this to zero.

**How it works:**
- Customer logs in → sees ONLY their data (enforced in API queries with `WHERE customerId = currentUser.id`)
- Shows: active subscriptions, next billing date, all invoices with status/balance
- Read-only — no modification allowed
- Even manually changing URLs or API calls can't access other customers' data

---

## 7. Build Order — 7 Slices in 6h 40m

> **RULE: After every slice, STOP and ask the user to verify. Only push verified work to GitHub. Never silently continue.**

---

### Slice A: Project Setup + Auth + App Shell (0:00 – 0:50) ⏱️ 50 min

**What we build:**  
Remove Supabase. Set up PostgreSQL + Prisma + custom JWT auth. Create the protected app shell.

**Build steps:**
1. Remove Supabase packages and config files (`lib/supabase/`, `@supabase/*` from package.json)
2. Install new packages: `@prisma/client`, `prisma`, `bcryptjs`, `jose`, `@types/bcryptjs`
3. Initialize Prisma: `npx prisma init` → configure `schema.prisma` with full data model
4. Create `lib/db.ts` — Prisma client singleton
5. Create `lib/auth/password.ts` — `hashPassword()` and `verifyPassword()` using bcrypt
6. Create `lib/auth/jwt.ts` — `signToken()` and `verifyToken()` using jose
7. Create `lib/auth/session.ts` — `getUserFromRequest()` reads cookie → verifies JWT → returns user
8. Create API routes:
   - `POST /api/auth/register` — validate, hash password, create user
   - `POST /api/auth/login` — verify password, sign JWT, set HTTP-only cookie
   - `POST /api/auth/logout` — clear cookie
   - `GET /api/auth/me` — return current user from token
9. Update `middleware.ts` — verify JWT, check role vs route pattern, redirect unauthorized
10. Create auth pages: `/login`, `/register` with client-side forms
11. Create layouts: admin sidebar, staff sidebar, portal sidebar — role-appropriate navigation
12. Create shared UI components: `page-header`, `empty-state`, `loading-skeleton`, `error-display`, `status-badge`

**Acceptance checks:**
- [ ] `npx prisma migrate dev` creates all tables successfully
- [ ] Register creates a user with hashed password (not plaintext)
- [ ] Login returns HTTP-only cookie with JWT
- [ ] `/admin` redirects customer/staff to their correct dashboard
- [ ] `/portal` redirects admin/staff appropriately
- [ ] Logout clears cookie and redirects to login
- [ ] Invalid password format is rejected with clear error

**✅ STOP — Ask user to verify → Push to GitHub if approved**

---

### Slice B: Plan Management (0:50 – 1:40) ⏱️ 50 min

**What we build:**  
Admin can create, view, and deactivate subscription plans.

**Build steps:**
1. Create Zod schema `lib/validations/plans.ts`:
   - name: string, 3-100 chars
   - price: number, > 0
   - billingFrequency: 'MONTHLY' | 'YEARLY'
   - taxPercent: number, 0-28 (GST range)
   - description: optional string
2. Create API routes:
   - `GET /api/plans` — list active plans, paginated (staff/admin/customer can read)
   - `POST /api/plans` — admin-only, validated create
   - `PATCH /api/plans/[id]` — admin-only, deactivate (set `isActive = false`)
3. Create admin pages:
   - `/admin/plans` — card grid of plans showing name, ₹ price/frequency, tax %, status
   - `/admin/plans/new` — form with validation errors shown inline
4. Currency formatting: `lib/utils/format.ts` — `formatINR(4999)` → `"₹4,999.00"`

**Acceptance checks:**
- [ ] Admin creates plan "Basic Monthly" at ₹4,999/month with 18% tax
- [ ] Invalid data rejected: empty name → error, negative price → error, tax > 28 → error
- [ ] Plan list shows with correct ₹ formatting
- [ ] Staff can VIEW plans but cannot create/deactivate (403 error)
- [ ] Deactivated plan shows as inactive, can't be used for new subscriptions

**✅ STOP → Verify → Push**

---

### Slice C: Subscription Creation & Viewing (1:40 – 2:40) ⏱️ 60 min

**What we build:**  
Staff creates subscriptions for customers. Customer portal shows their own.

**Build steps:**
1. Create Zod schema `lib/validations/subscriptions.ts`
2. Create API routes:
   - `GET /api/customers` — staff/admin see all customers, paginated + searchable
   - `POST /api/subscriptions` — staff/admin create subscription:
     - Auto-generate number (SUB-0001, SUB-0002...)
     - Snapshot plan data (price, tax, name, frequency) into subscription
     - Calculate `totalPerPeriod` = price + (price × taxPercent / 100)
     - Set `nextBillingDate` = startDate + one frequency period
   - `GET /api/subscriptions` — staff/admin see all, customer sees own only
   - `GET /api/subscriptions/[id]` — detail view
3. Create staff pages:
   - `/staff/subscriptions` — searchable, paginated table
   - `/staff/subscriptions/new` — form: select customer (searchable dropdown), select plan, see price preview, pick start date, confirm
   - `/staff/subscriptions/[id]` — detail: customer info, plan info, dates, status, billing history
4. Create portal page:
   - `/portal/subscriptions` — customer sees their subscriptions (read-only)

**Acceptance checks:**
- [ ] Staff creates subscription for customer → SUB-0001 generated
- [ ] Price snapshotted: change plan price → existing subscription unaffected
- [ ] `totalPerPeriod` calculated correctly: ₹4,999 + 18% = ₹5,898.82
- [ ] Customer sees ONLY their subscriptions in portal
- [ ] Trying to access another customer's subscription → empty/not found

**✅ STOP → Verify → Push**

---

### Slice D: One-Click Invoice Generation (2:40 – 4:10) ⏱️ 90 min

> **This is the hardest and most important slice — the core value of Zylo.**

**Build steps:**
1. Create `lib/utils/billing.ts`:
   - `calculateNextBillingDate(currentDate, frequency)` — handles month-end, leap year
   - `computeBillingPeriod(billingDate, frequency)` — returns { start, end }
2. Create API route `POST /api/billing/run` (staff/admin only):
   ```
   Within prisma.$transaction():
     1. Find all active, non-paused subscriptions where nextBillingDate <= today
     2. For each subscription:
        a. Compute billing period (start, end)
        b. Check if BillingRecord exists for this subscription + period → skip if yes
        c. Generate invoice number (INV-0001)
        d. Create Invoice with snapshotted amounts from subscription
        e. Create BillingRecord with status='success'
        f. Update subscription.nextBillingDate += one period
     3. Return: { generated, alreadyBilled, failed, details[] }
   ```
3. Create API routes for invoices:
   - `GET /api/invoices` — paginated, filterable by status, searchable
   - `GET /api/invoices/[id]` — detail with payment history
   - `PATCH /api/invoices/[id]` — confirm (draft→confirmed), cancel (draft→cancelled)
4. Create staff pages:
   - `/staff/billing` — billing run page: preview count → confirm → results
   - `/staff/invoices` — invoice list with status filter tabs (All/Draft/Confirmed/Paid)
   - `/staff/invoices/[id]` — detail: header, line items, totals, status actions, payment history

**Acceptance checks:**
- [ ] Generate invoices for 3 due subscriptions → 3 invoices created
- [ ] Click generate AGAIN → "Already billed: 3, Generated: 0" (idempotent!)
- [ ] Invoice amounts correct: ₹4,999 base + ₹899.82 tax = ₹5,898.82 total
- [ ] `nextBillingDate` advanced by one period after billing
- [ ] If transaction fails midway → NO partial invoices (rollback works)
- [ ] Confirm invoice: draft → confirmed. Cancel: draft → cancelled
- [ ] Can't confirm/cancel an already-paid invoice

**✅ STOP → Verify → Push**

---

### Slice E: Payment Recording (4:10 – 5:05) ⏱️ 55 min

**Build steps:**
1. Create Zod schema `lib/validations/payments.ts`:
   - invoiceId: uuid
   - amount: positive number, max 2 decimal places
   - paymentMethod: UPI | BANK_TRANSFER | CASH | CARD | OTHER
   - paymentDate: date string
   - transactionId: optional string (e.g., UPI ref)
   - notes: optional string
2. Create API route `POST /api/payments` (staff/admin):
   ```
   Within prisma.$transaction():
     1. Find invoice → must be CONFIRMED status
     2. Validate amount <= outstandingAmount
     3. Generate payment reference (PAY-0001)
     4. Create Payment record
     5. Update invoice: amountPaid += amount, outstandingAmount -= amount
     6. If outstandingAmount = 0 → status = PAID
   ```
3. Create API route `GET /api/payments?invoiceId=xxx`
4. Add payment form to `/staff/invoices/[id]`:
   - Payment method dropdown
   - Amount (pre-filled with outstanding, editable)
   - Date, reference, notes
5. Add payment history table below invoice details

**Acceptance checks:**
- [ ] Partial payment: ₹5,898.82 invoice, pay ₹3,000 → outstanding = ₹2,898.82
- [ ] Second payment of ₹2,898.82 → outstanding = ₹0, status → PAID
- [ ] Can't pay ₹6,000 on ₹5,898.82 invoice (validation error)
- [ ] Can't pay on draft or cancelled invoice (validation error)
- [ ] Payment history shows: date, method (UPI), ₹ amount, reference, staff name

**✅ STOP → Verify → Push**

---

### Slice F: Renewal Rescue Queue + Customer Portal (5:05 – 6:05) ⏱️ 60 min

**Build steps:**
1. Create API route `GET /api/dashboard/rescue-queue` (staff/admin):
   ```sql
   -- Overdue invoices
   SELECT i.*, u.full_name, u.email,
     CURRENT_DATE - i.due_date AS days_overdue,
     (SELECT note FROM follow_ups
      WHERE entity_type='invoice' AND entity_id=i.id
      ORDER BY created_at DESC LIMIT 1) AS last_note
   FROM invoices i
   JOIN users u ON i.customer_id = u.id
   WHERE i.status = 'CONFIRMED' AND i.outstanding_amount > 0
     AND i.due_date < CURRENT_DATE
   ORDER BY i.due_date ASC;

   -- Upcoming renewals
   SELECT s.*, u.full_name, u.email,
     s.next_billing_date - CURRENT_DATE AS days_until,
     (SELECT note FROM follow_ups
      WHERE entity_type='subscription' AND entity_id=s.id
      ORDER BY created_at DESC LIMIT 1) AS last_note
   FROM subscriptions s
   JOIN users u ON s.customer_id = u.id
   WHERE s.status = 'ACTIVE'
     AND s.next_billing_date <= CURRENT_DATE + INTERVAL '7 days'
   ORDER BY s.next_billing_date ASC;
   ```
2. Create API route `GET /api/dashboard/stats` (staff/admin):
   - Active subscription count
   - Revenue this month (SUM of paid invoice totals where invoice_date in current month)
   - Total outstanding (SUM of outstanding_amount on confirmed invoices)
   - Overdue invoice count
3. Create API route `POST /api/follow-ups` (staff/admin):
   - entityType, entityId, note → create FollowUp record
4. Create staff dashboard `/staff/page.tsx`:
   - Stats bar at top (4 numbers)
   - Overdue invoices section (red-tinted rows, "overdue by X days")
   - Upcoming renewals section (amber-tinted rows, "due in X days")
   - Each row: customer, amount, reason, last note, "Mark Contacted" button
5. Create customer portal pages:
   - `/portal/invoices` — their invoices with status, amount, outstanding
   - `/portal/invoices/[id]` — read-only invoice detail
   - `/portal/page.tsx` — dashboard: active sub count, next billing date, any overdue

**Acceptance checks:**
- [ ] Overdue invoice shows with "overdue by X days" in red
- [ ] Upcoming renewal shows with "due in X days" in amber
- [ ] "Mark Contacted" saves note, shows on queue row
- [ ] Stats numbers match actual data
- [ ] Customer portal shows ONLY their invoices
- [ ] Customer can't see follow-up notes (staff-only)
- [ ] Dashboard loads in under 2 seconds

**✅ STOP → Verify → Push**

---

### Slice G: End-to-End Walkthrough & Polish (6:05 – 6:40) ⏱️ 35 min

**Build steps:**
1. Create seed data (`prisma/seed.ts`):
   - 1 admin, 1 staff, 3 customers
   - 2 plans (Basic Monthly ₹4,999, Pro Yearly ₹49,999)
   - 5 subscriptions across customers
   - Some invoices (mix of draft, confirmed, paid, overdue)
   - Some payments
2. Test full journey:
   - Register → Login as admin → Create plan
   - Login as staff → Create subscription → Run billing → Record payment
   - Check Rescue Queue → Mark contacted
   - Login as customer → View portal
3. Polish:
   - Mobile responsive (test at 375px width)
   - Empty states ("No plans yet. Create your first plan →")
   - Loading states (skeleton on every data page)
   - Error states (human-readable, not stack traces)
   - Consistent color scheme: blue primary, red for overdue, green for paid, amber for upcoming
4. Update README with complete setup instructions
5. Document known limitations

**✅ STOP → Final verification → Push**

---

## 8. Evaluation Criteria Alignment

The hackathon evaluates these criteria. Here's how Zylo scores:

| Criteria | How Zylo Addresses It |
|---|---|
| **Database Design** (most important) | Prisma schema with proper types, constraints, indexes, relations. `Decimal` for money. Unique constraint for billing idempotency. Snapshotted prices. Explained WHY for every decision |
| **Coding Standards** | TypeScript strict mode. Zod validation on every input. Consistent API response shape. Named functions, not anonymous |
| **Logic** | Atomic billing transaction. Idempotency via DB constraint. Server-side money calculations. Partial payment state machine |
| **Modularity** | Clear separation: `lib/auth/`, `lib/validations/`, `lib/utils/`, `components/ui/`, `app/api/`. Each file has one responsibility |
| **Frontend Design** | Tailwind for clean, consistent UI. Mobile-responsive. Color-coded status badges. Intuitive navigation |
| **Performance** | Indexed queries. Server-side pagination. SQL aggregations for stats. No "load everything" patterns |
| **Scalability** | Pagination everywhere. Stateless JWT auth. Database constraints as safety nets. Clean separation allows future module additions |
| **Security** | bcrypt password hashing. JWT in HTTP-only cookies. Role checks in middleware AND API handlers. Input validation. Data isolation per customer |
| **Usability** | Rescue Queue tells staff WHAT to do. One-click billing. Self-service portal. Clear error messages. Works on mobile |
| **Debugging** | Consistent error responses with codes. Audit logs. Billing records track success/failure. Structured logging |
| **No third-party BaaS** | ✅ Local PostgreSQL. Custom auth. No Firebase/Supabase/MongoDB Atlas |
| **Git usage** | Push after each verified slice. Meaningful commit messages. Feature branches if team > 1 |
| **Input validation** | Zod schemas with custom error messages. Password strength check. Amount bounds. Role verification |

---

## 9. How to Run Locally

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (local install or Docker)
- **Git**

### Option A: PostgreSQL via Docker (Recommended)

```bash
# Start PostgreSQL in Docker
docker run --name zylo-db \
  -e POSTGRES_USER=zylo \
  -e POSTGRES_PASSWORD=zylo123 \
  -e POSTGRES_DB=zylo \
  -p 5432:5432 \
  -d postgres:16
```

### Option B: Local PostgreSQL

```bash
# Create database
psql -U postgres -c "CREATE DATABASE zylo;"
```

### Setup Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd Zylo

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```dotenv
DATABASE_URL="postgresql://zylo:zylo123@localhost:5432/zylo"
JWT_SECRET="your-secret-key-minimum-32-characters-long-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
# 4. Run database migrations (creates all tables)
npx prisma migrate dev --name init

# 5. Seed demo data (optional, development only)
npx prisma db seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Create First Admin

```bash
# After registering via the app, promote your account:
npx prisma studio
# → Open 'users' table → change your role to 'ADMIN' → Save
```

Or via psql:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Production Build

```bash
npm run build
npm run start
```

---

## 10. Error Handling Strategy

| Layer | Strategy | Example |
|---|---|---|
| **Client form** | Inline errors below each field, disabled submit while loading, toast on success/failure | `"Price must be greater than 0"` |
| **API validation** | Zod `.parse()` in try-catch → return `{ error, code: "VALIDATION_ERROR" }` with 400 | `{ error: "Invalid email format", code: "VALIDATION_ERROR" }` |
| **Auth errors** | 401 for missing/expired token, 403 for wrong role | `{ error: "Admin access required", code: "FORBIDDEN" }` |
| **Not found** | 404 with clear message | `{ error: "Invoice INV-0042 not found", code: "NOT_FOUND" }` |
| **Conflicts** | 409 for duplicate billing, duplicate email | `{ error: "Already billed for this period", code: "DUPLICATE" }` |
| **Server errors** | 500 with generic message (detailed error logged server-side only) | `{ error: "Something went wrong. Please try again.", code: "INTERNAL_ERROR" }` |
| **Billing transaction** | Full rollback on failure. Return per-subscription results | `{ generated: 5, alreadyBilled: 2, failed: 1, errors: ["SUB-0008: ..."] }` |

### Consistent API Response Shape

```typescript
// Every API endpoint returns ONE of these:

// Success:
{ data: { ... }, message?: "Invoice created successfully" }

// Error:
{ error: "Human-readable message", code: "ERROR_CODE" }
```

---

## 11. What's Done vs What's Next

### ✅ Exists in Codebase (Needs Migration from Supabase)
- Basic project structure (Next.js, TypeScript, Tailwind)
- Page routes for auth, admin, staff, portal
- Utility functions (billing dates, invoice calculator, permissions)
- TypeScript type definitions

### 🔨 Building Now (This Plan — 6h 40m)
- **Slice A:** PostgreSQL + Prisma + Custom JWT Auth + App Shell
- **Slice B:** Plan management (admin)
- **Slice C:** Subscription creation and viewing
- **Slice D:** One-click invoice generation (atomic, idempotent)
- **Slice E:** Payment recording with balance tracking
- **Slice F:** Renewal Rescue Queue + Customer portal
- **Slice G:** End-to-end walkthrough + polish

### 🔮 Future Roadmap (After Hackathon)
1. Quote-to-subscription flow with templates
2. Product catalog with variants and bundles
3. Discount engine (fixed/percentage with rules)
4. WhatsApp/SMS renewal reminders
5. PDF invoice generation
6. GST compliance (CGST/SGST/IGST by state)
7. Revenue analytics and MRR charts
8. Background scheduled billing
9. Payment gateway integration (Razorpay/UPI)
10. Multi-tenant architecture

---

## 12. Completion Definition

The build is successful when:

1. ✅ **From scratch:** PostgreSQL + Prisma, custom JWT auth — no BaaS dependency
2. ✅ **Plan setup:** Admin creates a ₹4,999/month plan with 18% tax
3. ✅ **Subscription:** Staff creates subscription for customer, price snapshotted
4. ✅ **Billing:** One click generates all due invoices, idempotently, atomically
5. ✅ **Payments:** Partial/full payments tracked, balances update correctly
6. ✅ **Rescue Queue:** Staff sees overdue/upcoming items with actionable context
7. ✅ **Portal:** Customer sees only their data — no leaks possible
8. ✅ **Security:** Role enforcement in middleware AND API. bcrypt + JWT. Input validation
9. ✅ **Clean UI:** Consistent colors, mobile-responsive, clear errors, good spacing
10. ✅ **Database design:** Proper types, constraints, indexes, relations, explained decisions

**This is not a huge, complex software. It's a simple tool that replaces 5 spreadsheets with 1 login — built from scratch with solid engineering.**
