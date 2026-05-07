# AGENTS.md — CompanyOS

> This file is the single source of truth for any AI agent (Cursor, Copilot, Claude, etc.) working on this codebase.
> Read this entire file before writing any code, creating any file, or making any architectural decision.

---

## 1. Project Overview

**App Name:** CompanyOS  
**Type:** Full-stack Company Management WebApp  
**Purpose:** Internal tool for managing HR, Finance, Projects, Clients, Vendors, and team operations for a company.  
**Deployment:** Vercel (frontend + API routes), MongoDB Atlas (database)

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use server components where possible |
| Styling | Tailwind CSS + MUI v5 | Tailwind for layout/spacing, MUI for complex components |
| Database | MongoDB + Mongoose | Hosted on MongoDB Atlas |
| Auth | JWT in httpOnly cookies | Role-based via middleware |
| Forms | React Hook Form + Zod | All forms must use this combo |
| Animations | Framer Motion | Splash screen and page transitions only |
| Notifications | react-hot-toast | Success, error, warning toasts |
| Icons | MUI Icons + Lucide React | Consistent icon usage across app |
| State | React Context + hooks | No Redux - keep it simple |

---

## 3. Environment Variables

Never hardcode secrets. All env vars go in `.env.local` (not committed).  
Always keep `.env.example` updated with keys but no values.

```
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_APP_NAME=CompanyOS
NEXT_PUBLIC_BASE_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 4. Folder Structure

```
app/
  (auth)/
    login/                    <- Public login page
    setup/                    <- One-time company + admin setup wizard
  (dashboard)/
    layout.tsx                <- Protected shell: TopBar + SideNav
    page.tsx                  <- Dashboard home with summary tiles
    company/
      users/                  <- RBAC user management
      employees/              <- HR module
      attendance/             <- Attendance tracking
      finance/                <- Quotes, invoices, expenses, payroll
      settings/               <- Company settings (editable post-setup)
    projects/
      clients/                <- Client profiles, proposals
      projects/               <- Project management
      invoices/               <- Invoice generation and tracking
    vendors/
      vendors/                <- Vendor profiles and payouts
      contracts/              <- Contract employees
      invoices/               <- Vendor invoices received
      servers/                <- Domains, hosting, renewals
    chats/                    <- Individual and group chats
    integrations/             <- SMTP, WhatsApp, Google, GitHub

  api/
    health/                   <- GET: returns { setup: bool, appName: string }
    auth/
      login/                  <- POST: validate credentials, set JWT cookie
      logout/                 <- POST: clear cookie
      me/                     <- GET: return current user from JWT
    setup/
      company/                <- POST: create Company document
      admin/                  <- POST: create first superadmin User
    users/                    <- CRUD for user management
    company/                  <- GET/PUT company settings
    [all other modules]/

components/
  ui/
    AppIcon.tsx
    SplashScreen.tsx
    TopBar.tsx
    SideNav.tsx
    ModuleCard.tsx
    StatTile.tsx
    PageHeader.tsx
    ConfirmDialog.tsx
    LoadingSpinner.tsx
  forms/
    CompanySetupForm.tsx
    AdminSetupForm.tsx
    [module-specific forms]

lib/
  mongodb.ts                  <- Singleton DB connection
  auth.ts                     <- JWT sign/verify/decode helpers
  validations/                <- Shared Zod schemas
  utils.ts                    <- General helpers (date format, currency, etc.)

models/
  Company.ts
  User.ts
  Employee.ts
  Client.ts
  Project.ts
  Invoice.ts
  Vendor.ts
  Attendance.ts
  Chat.ts
  [others as modules are built]

middleware.ts                 <- Root Next.js middleware for auth + setup redirects
```

---

## 5. App Launch and Routing Logic

### First Ever Launch (no company in DB)
```
/ -> middleware detects no company -> redirect to /setup
/setup -> Company Setup Wizard (4 steps) -> Admin Creation -> /dashboard
```

### Subsequent Launches
```
/ -> middleware detects company exists, no JWT -> redirect to /login
/login -> on success -> show "Welcome back, [Company Name]" splash (1.5s) -> /dashboard
```

### Splash Screen Rules
- First launch: show generic "Welcome to CompanyOS" animation (Framer Motion fade and slide)
- Store `splash_shown` flag in localStorage to prevent repeat on refresh
- Post-login splash: show "Welcome back, [Company Name]" - company name pulled from `/api/auth/me` response
- Splash only shows once per login session

---

## 6. Authentication and Authorization

### JWT Structure
```json
{
  "userId": "...",
  "role": "superadmin | admin | user",
  "companyId": "...",
  "iat": ...,
  "exp": ...
}
```

### Roles
| Role | Permissions |
|---|---|
| superadmin | Full access to everything. Cannot be deleted. Created during /setup |
| admin | Configurable per-module access. Set by superadmin |
| user | Access only to modules/tabs explicitly assigned |

### Access Control Per Module
Each module has a permission setting:
- `admin_only` - only superadmin and admins
- `specific_users` - only listed user IDs
- `all_users` - everyone with a login

Store permissions in the User model's `accessControl` array.

### Middleware Rules (middleware.ts)
- No company in DB -> redirect to `/setup`
- Company exists, no valid JWT -> redirect to `/login`
- Valid JWT -> allow through
- Public routes (no auth needed): `/login`, `/setup`, `/api/auth/*`, `/api/health`, `/api/setup/*`

---

## 7. MongoDB Models

### Company
```
name, logo (url), industry, companyType,
gst, pan, cin, financialYearStart,
address, city, state, pincode,
email, phone, website,
invoicePrefix, currency, timezone, dateFormat,
createdAt, updatedAt
```

### User
```
name, email, passwordHash, mobile,
role (enum: superadmin | admin | user),
isActive (bool),
accessControl: [{ module: string, level: string }],
companyId (ref: Company),
createdAt, updatedAt
```

### Employee (extends User reference)
```
userId (ref), employeeId, department, designation,
joiningDate, exitDate, employmentType,
salary, bankDetails, documents: [{ type, url }],
createdAt, updatedAt
```

### Invoice
```
invoiceNumber, type (proforma | invoice | receipt),
clientId or vendorId (ref),
lineItems: [{ description, qty, rate, gst, amount }],
subtotal, gstTotal, total, status,
dueDate, paidDate, notes,
createdAt, updatedAt
```

Other models (Client, Project, Vendor, Attendance, Chat) to be defined when building those modules.

---

## 8. API Conventions

- All API routes return JSON
- Success response: `{ success: true, data: {...} }`
- Error response: `{ success: false, error: "message" }`
- Always use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Validate all request bodies using Zod before touching the DB
- Protect all non-public routes by verifying JWT from cookie

---

## 9. UI and Design Conventions

### Color Palette (Tailwind config)
```
Primary:   Indigo  #4F46E5
Success:   Emerald #10B981
Error:     Red     #EF4444
Warning:   Amber   #F59E0B
Neutral:   Slate   (grays)
```

### Layout Rules
- Mobile-first responsive design on all pages
- TopBar height: 64px fixed
- SideNav width: 240px expanded, 64px collapsed (icon only)
- Main content: padding 24px desktop, 16px mobile
- All pages have a PageHeader component with title and optional action button

### Component Rules
- Never inline complex logic in JSX - extract to hooks or helper functions
- All form inputs must show: label, input, helper text (error or hint)
- Loading states: use skeleton loaders for data fetch, spinner for form actions
- Empty states: always show a message and a CTA when a list or table has no data
- Confirmation dialogs required for all delete actions

### Typography
- Page titles: `text-2xl font-bold`
- Section headers: `text-lg font-semibold`
- Body: `text-sm` (MUI default)
- Labels: `text-xs text-gray-500 uppercase tracking-wide`

---

## 10. Module Build Order

Build in this sequence. Do not start a module until the previous one is stable and reviewed.

| Step | Module | Status |
|---|---|---|
| 1 | App shell, routing, auth flow, setup wizard | Not started |
| 2 | User management + RBAC engine | Not started |
| 3 | Dashboard with live summary tiles | Not started |
| 4 | HR - Employees, attendance, documents | Not started |
| 5 | Finance - Invoices, expenses, payroll | Not started |
| 6 | Projects - Clients, tasks, git/cpanel | Not started |
| 7 | Vendors - Profiles, contracts, invoices | Not started |
| 8 | Server management - Domains, hosting | Not started |
| 9 | Chats - Individual and group, attachments | Not started |
| 10 | Integrations - SMTP, WhatsApp, Google, GitHub | Not started |
| 11 | Polish - Animations, notifications, mobile QA | Not started |

---

## 11. Key Business Rules

- **Invoice numbering:** Auto-increment using company's `invoicePrefix` (e.g. INV-0001)
- **Financial year:** Respect company's configured financial year start month
- **Salary slips:** Auto-generate on payroll run - do not allow manual backdating
- **Offer/Relieving letters:** Generate from templates with employee data pre-filled
- **Attendance:** Mark daily; basic leave types (casual, sick, earned)
- **Reminders:** Dashboard tiles must surface items due in the next 7 days (renewals, invoices, tasks)
- **Soft delete:** Never hard-delete any record - add `isDeleted: true` and `deletedAt` fields to all models
- **Audit trail:** Log `createdBy` and `updatedBy` (userId) on all records

---

## 12. What NOT to Do

- Do not use Redux - use React Context and hooks
- Do not hardcode company name, currency, or date format - always pull from DB/settings
- Do not use `any` type in TypeScript - use proper interfaces
- Do not skip Zod validation on API routes
- Do not store JWT in localStorage - httpOnly cookies only
- Do not build multiple modules in one prompt session - one step at a time
- Do not hard-delete records - always soft delete
- Do not use `alert()` - use react-hot-toast for all notifications
- Do not bypass access control checks in API routes

---

## 13. Vercel Deployment Notes

- Set all env vars in the Vercel project dashboard before deploying
- MongoDB Atlas: whitelist `0.0.0.0/0` for Vercel serverless IPs
- Every push to `main` branch triggers auto-deploy
- Use Vercel preview deployments for feature branches before merging
- `next.config.js` must include any required image domains for logo uploads

---

## 14. Local Dev Setup

```bash
git clone https://github.com/YOUR_ORG/companyos.git
cd companyos
npm install
cp .env.example .env.local
# Fill in MONGODB_URI and JWT_SECRET in .env.local
npm run dev
# App runs at http://localhost:3000
```

---

Last updated: Initial scaffold - Step 1 pending  
Maintained by: [Your Name / Team]
# AGENTS.md — CompanyOS

> This file is the single source of truth for any AI agent (Cursor, Copilot, Claude, etc.) working on this codebase.
> Read this entire file before writing any code, creating any file, or making any architectural decision.

---

## 1. Project Overview

**App Name:** CompanyOS
**Type:** Full-stack Company Management WebApp
**Purpose:** Internal tool for managing HR, Finance, Projects, Clients, Vendors, and team operations for a company.
**Deployment:** Vercel (frontend + API routes), MongoDB Atlas (database)

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use server components where possible |
| Styling | Tailwind CSS + MUI v5 | Tailwind for layout/spacing, MUI for complex components |
| Database | MongoDB + Mongoose | Hosted on MongoDB Atlas |
| Auth | JWT in httpOnly cookies | Role-based via middleware |
| Forms | React Hook Form + Zod | All forms must use this combo |
| Animations | Framer Motion | Splash screen and page transitions only |
| Notifications | react-hot-toast | Success, error, warning toasts |
| Icons | MUI Icons + Lucide React | Consistent icon usage across app |
| State | React Context + hooks | No Redux — keep it simple |

---

## 3. Environment Variables

Never hardcode secrets. All env vars go in `.env.local` (not committed).
Always keep `.env.example` updated with keys but no values.

```
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_APP_NAME=CompanyOS
NEXT_PUBLIC_BASE_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 4. Folder Structure

```
app/
  (auth)/
    login/                    <- Public login page
    setup/                    <- One-time company + admin setup wizard
  (dashboard)/
    layout.tsx                <- Protected shell: TopBar + SideNav
    page.tsx                  <- Dashboard home with summary tiles
    company/
      users/                  <- RBAC user management
      employees/              <- HR module
      attendance/             <- Attendance tracking
      finance/                <- Quotes, invoices, expenses, payroll
      settings/               <- Company settings (editable post-setup)
    projects/
      clients/                <- Client profiles, proposals
      projects/               <- Project management
      invoices/               <- Invoice generation and tracking
    vendors/
      vendors/                <- Vendor profiles and payouts
      contracts/              <- Contract employees
      invoices/               <- Vendor invoices received
      servers/                <- Domains, hosting, renewals
    chats/                    <- Individual and group chats
    integrations/             <- SMTP, WhatsApp, Google, GitHub

  api/
    health/                   <- GET: returns { setup: bool, appName: string }
    auth/
      login/                  <- POST: validate credentials, set JWT cookie
      logout/                 <- POST: clear cookie
      me/                     <- GET: return current user from JWT
    setup/
      company/                <- POST: create Company document
      admin/                  <- POST: create first superadmin User
    users/                    <- CRUD for user management
    company/                  <- GET/PUT company settings
    [all other modules]/

components/
  ui/
    AppIcon.tsx
    SplashScreen.tsx
    TopBar.tsx
    SideNav.tsx
    ModuleCard.tsx
    StatTile.tsx
    PageHeader.tsx
    ConfirmDialog.tsx
    LoadingSpinner.tsx
  forms/
    CompanySetupForm.tsx
    AdminSetupForm.tsx
    [module-specific forms]

lib/
  mongodb.ts                  <- Singleton DB connection
  auth.ts                     <- JWT sign/verify/decode helpers
  validations/                <- Shared Zod schemas
  utils.ts                    <- General helpers (date format, currency, etc.)

models/
  Company.ts
  User.ts
  Employee.ts
  Client.ts
  Project.ts
  Invoice.ts
  Vendor.ts
  Attendance.ts
  Chat.ts
  [others as modules are built]

middleware.ts                 <- Root Next.js middleware for auth + setup redirects
```

---

## 5. App Launch and Routing Logic

### First Ever Launch (no company in DB)
```
/ -> middleware detects no company -> redirect to /setup
/setup -> Company Setup Wizard (4 steps) -> Admin Creation -> /dashboard
```

### Subsequent Launches
```
/ -> middleware detects company exists, no JWT -> redirect to /login
/login -> on success -> show "Welcome back, [Company Name]" splash (1.5s) -> /dashboard
```

### Splash Screen Rules
- First launch: show generic "Welcome to CompanyOS" animation (Framer Motion fade and slide)
- Store `splash_shown` flag in localStorage to prevent repeat on refresh
- Post-login splash: show "Welcome back, [Company Name]" — company name pulled from `/api/auth/me` response
- Splash only shows once per login session

---

## 6. Authentication and Authorization

### JWT Structure
```json
{
  "userId": "...",
  "role": "superadmin | admin | user",
  "companyId": "...",
  "iat": ...,
  "exp": ...
}
```

### Roles
| Role | Permissions |
|---|---|
| superadmin | Full access to everything. Cannot be deleted. Created during /setup |
| admin | Configurable per-module access. Set by superadmin |
| user | Access only to modules/tabs explicitly assigned |

### Access Control Per Module
Each module has a permission setting:
- `admin_only` — only superadmin and admins
- `specific_users` — only listed user IDs
- `all_users` — everyone with a login

Store permissions in the User model's `accessControl` array.

### Middleware Rules (middleware.ts)
- No company in DB -> redirect to `/setup`
- Company exists, no valid JWT -> redirect to `/login`
- Valid JWT -> allow through
- Public routes (no auth needed): `/login`, `/setup`, `/api/auth/*`, `/api/health`, `/api/setup/*`

---

## 7. MongoDB Models

### Company
```
name, logo (url), industry, companyType,
gst, pan, cin, financialYearStart,
address, city, state, pincode,
email, phone, website,
invoicePrefix, currency, timezone, dateFormat,
createdAt, updatedAt
```

### User
```
name, email, passwordHash, mobile,
role (enum: superadmin | admin | user),
isActive (bool),
accessControl: [{ module: string, level: string }],
companyId (ref: Company),
createdAt, updatedAt
```

### Employee (extends User reference)
```
userId (ref), employeeId, department, designation,
joiningDate, exitDate, employmentType,
salary, bankDetails, documents: [{ type, url }],
createdAt, updatedAt
```

### Invoice
```
invoiceNumber, type (proforma | invoice | receipt),
clientId or vendorId (ref),
lineItems: [{ description, qty, rate, gst, amount }],
subtotal, gstTotal, total, status,
dueDate, paidDate, notes,
createdAt, updatedAt
```

Other models (Client, Project, Vendor, Attendance, Chat) to be defined when building those modules.

---

## 8. API Conventions

- All API routes return JSON
- Success response: `{ success: true, data: {...} }`
- Error response: `{ success: false, error: "message" }`
- Always use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Validate all request bodies using Zod before touching the DB
- Protect all non-public routes by verifying JWT from cookie

---

## 9. UI and Design Conventions

### Color Palette (Tailwind config)
```
Primary:   Indigo  #4F46E5
Success:   Emerald #10B981
Error:     Red     #EF4444
Warning:   Amber   #F59E0B
Neutral:   Slate   (grays)
```

### Layout Rules
- Mobile-first responsive design on all pages
- TopBar height: 64px fixed
- SideNav width: 240px expanded, 64px collapsed (icon only)
- Main content: padding 24px desktop, 16px mobile
- All pages have a PageHeader component with title and optional action button

### Component Rules
- Never inline complex logic in JSX — extract to hooks or helper functions
- All form inputs must show: label, input, helper text (error or hint)
- Loading states: use skeleton loaders for data fetch, spinner for form actions
- Empty states: always show a message and a CTA when a list or table has no data
- Confirmation dialogs required for all delete actions

### Typography
- Page titles: `text-2xl font-bold`
- Section headers: `text-lg font-semibold`
- Body: `text-sm` (MUI default)
- Labels: `text-xs text-gray-500 uppercase tracking-wide`

---

## 10. Module Build Order

Build in this sequence. Do not start a module until the previous one is stable and reviewed.

| Step | Module | Status |
|---|---|---|
| 1 | App shell, routing, auth flow, setup wizard | Not started |
| 2 | User management + RBAC engine | Not started |
| 3 | Dashboard with live summary tiles | Not started |
| 4 | HR — Employees, attendance, documents | Not started |
| 5 | Finance — Invoices, expenses, payroll | Not started |
| 6 | Projects — Clients, tasks, git/cpanel | Not started |
| 7 | Vendors — Profiles, contracts, invoices | Not started |
| 8 | Server management — Domains, hosting | Not started |
| 9 | Chats — Individual and group, attachments | Not started |
| 10 | Integrations — SMTP, WhatsApp, Google, GitHub | Not started |
| 11 | Polish — Animations, notifications, mobile QA | Not started |

---

## 11. Key Business Rules

- **Invoice numbering:** Auto-increment using company's `invoicePrefix` (e.g. INV-0001)
- **Financial year:** Respect company's configured financial year start month
- **Salary slips:** Auto-generate on payroll run — do not allow manual backdating
- **Offer/Relieving letters:** Generate from templates with employee data pre-filled
- **Attendance:** Mark daily; basic leave types (casual, sick, earned)
- **Reminders:** Dashboard tiles must surface items due in the next 7 days (renewals, invoices, tasks)
- **Soft delete:** Never hard-delete any record — add `isDeleted: true` and `deletedAt` fields to all models
- **Audit trail:** Log `createdBy` and `updatedBy` (userId) on all records

---

## 12. What NOT to Do

- Do not use Redux — use React Context and hooks
- Do not hardcode company name, currency, or date format — always pull from DB/settings
- Do not use `any` type in TypeScript — use proper interfaces
- Do not skip Zod validation on API routes
- Do not store JWT in localStorage — httpOnly cookies only
- Do not build multiple modules in one prompt session — one step at a time
- Do not hard-delete records — always soft delete
- Do not use `alert()` — use react-hot-toast for all notifications
- Do not bypass access control checks in API routes

---

## 13. Vercel Deployment Notes

- Set all env vars in the Vercel project dashboard before deploying
- MongoDB Atlas: whitelist `0.0.0.0/0` for Vercel serverless IPs
- Every push to `main` branch triggers auto-deploy
- Use Vercel preview deployments for feature branches before merging
- `next.config.js` must include any required image domains for logo uploads

---

## 14. Local Dev Setup

```bash
git clone https://github.com/YOUR_ORG/companyos.git
cd companyos
npm install
cp .env.example .env.local
# Fill in MONGODB_URI and JWT_SECRET in .env.local
npm run dev
# App runs at http://localhost:3000
```

---

Last updated: Initial scaffold — Step 1 pending
Maintained by: [Your Name / Team]
