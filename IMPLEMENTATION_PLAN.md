# Brightloop Subscription Management System (SMS)
## Modular Implementation & Development Plan

**Project:** Brightloop SMS  
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + Auth + Storage)  
**Architecture:** Modular Monolith with Row Level Security (RLS)  
**Target Performance:** Sub-2-second page loads across thousands of subscriptions  

---

## 1. Project Overview & Objectives

Brightloop Software sells software products and services using a subscription-based model with daily, weekly, monthly, and yearly billing plans. This platform centralizes:
1. Customer registration and account management.
2. Product catalog and product variant pricing.
3. Subscription plans and plan lifecycle rules.
4. Reusable quotation templates and quotation-to-subscription workflows.
5. Subscription lifecycle management (Draft, Quotation, Confirmed, Active, Closed, Paused).
6. Automated recurring billing with duplicate billing prevention (idempotent scheduler).
7. Historical-accurate invoice generation with snapshot pricing.
8. Configurable tax and discount engines.
9. Payment recording and overdue invoice tracking.
10. Role-based financial dashboards and reporting.

---

## 2. Role-Based Access Control

The platform provides three isolated portal interfaces connected to the same backend:

| Role | Access Scope | Portal Route | Key Responsibilities |
|---|---|---|---|
| **Admin** | Full Platform | `/admin` | Staff management, products & variants, subscription plans, taxes, discounts, financial summaries, audit logs. |
| **Staff** | Operational | `/staff` | Customer directory, quotation creation/conversion, subscription management, invoice tracking, payment recording. |
| **Customer** | Self-Service | `/portal` | View own active subscriptions, next billing dates, invoice history, payment records, download PDFs. |

---

## 3. Locked Architectural & Business Decisions

All core design ambiguities have been resolved:

1. **Subscription State Machine**:  
   `Draft → Quotation → Confirmed → Active → Closed`  
   - `Draft → Confirmed` (Direct subscription without quotation is permitted).  
   - `Paused` is handled via an `is_paused` boolean flag while in `Active` status (the scheduler skips paused subscriptions).
2. **Quotation Conversion**: One quotation can be converted into at most one subscription. Expired quotations cannot be converted without re-validation.
3. **Renewal Behavior**: Staff chooses either **Extend existing** (updates `expiry_date` & `next_billing_date`) or **Renew as new** (creates cloned subscription with linked parent ID).
4. **Financial Calculation Formula (Discount applied BEFORE tax)**:
   ```text
   Line Total      = Quantity × Unit Price
   Subtotal        = Σ Line Totals
   Discount Amount = Fixed Discount OR (Subtotal × Discount%)
   Taxable Amount  = Subtotal − Discount Amount
   Tax Amount      = Taxable Amount × Tax Rate / 100
   Invoice Total   = Taxable Amount + Tax Amount
   Outstanding     = Invoice Total − Amount Paid
   ```
5. **Invoice Snapshot Pricing**: Product price changes NEVER mutate previously issued invoices. Invoice items store snapshot unit prices, discounts, and applied tax rates.
6. **Billing Idempotency**: Protected at the database constraint level:
   `UNIQUE (subscription_id, billing_period_start, billing_period_end)` on `billing_records`.
7. **Number Sequences**:
   - Subscriptions: `SUB-YYYYMM-NNNN` (e.g. `SUB-202610-0001`)
   - Invoices: `INV-YYYYMM-NNNN` (e.g. `INV-202610-0001`)
   - Quotations: `QUO-YYYYMM-NNNN` (e.g. `QUO-202610-0001`)
8. **Overdue Invoices**: Dynamically identified when `due_date < CURRENT_DATE` and `outstanding_amount > 0`.
9. **Password Security**: Requires >8 characters, at least 1 uppercase, 1 lowercase, and 1 special character.

---

## 4. Phase Overview & Progress Tracker

```text
[Phase 0] Foundation                ✅ COMPLETE
   │
   ├─► [Phase 1] Auth & Users        ✅ COMPLETE
   │
   ├─► [Phase 2] Products & Variants ⏳ NEXT IN LINE (Dev B)
   ├─► [Phase 3] Plans & Taxes       📋 Queued (Dev C)
   └─► [Phase 4] Discount Engine     📋 Queued (Dev D)
         │
         ├─► [Phase 5] Quotations    📋 Queued (Dev A)
         └─► [Phase 6] Subscriptions 📋 Queued (Dev B)
               │
               └─► [Phase 7] Billing Engine 📋 Critical (Dev C)
                     │
                     ├─► [Phase 8] Invoices  📋 Queued (Dev D)
                     └─► [Phase 9] Payments  📋 Queued (Dev A)
                           │
                           ├─► [Phase 10] Customer Portal 📋 Queued (Dev B)
                           └─► [Phase 11] Dashboards      📋 Queued (Dev C)
                                 │
                                 └─► [Phase 12] Final Testing 📋 Queued (All)
```

| Phase | Module | Owner | Status | Dependencies | Core Deliverables |
|---|---|---|---|---|---|
| **Phase 0** | **Foundation** | Shared | ✅ Complete | None | Next.js 15, all 20 DB schemas, Supabase clients, calculation engines, layout shells. |
| **Phase 1** | **Auth & User Management** | Dev A | ✅ Complete | Phase 0 | Supabase auth, customer registration, admin staff management, profile APIs. |
| **Phase 2** | **Products & Variants** | Dev B | ⏳ Current | Phase 0, 1 | Product catalog, variant pricing, deactivation safety checks. |
| **Phase 3** | **Plans & Tax Rules** | Dev C | 📋 Queued | Phase 0, 1 | 4 billing frequencies, lifecycle rule configurations, tax rules. |
| **Phase 4** | **Discount Engine** | Dev D | 📋 Queued | Phase 0, 1, 2 | Fixed & percentage discounts, usage tracking, eligibility checks. |
| **Phase 5** | **Quotation System** | Dev A | 📋 Queued | Phase 1, 2, 3 | Quotation templates, quotation creation, conversion to subscription. |
| **Phase 6** | **Subscriptions** | Dev B | 📋 Queued | Phase 2, 3, 5 | Lifecycle machine, pause/resume, extend vs. new renewals. |
| **Phase 7** | **Billing Engine** | Dev C | 📋 Queued | Phase 3, 4, 6 | Idempotent billing runner, duplicate prevention, next billing calculation. |
| **Phase 8** | **Invoices** | Dev D | 📋 Queued | Phase 7 | Invoice status lifecycle, overdue detection, PDF downloads. |
| **Phase 9** | **Payments** | Dev A | 📋 Queued | Phase 8 | Payment recording, balance reconciliation, audit logging. |
| **Phase 10** | **Customer Portal** | Dev B | 📋 Queued | Phase 6, 8, 9 | Customer self-service dashboard, subscriptions, invoice downloads. |
| **Phase 11** | **Dashboards & Reports** | Dev C | 📋 Queued | Phase 6, 8, 9 | SQL aggregated KPIs, revenue charts, outstanding & overdue tables. |
| **Phase 12** | **Testing & Polish** | All | 📋 Queued | All | 19-step end-to-end acceptance test, sub-2s performance verification. |

---

## 5. Conflict Prevention Rules for Multi-Developer Teams

To enable multiple engineers to work simultaneously without code conflicts:

1. **Folder Boundary Isolation**: Each developer only edits code inside their assigned module directory (`app/api/[module]`, `app/[role]/[module]`).
2. **Single Source of Truth for Types**: All shared interfaces and types reside in `lib/types/index.ts`. Never define redundant local interfaces for database entities.
3. **Database Schema Is Frozen**: All 20 tables, custom enums, and foreign keys are created in `supabase/migrations/0001_initial_schema.sql`. No developer may alter table schemas without team alignment.
4. **Shared Calculation Engines**: Never re-implement financial formulas inside UI components. Always import from:
   - `lib/utils/invoice-calculator.ts`
   - `lib/utils/billing-dates.ts`
   - `lib/utils/number-generator.ts`
   - `lib/utils/permissions.ts`
5. **Shared Validations**: All form and API request validations must use Zod schemas in `lib/validations/`.
6. **No Mock Data in Production Routes**: All dashboard figures, subscription records, and invoice lists must query live Supabase PostgreSQL tables.

---

## 6. Detailed Phase Specifications

### Phase 0 — Foundation ✅ (Complete)
- [x] Initialized Next.js 15 App Router with TypeScript and Tailwind CSS.
- [x] Written `supabase/migrations/0001_initial_schema.sql` (all 20 entities, enums, sequences, RLS policies, performance indexes).
- [x] Written `supabase/seed.sql` with sample products, variants, plans, taxes, and discounts.
- [x] Built Supabase browser client (`lib/supabase/client.ts`), server client (`lib/supabase/server.ts`), and admin client (`lib/supabase/admin.ts`).
- [x] Implemented route guard middleware (`middleware.ts`).
- [x] Built layout shells for `/admin`, `/staff`, and `/portal`.

### Phase 1 — Auth & User Management ✅ (Complete)
- [x] Implemented password complexity schema in `lib/validations/auth.ts` (>8 chars, uppercase, lowercase, special char).
- [x] Created `POST /api/auth/register` (customer self-registration, assigns `role: 'customer'`).
- [x] Created `POST /api/auth/login` (checks `is_active` status and redirects by role).
- [x] Created `POST /api/auth/logout`.
- [x] Created password recovery endpoints (`/api/auth/forgot-password` and `/api/auth/reset-password`).
- [x] Created customer profile endpoints (`GET /api/users/me` and `PUT /api/users/me`).
- [x] Created staff management endpoints (`GET /api/users/staff`, `POST /api/users/staff`, `PUT /api/users/staff/[id]`, `PATCH /api/users/staff/[id]/toggle`).
- [x] Created customer directory endpoints (`GET /api/users/customers` with live search and pagination).
- [x] Built all corresponding UI pages (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/admin/staff`, `/admin/staff/new`, `/admin/staff/[id]/edit`, `/staff/customers`, `/portal/profile`).

### Phase 2 — Products & Product Variants ⏳ (Next)
- [ ] Define `lib/validations/product.ts` (Zod schemas for product and variant CRUD).
- [ ] Implement `GET /api/products` (paginated, search by name/notes, filter by active status).
- [ ] Implement `POST /api/products` (Admin only).
- [ ] Implement `GET /api/products/[id]` (product detail + list of variants + calculated final prices).
- [ ] Implement `PUT /api/products/[id]` (Admin only).
- [ ] Implement `PATCH /api/products/[id]/toggle` (deactivate product; prevent deletion if used in subscriptions).
- [ ] Implement `POST /api/products/[id]/variants` (create variant: `Final Price = Base Price + Additional Price`).
- [ ] Implement `PUT /api/products/[id]/variants/[variantId]` (edit variant).
- [ ] Build UI pages:
  - `app/admin/products/page.tsx` (product catalog table with status badges and search).
  - `app/admin/products/new/page.tsx` (add product form).
  - `app/admin/products/[id]/page.tsx` (product details and inline variant manager).
  - `app/admin/products/[id]/edit/page.tsx` (edit product form).

### Phase 3 — Subscription Plans & Tax Rules
- [ ] Define `lib/validations/plan.ts` and `lib/validations/tax.ts`.
- [ ] Implement Subscription Plan CRUD supporting `daily`, `weekly`, `monthly`, and `yearly` frequencies.
- [ ] Configure plan lifecycle flags: `auto_close`, `allow_early_closure`, `allow_pause`, `allow_renewal`.
- [ ] Implement Tax Rule CRUD with configurable percentage rates.
- [ ] Build UI pages for `/admin/plans` and `/admin/taxes`.

### Phase 4 — Discount Engine
- [ ] Define `lib/validations/discount.ts`.
- [ ] Implement Discount Rule CRUD (Admin only): fixed amount vs. percentage, minimum purchase, min quantity, validity dates, usage limits.
- [ ] Implement `findApplicableDiscount()` utility matching active discounts against subscription and product lines.
- [ ] Build UI pages for `/admin/discounts`.

### Phase 5 — Quotation System
- [ ] Define `lib/validations/quotation.ts`.
- [ ] Implement Quotation Templates CRUD.
- [ ] Implement Quotation creation (select customer, load template, adjust product lines and taxes, calculate totals).
- [ ] Implement Quotation status actions: `Send`, `Accept`, `Reject`, `Convert to Subscription`.
- [ ] Build UI pages for `/staff/quotations` and `/admin/quotations/templates`.

### Phase 6 — Subscription Management
- [ ] Define `lib/validations/subscription.ts`.
- [ ] Implement Subscription creation (direct or converted from accepted quotation).
- [ ] Enforce status transitions: `Draft → Confirmed → Active → Closed`.
- [ ] Implement pause and resume operations (respecting plan permissions).
- [ ] Implement renewal operations (owner chooses: extend existing or create cloned new subscription).
- [ ] Build UI pages for `/staff/subscriptions`.

### Phase 7 — Billing Engine (The Core Scheduler)
- [ ] Implement `POST /api/billing/run` protected by `BILLING_SECRET_KEY`.
- [ ] Eligibility query: finds active, unpaused subscriptions where `next_billing_date <= CURRENT_DATE`.
- [ ] Idempotency transaction: checks `billing_records` uniqueness before creating invoice.
- [ ] Snapshot generation: captures exact product line prices, discounts, and tax rates into `invoice_items`.
- [ ] Updates subscription `next_billing_date` based on frequency using `calculateNextBillingDate()`.
- [ ] Records success or failure in `billing_records` and `audit_logs`.

### Phase 8 — Invoice Management
- [ ] Implement `GET /api/invoices` and `GET /api/invoices/[id]`.
- [ ] Implement actions: `Confirm`, `Cancel`, `Mark as Sent`.
- [ ] Implement overdue invoice identification query (`due_date < CURRENT_DATE AND outstanding > 0`).
- [ ] Implement PDF generation download endpoint.
- [ ] Build UI pages for `/staff/invoices` and `/admin/invoices`.

### Phase 9 — Payment Management
- [ ] Implement `POST /api/payments` (record payment: method, date, amount, notes).
- [ ] Automatic invoice reconciliation: updates `amount_paid`, recalculates `outstanding_amount`, auto-updates invoice status to `Paid` when balance is zero.
- [ ] Build UI pages for payment recording modal and payment history logs.

### Phase 10 — Customer Portal
- [ ] Self-service views for customer's own active subscriptions.
- [ ] Customer invoice table with payment status badges and PDF download buttons.
- [ ] Customer profile and password management.

### Phase 11 — Dashboards & Financial Reports
- [ ] Implement SQL aggregation endpoint `/api/reports/dashboard` (no JS-side loops).
- [ ] Metrics: Total Active Subscriptions, Actual Revenue Received, Total Outstanding, Overdue Invoice Count.
- [ ] Revenue by date range and payment method breakdowns.
- [ ] Build Admin and Staff dashboard visualizations using Recharts.

### Phase 12 — End-to-End Acceptance Testing
- [ ] Execute 19-step verification workflow from the specification.
- [ ] Verify billing idempotency by executing scheduler back-to-back.
- [ ] Verify data isolation (customers cannot access foreign records via ID tampering).
- [ ] Verify sub-2-second page response with 1,000+ seeded records.

---

## 7. Database Entity Schema Summary (20 Entities)

All tables exist in `supabase/migrations/0001_initial_schema.sql`:

1. `profiles` — Linked to Supabase `auth.users`, holds role, name, phone, company.
2. `products` — Software and service catalog.
3. `product_variants` — Product variants with `additional_price`.
4. `subscription_plans` — Pricing, frequency, and lifecycle flags.
5. `plan_products` — Default product bundle for plans.
6. `tax_rules` — Configurable percentage tax rates.
7. `discount_rules` — Discount limits, scopes, and types.
8. `discount_applicable_products` — Product-specific discount associations.
9. `quotation_templates` — Reusable quotation starter templates.
10. `quotation_template_items` — Template product lines.
11. `quotations` — Price offers with validity dates and statuses.
12. `quotation_items` — Quotation line items.
13. `subscriptions` — Running customer subscription agreements.
14. `subscription_items` — Subscription product lines.
15. `discount_usage` — Historical discount application log.
16. `invoices` — Billing statements with snapshot pricing.
17. `invoice_items` — Immutable line items capturing historical prices.
18. `payments` — Recorded customer payments against invoices.
19. `billing_records` — Scheduler audit log enforcing billing period uniqueness.
20. `audit_logs` — System-wide action audit trail.

---

## 8. Development Commands

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript & linting check
npm run lint

# Build production bundle
npm run build
```

