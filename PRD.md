# RentalPulse - Product Requirements Document (PRD)

## 1. Executive Summary

**Product Name:** RentalPulse
**Tagline:** "Never miss a rent check or maintenance call"
**Version:** 1.0
**Last Updated:** January 26, 2026

RentalPulse is a web-based landlord and property manager toolkit designed to streamline rental property management. The platform helps users track rent payments, manage lease renewals, schedule maintenance, and calculate financial metrics—all in one mobile-responsive application.

---

## 2. Product Vision & Goals

### 2.1 Vision
To become the go-to solution for independent landlords and small property managers who need an affordable, intuitive tool to manage their rental properties efficiently.

### 2.2 Goals
- Provide an accessible, easy-to-use property management solution
- Reduce missed rent payments through tracking and reminders
- Prevent costly maintenance oversights with scheduled reminders
- Help landlords make data-driven decisions with ROI calculations
- Generate recurring revenue through a freemium subscription model

### 2.3 Success Metrics
- User registration conversion rate
- Free-to-premium conversion rate
- Monthly recurring revenue (MRR)
- User retention rate (30/60/90 day)
- Daily/Weekly active users
- Feature engagement rates

---

## 3. Target Audience

### 3.1 Primary Users
- **Independent Landlords:** Own 1-10 rental properties, manage them personally
- **Small Property Managers:** Manage properties for multiple owners, typically < 50 units
- **Real Estate Investors:** Own rental properties as investment vehicles

### 3.2 User Personas

**Persona 1: Sarah the Side-Hustle Landlord**
- Age: 35-45
- Owns 2-3 rental properties alongside full-time job
- Needs simple, quick tools to manage properties
- Price-sensitive, values affordability
- Uses mobile frequently

**Persona 2: Mike the Growing Investor**
- Age: 40-55
- Owns 5-10 properties, actively acquiring more
- Needs ROI tracking and financial insights
- Willing to pay for tools that save time
- Desktop primary, mobile secondary

---

## 4. Feature Requirements

### 4.1 Feature Tiers Overview

| Feature | Free Tier | Premium Tier ($3.99/mo) |
|---------|-----------|------------------------|
| Properties | Up to 2 | Unlimited |
| Units per Property | Up to 4 | Unlimited |
| Tenants | Up to 4 | Unlimited |
| Rent Payment Tracker | Basic (current month) | Full history + analytics |
| Lease Expiration Countdown | View only | + Email reminders |
| Maintenance Scheduler | Up to 5 items | Unlimited + reminders |
| Tenant Notes | Up to 10 notes total | Unlimited |
| Late Fee Calculator | Basic | Advanced with custom rules |
| ROI Calculator | 1 property | All properties + comparisons |
| Data Export | None | CSV/PDF export |
| Email Notifications | None | Full notification system |

---

### 4.2 Authentication & User Management

#### 4.2.1 User Registration
- **Required Fields:**
  - Email address (unique, validated format)
  - Password (minimum 8 characters, 1 uppercase, 1 number, 1 special character)
  - First name
  - Last name
- **Optional Fields:**
  - Phone number
  - Company/Business name
- **Process:**
  - Email verification required before account activation
  - Welcome email with getting started guide
  - Default to Free tier upon registration

#### 4.2.2 User Login
- Email + password authentication
- "Remember me" option (30-day session)
- Password reset via email link (expires in 24 hours)
- Account lockout after 5 failed attempts (15-minute lockout)
- Session timeout after 30 minutes of inactivity

#### 4.2.3 User Profile Management
- Edit personal information
- Change password (requires current password)
- Update email (requires re-verification)
- Delete account (with confirmation and data export option)
- View subscription status and billing history

---

### 4.3 Subscription & Billing (Stripe Integration)

#### 4.3.1 Subscription Plans
| Plan | Price | Billing Cycle | Trial |
|------|-------|---------------|-------|
| Free | $0 | N/A | N/A |
| Premium | $3.99 | Monthly | 7 days |

#### 4.3.2 Trial Period
- 7-day free trial for Premium features
- Credit card required to start trial
- Email reminder on day 5 of trial
- Email notification 24 hours before trial ends
- Automatic conversion to paid subscription if not cancelled
- Trial can only be used once per user

#### 4.3.3 Payment Processing
- Stripe integration for all payment processing
- Accepted payment methods: Credit/Debit cards (Visa, Mastercard, Amex, Discover)
- Automatic monthly billing on subscription anniversary
- Invoice/receipt sent via email after each charge
- Failed payment handling:
  - Immediate retry
  - Retry after 3 days
  - Retry after 7 days
  - Account downgrade to Free after 3 failed attempts
  - Email notifications at each step

#### 4.3.4 Subscription Management
- Upgrade from Free to Premium (immediate access)
- Cancel subscription (access until end of billing period)
- Reactivate subscription
- View billing history
- Update payment method
- Download invoices

#### 4.3.5 Stripe Webhook Events to Handle
- `checkout.session.completed` - Trial/subscription started
- `invoice.paid` - Successful payment
- `invoice.payment_failed` - Failed payment
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Subscription cancelled

---

### 4.4 Property Management

#### 4.4.1 Property CRUD Operations
- **Create Property:**
  - Property name (required)
  - Property type (Single Family, Multi-Family, Apartment, Condo, Townhouse, Commercial)
  - Address (street, city, state, ZIP)
  - Purchase price (optional, for ROI)
  - Purchase date (optional, for ROI)
  - Current market value (optional, for ROI)
  - Monthly mortgage payment (optional)
  - Property taxes (annual, optional)
  - Insurance (annual, optional)
  - HOA fees (monthly, optional)
  - Property image upload (optional)
  - Notes (optional)

- **Read Property:**
  - Property details view
  - Associated units list
  - Financial summary
  - Maintenance schedule overview

- **Update Property:**
  - Edit all fields
  - Archive property (soft delete)

- **Delete Property:**
  - Confirmation required
  - Cascades to units and related data
  - Option to export data before deletion

#### 4.4.2 Unit Management (within Properties)
- **Create Unit:**
  - Unit identifier (e.g., "Unit A", "101", "Main House")
  - Bedrooms count
  - Bathrooms count
  - Square footage
  - Monthly rent amount
  - Status (Vacant, Occupied, Maintenance, Listed)
  - Amenities (checkboxes: washer/dryer, parking, pet-friendly, etc.)

- **Read/Update/Delete:** Standard CRUD with confirmations

---

### 4.5 Tenant Management

#### 4.5.1 Tenant CRUD Operations
- **Create Tenant:**
  - First name (required)
  - Last name (required)
  - Email address
  - Phone number (primary)
  - Phone number (secondary)
  - Emergency contact name
  - Emergency contact phone
  - Assigned unit (required)
  - Lease start date (required)
  - Lease end date (required)
  - Monthly rent amount
  - Security deposit amount
  - Security deposit paid date
  - Move-in date
  - Status (Active, Former, Pending)

- **Read/Update/Delete:** Standard CRUD operations

#### 4.5.2 Tenant History
- Move-in/move-out dates
- Payment history summary
- Notes and incidents log
- Previous units (if transferred within properties)

---

### 4.6 Rent Payment Tracker

#### 4.6.1 Payment Recording
- **Record Payment:**
  - Tenant/Unit selection
  - Payment date
  - Amount paid
  - Payment method (Cash, Check, Bank Transfer, Venmo, Zelle, PayPal, Other)
  - Check number (if applicable)
  - Reference/confirmation number
  - Notes
  - Mark as partial payment (auto-calculate remaining)

#### 4.6.2 Payment Status Tracking
- **Statuses:**
  - Paid (full amount received)
  - Partial (partial payment received)
  - Pending (not yet due)
  - Due (due date reached)
  - Overdue (past due date)
  - Waived (landlord waived payment)

#### 4.6.3 Payment Views
- **Monthly Calendar View:** Visual calendar showing payment status per unit
- **List View:** Sortable, filterable list of all payments
- **Unit View:** Payment history for specific unit
- **Tenant View:** Payment history for specific tenant

#### 4.6.4 Payment Analytics (Premium)
- Monthly income totals
- Year-over-year comparison
- Average days late per tenant
- Collection rate percentage
- Income by property/unit charts

---

### 4.7 Lease Expiration Countdown & Renewal Reminders

#### 4.7.1 Lease Dashboard
- List of all leases with days remaining
- Color-coded urgency:
  - Green: > 90 days remaining
  - Yellow: 30-90 days remaining
  - Orange: < 30 days remaining
  - Red: Expired/Month-to-month

#### 4.7.2 Renewal Workflow
- **Reminder Schedule (Premium):**
  - 90 days before expiration
  - 60 days before expiration
  - 30 days before expiration
  - 14 days before expiration
  - 7 days before expiration
  - On expiration date
- **Renewal Actions:**
  - Mark as "Renewal Sent"
  - Mark as "Renewed" (enter new dates)
  - Mark as "Not Renewing" (triggers move-out workflow)
  - Mark as "Month-to-Month"

#### 4.7.3 Lease Document Storage (Premium)
- Upload lease documents (PDF, DOC, DOCX)
- Maximum file size: 10MB
- Storage limit: 100MB per account

---

### 4.8 Maintenance Schedule Tracker

#### 4.8.1 Maintenance Item Types
- **Recurring Maintenance:**
  - HVAC filter replacement (monthly/quarterly)
  - HVAC system inspection (annual)
  - Pest control treatment (monthly/quarterly)
  - Gutter cleaning (semi-annual)
  - Smoke/CO detector testing (semi-annual)
  - Fire extinguisher inspection (annual)
  - Water heater flush (annual)
  - Roof inspection (annual)
  - Landscaping/lawn care (weekly/bi-weekly)
  - Custom recurring item

- **One-Time Maintenance:**
  - Repairs
  - Upgrades
  - Inspections
  - Custom item

#### 4.8.2 Maintenance Item Fields
- Item name
- Property/Unit assignment
- Category (HVAC, Plumbing, Electrical, Exterior, Interior, Safety, Other)
- Frequency (One-time, Weekly, Bi-weekly, Monthly, Quarterly, Semi-annual, Annual)
- Last completed date
- Next due date (auto-calculated for recurring)
- Estimated cost
- Actual cost (when completed)
- Vendor/Contractor name
- Vendor contact info
- Priority (Low, Medium, High, Urgent)
- Status (Scheduled, In Progress, Completed, Overdue, Cancelled)
- Notes
- Attachments (receipts, photos)

#### 4.8.3 Maintenance Reminders (Premium)
- Email reminders before due date
- Configurable reminder timing (1, 3, 7, 14, 30 days before)
- Overdue notifications

#### 4.8.4 Maintenance History
- Completed items log
- Cost tracking over time
- Maintenance expense reports

---

### 4.9 Tenant Notes/History Log

#### 4.9.1 Note Types
- General note
- Communication log (call, email, text, in-person)
- Complaint
- Violation/Warning
- Positive feedback
- Maintenance request
- Payment issue
- Lease discussion
- Move-in inspection
- Move-out inspection

#### 4.9.2 Note Fields
- Note type
- Date/time
- Subject/Title
- Description
- Follow-up required (yes/no)
- Follow-up date
- Attachments (photos, documents)
- Private note (visible only to account owner)

#### 4.9.3 Note Display
- Chronological timeline view
- Filter by note type
- Search notes
- Pin important notes

---

### 4.10 Late Fee Calculator

#### 4.10.1 Basic Calculator (Free)
- Input rent amount
- Input days late
- Select late fee type:
  - Flat fee (e.g., $50)
  - Percentage of rent (e.g., 5%)
  - Per-day fee (e.g., $10/day)
- Calculate total late fee
- Calculate total amount due

#### 4.10.2 Advanced Calculator (Premium)
- **Custom Late Fee Rules per Property/Unit:**
  - Grace period (days before late fee applies)
  - Late fee type and amount
  - Maximum late fee cap
  - Compound late fees (additional fees for extended lateness)
- **Automatic Late Fee Tracking:**
  - Auto-calculate late fees based on rules
  - Add late fees to tenant balance
  - Track late fee payment status
- **Late Fee Reports:**
  - Total late fees assessed
  - Total late fees collected
  - Late fee collection rate

---

### 4.11 ROI Calculator

#### 4.11.1 Basic ROI Calculator (Free - 1 Property)
- **Inputs:**
  - Purchase price
  - Down payment
  - Closing costs
  - Renovation costs
  - Monthly rental income
  - Monthly mortgage payment
  - Property taxes (annual)
  - Insurance (annual)
  - HOA fees (monthly)
  - Maintenance estimate (% of rent or fixed)
  - Vacancy rate estimate (%)
  - Property management fees (% or fixed)

- **Calculations:**
  - Monthly gross income
  - Monthly expenses breakdown
  - Monthly net operating income (NOI)
  - Monthly cash flow
  - Annual cash flow
  - Cash-on-cash return (%)
  - Cap rate (%)
  - Total ROI (%)
  - Break-even occupancy rate

#### 4.11.2 Advanced ROI Features (Premium)
- Calculate for all properties
- Side-by-side property comparison
- Historical tracking of actual vs. projected
- Appreciation calculator
- Equity build-up tracking
- Total portfolio performance
- Export reports (PDF/CSV)

---

### 4.12 Dashboard

#### 4.12.1 Overview Dashboard
- **Quick Stats Cards:**
  - Total properties/units
  - Occupied vs. vacant units
  - Total monthly expected income
  - This month's collected amount
  - Outstanding balances
  - Upcoming lease expirations (next 90 days)
  - Overdue maintenance items

- **Charts/Visualizations:**
  - Monthly income (last 12 months)
  - Occupancy rate trend
  - Rent collection status (pie chart)
  - Upcoming tasks/reminders

#### 4.12.2 Quick Actions
- Record payment
- Add maintenance item
- Add tenant note
- View overdue items

---

### 4.13 Notifications & Reminders

#### 4.13.1 Email Notifications (Premium)
- Lease expiration reminders
- Maintenance due reminders
- Rent due reminders (for landlord tracking)
- Payment overdue alerts
- Trial ending reminder
- Subscription billing notifications

#### 4.13.2 In-App Notifications
- Bell icon with notification count
- Notification dropdown/panel
- Mark as read/unread
- Clear all notifications
- Notification preferences in settings

#### 4.13.3 Notification Preferences
- Toggle email notifications on/off per type
- Set reminder timing preferences
- Quiet hours (optional)

---

### 4.14 Data Export (Premium)
- Export tenant list (CSV)
- Export payment history (CSV)
- Export maintenance history (CSV)
- Export property/unit data (CSV)
- Export financial summary (PDF)
- Full data export (JSON) for account migration

---

## 5. Admin Panel Requirements

### 5.1 Admin Authentication
- Separate admin login URL (`/admin`)
- Admin accounts are distinct from regular user accounts
- Admin accounts cannot access main user features
- Two-factor authentication required for admin accounts
- Admin session timeout: 15 minutes of inactivity
- Admin action logging (audit trail)

### 5.2 Admin Roles
- **Super Admin:** Full access to all admin features
- **Support Admin:** Limited to user management and support tasks

### 5.3 Admin Dashboard
- Total registered users
- Active users (logged in last 30 days)
- Free vs. Premium user breakdown
- New registrations (today/week/month)
- Trial conversion rate
- Churn rate
- Monthly recurring revenue (MRR)
- Revenue trend chart

### 5.4 User Management
- **User List View:**
  - Searchable by name, email
  - Filterable by subscription status, registration date, last active
  - Sortable columns
  - Pagination (25/50/100 per page)

- **User Details View:**
  - Account information
  - Subscription status and history
  - Payment history
  - Login history
  - Properties/units count
  - Account creation date
  - Last login date

- **User Actions:**
  - Grant Premium access (without charging)
    - Set expiration date (optional, or indefinite)
    - Add reason/note for audit
  - Revoke granted Premium access
  - Extend trial period
  - Reset user password (sends reset email)
  - Disable/Enable account
  - Delete account
  - Impersonate user (view-only, for support)

### 5.5 Grant Premium Feature
- Select user(s) to grant premium
- Options:
  - Duration: 1 month, 3 months, 6 months, 1 year, Indefinite
  - Reason: Support resolution, Promotional, Partner, Bug compensation, Other
  - Notes field for documentation
- Premium granted this way:
  - Does NOT charge the user
  - Does NOT require payment method
  - Shows as "Granted" status (distinct from "Paid" or "Trial")
  - Can be revoked at any time
  - Expires automatically if duration set
  - Email notification sent to user about granted access

### 5.6 Subscription Management
- View all active subscriptions
- View failed payments
- Manual subscription adjustments
- Refund processing (via Stripe dashboard link)

### 5.7 System Settings (Super Admin)
- Maintenance mode toggle
- Feature flags
- Email template management
- Pricing adjustments (future-proofing)

### 5.8 Reports
- User registration trends
- Subscription conversion funnel
- Revenue reports
- Feature usage analytics
- Churn analysis

### 5.9 Admin Audit Log
- Track all admin actions
- Include: admin user, action, target user, timestamp, details
- Searchable and filterable
- Export capability

---

## 6. Technical Requirements

### 6.1 Frontend
- **Framework:** React.js or Next.js
- **Styling:** Tailwind CSS for responsive design
- **State Management:** React Context or Redux
- **Form Handling:** React Hook Form with validation
- **Charts:** Chart.js or Recharts
- **Date Handling:** date-fns or dayjs
- **Mobile:** Responsive design (mobile-first approach)

### 6.2 Backend
- **Framework:** Node.js with Express or Next.js API routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT tokens with refresh token rotation
- **Session Management:** Secure HTTP-only cookies
- **API Design:** RESTful API with proper status codes

### 6.3 Third-Party Integrations
- **Payments:** Stripe (subscriptions, webhooks)
- **Email:** SendGrid or AWS SES
- **File Storage:** AWS S3 or Cloudflare R2
- **Monitoring:** Sentry for error tracking
- **Analytics:** Google Analytics or Plausible

### 6.4 Security Requirements
- HTTPS everywhere (TLS 1.3)
- Password hashing (bcrypt, minimum 12 rounds)
- CSRF protection
- XSS prevention (input sanitization, CSP headers)
- SQL injection prevention (parameterized queries via ORM)
- Rate limiting on authentication endpoints
- Secure session management
- Data encryption at rest for sensitive fields
- Regular security audits
- GDPR compliance considerations

### 6.5 Performance Requirements
- Page load time: < 3 seconds (LCP)
- Time to interactive: < 5 seconds
- API response time: < 500ms (95th percentile)
- Support for 10,000+ concurrent users
- Database query optimization
- CDN for static assets
- Image optimization

### 6.6 Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### 6.7 Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Form labels and error messages
- Skip navigation links

---

## 7. User Interface Requirements

### 7.1 Design Principles
- Clean, professional aesthetic
- Consistent visual language
- Intuitive navigation
- Clear visual hierarchy
- Helpful empty states
- Informative loading states
- Friendly error messages

### 7.2 Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

### 7.3 Key UI Components
- Top navigation bar with user menu
- Sidebar navigation (collapsible on mobile)
- Dashboard cards and widgets
- Data tables with sorting/filtering
- Modal dialogs for forms
- Toast notifications
- Confirmation dialogs
- Loading skeletons
- Empty state illustrations

### 7.4 Color Scheme (Suggested)
- Primary: Blue (#2563EB) - Trust, professionalism
- Secondary: Green (#059669) - Money, positive actions
- Warning: Amber (#D97706) - Attention needed
- Danger: Red (#DC2626) - Urgent, overdue, errors
- Neutral: Gray scale for text and backgrounds

### 7.5 Typography
- Font Family: Inter or similar sans-serif
- Base size: 16px
- Scale: 12px, 14px, 16px, 18px, 24px, 32px, 48px

---

## 8. Page Structure

### 8.1 Public Pages (No Auth Required)
- Landing page (`/`)
- Features page (`/features`)
- Pricing page (`/pricing`)
- Login page (`/login`)
- Register page (`/register`)
- Forgot password (`/forgot-password`)
- Reset password (`/reset-password/:token`)
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)

### 8.2 Authenticated User Pages
- Dashboard (`/dashboard`)
- Properties list (`/properties`)
- Property details (`/properties/:id`)
- Add/Edit property (`/properties/new`, `/properties/:id/edit`)
- Units list (`/properties/:id/units`)
- Unit details (`/properties/:id/units/:unitId`)
- Tenants list (`/tenants`)
- Tenant details (`/tenants/:id`)
- Add/Edit tenant (`/tenants/new`, `/tenants/:id/edit`)
- Payments (`/payments`)
- Record payment (`/payments/new`)
- Leases (`/leases`)
- Maintenance (`/maintenance`)
- Add maintenance item (`/maintenance/new`)
- Calculators (`/calculators`)
- Late fee calculator (`/calculators/late-fee`)
- ROI calculator (`/calculators/roi`)
- Reports (`/reports`) [Premium]
- Settings (`/settings`)
- Profile (`/settings/profile`)
- Subscription (`/settings/subscription`)
- Notifications (`/settings/notifications`)

### 8.3 Admin Pages
- Admin login (`/admin/login`)
- Admin dashboard (`/admin`)
- User management (`/admin/users`)
- User details (`/admin/users/:id`)
- Subscriptions (`/admin/subscriptions`)
- Reports (`/admin/reports`)
- Settings (`/admin/settings`)
- Audit log (`/admin/audit-log`)

---

## 9. Database Schema (High-Level)

### 9.1 Core Tables
```
Users
- id (UUID, PK)
- email (unique)
- password_hash
- first_name
- last_name
- phone
- company_name
- email_verified (boolean)
- email_verified_at (timestamp)
- created_at
- updated_at
- last_login_at
- status (active, disabled, deleted)

Subscriptions
- id (UUID, PK)
- user_id (FK)
- stripe_customer_id
- stripe_subscription_id
- plan (free, premium)
- status (active, trialing, past_due, cancelled, granted)
- trial_start
- trial_end
- current_period_start
- current_period_end
- granted_by (FK to AdminUsers, nullable)
- granted_reason
- granted_expires_at
- created_at
- updated_at

Properties
- id (UUID, PK)
- user_id (FK)
- name
- type
- address_street
- address_city
- address_state
- address_zip
- purchase_price
- purchase_date
- current_value
- mortgage_payment
- property_tax_annual
- insurance_annual
- hoa_monthly
- image_url
- notes
- status (active, archived)
- created_at
- updated_at

Units
- id (UUID, PK)
- property_id (FK)
- identifier
- bedrooms
- bathrooms
- square_feet
- rent_amount
- status (vacant, occupied, maintenance, listed)
- amenities (JSON)
- created_at
- updated_at

Tenants
- id (UUID, PK)
- user_id (FK)
- unit_id (FK)
- first_name
- last_name
- email
- phone_primary
- phone_secondary
- emergency_contact_name
- emergency_contact_phone
- lease_start
- lease_end
- rent_amount
- security_deposit
- security_deposit_paid_at
- move_in_date
- move_out_date
- status (active, former, pending)
- created_at
- updated_at

Payments
- id (UUID, PK)
- tenant_id (FK)
- unit_id (FK)
- amount
- payment_date
- due_date
- payment_method
- reference_number
- status (paid, partial, pending, overdue, waived)
- late_fee_amount
- notes
- created_at
- updated_at

MaintenanceItems
- id (UUID, PK)
- property_id (FK)
- unit_id (FK, nullable)
- name
- category
- frequency
- last_completed
- next_due
- estimated_cost
- actual_cost
- vendor_name
- vendor_contact
- priority
- status
- notes
- created_at
- updated_at

TenantNotes
- id (UUID, PK)
- tenant_id (FK)
- user_id (FK)
- note_type
- subject
- description
- follow_up_required
- follow_up_date
- is_private
- created_at
- updated_at

LateFeeRules
- id (UUID, PK)
- user_id (FK)
- property_id (FK, nullable)
- unit_id (FK, nullable)
- grace_period_days
- fee_type (flat, percentage, per_day)
- fee_amount
- max_fee
- created_at
- updated_at

Documents
- id (UUID, PK)
- user_id (FK)
- tenant_id (FK, nullable)
- property_id (FK, nullable)
- name
- file_url
- file_type
- file_size
- created_at

Notifications
- id (UUID, PK)
- user_id (FK)
- type
- title
- message
- read_at
- created_at

AdminUsers
- id (UUID, PK)
- email (unique)
- password_hash
- first_name
- last_name
- role (super_admin, support_admin)
- two_factor_secret
- two_factor_enabled
- last_login_at
- created_at
- updated_at

AdminAuditLog
- id (UUID, PK)
- admin_user_id (FK)
- action
- target_type
- target_id
- details (JSON)
- ip_address
- created_at
```

---

## 10. API Endpoints (High-Level)

### 10.1 Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
GET    /api/auth/me
```

### 10.2 Subscription
```
POST   /api/subscription/create-checkout
POST   /api/subscription/create-portal-session
GET    /api/subscription/status
POST   /api/webhooks/stripe
```

### 10.3 Properties
```
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id
```

### 10.4 Units
```
GET    /api/properties/:propertyId/units
POST   /api/properties/:propertyId/units
GET    /api/units/:id
PUT    /api/units/:id
DELETE /api/units/:id
```

### 10.5 Tenants
```
GET    /api/tenants
POST   /api/tenants
GET    /api/tenants/:id
PUT    /api/tenants/:id
DELETE /api/tenants/:id
GET    /api/tenants/:id/notes
POST   /api/tenants/:id/notes
```

### 10.6 Payments
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
PUT    /api/payments/:id
DELETE /api/payments/:id
GET    /api/payments/summary
```

### 10.7 Maintenance
```
GET    /api/maintenance
POST   /api/maintenance
GET    /api/maintenance/:id
PUT    /api/maintenance/:id
DELETE /api/maintenance/:id
POST   /api/maintenance/:id/complete
```

### 10.8 Calculators
```
POST   /api/calculators/late-fee
POST   /api/calculators/roi
GET    /api/calculators/roi/:propertyId
```

### 10.9 Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/charts
GET    /api/dashboard/upcoming
```

### 10.10 Admin Endpoints
```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me

GET    /api/admin/dashboard/stats
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
POST   /api/admin/users/:id/grant-premium
POST   /api/admin/users/:id/revoke-premium
POST   /api/admin/users/:id/extend-trial
POST   /api/admin/users/:id/reset-password
POST   /api/admin/users/:id/disable
POST   /api/admin/users/:id/enable
DELETE /api/admin/users/:id

GET    /api/admin/subscriptions
GET    /api/admin/audit-log
GET    /api/admin/reports/:type
```

---

## 11. Email Templates Required

1. **Welcome Email** - After registration
2. **Email Verification** - Verify email address
3. **Password Reset** - Reset password link
4. **Trial Started** - Welcome to Premium trial
5. **Trial Ending Soon** - 24 hours before trial ends
6. **Subscription Confirmed** - Payment successful
7. **Payment Failed** - Payment issue notification
8. **Subscription Cancelled** - Cancellation confirmation
9. **Premium Granted** - Admin granted premium access
10. **Premium Expiring** - Granted premium about to expire
11. **Lease Expiration Reminder** - Lease renewal reminder
12. **Maintenance Due Reminder** - Maintenance item due
13. **Account Disabled** - Account has been disabled

---

## 12. Future Considerations (Out of Scope for V1)

- Native mobile apps (iOS/Android)
- Tenant portal (tenants can view lease, submit maintenance requests)
- Online rent collection (tenants pay through platform)
- Automated late fee application
- Integration with accounting software (QuickBooks, etc.)
- Multi-user accounts (property management teams)
- Property listing syndication
- Background check integration
- E-signature for leases
- SMS notifications
- Two-factor authentication for users
- API access for integrations
- White-label options

---

## 13. Launch Checklist

### 13.1 Pre-Launch
- [ ] Complete all core features
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] Accessibility audit passed
- [ ] Stripe integration tested (test mode)
- [ ] Email templates reviewed
- [ ] Terms of Service finalized
- [ ] Privacy Policy finalized
- [ ] Admin panel tested
- [ ] Error monitoring configured
- [ ] Analytics configured
- [ ] Backup system verified
- [ ] SSL certificate configured

### 13.2 Launch
- [ ] Switch Stripe to live mode
- [ ] Configure production environment
- [ ] DNS configuration
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Customer support ready

### 13.3 Post-Launch
- [ ] Monitor user feedback
- [ ] Track conversion metrics
- [ ] Address critical bugs immediately
- [ ] Plan V1.1 based on feedback

---

## 14. Appendix

### 14.1 Glossary
- **NOI (Net Operating Income):** Gross income minus operating expenses
- **Cap Rate:** NOI divided by property value
- **Cash-on-Cash Return:** Annual cash flow divided by total cash invested
- **LCP (Largest Contentful Paint):** Core Web Vital measuring loading performance
- **WCAG:** Web Content Accessibility Guidelines

### 14.2 References
- Stripe Documentation: https://stripe.com/docs
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- OWASP Security Guidelines: https://owasp.org/

---

*Document Version: 1.0*
*Created: January 26, 2026*
*Status: Draft - Pending Review*
