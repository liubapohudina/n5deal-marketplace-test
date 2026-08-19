# N5Deal Marketplace

A full-stack M&A investment marketplace built with Next.js, TypeScript, Prisma, PostgreSQL, Better Auth, and Tailwind CSS.

The platform connects **Buyers**, **Sellers**, and **Managers** in a role-based marketplace where sellers can publish acquisition opportunities, buyers can discover and evaluate deals, both sides can initiate inquiries, and managers can moderate users and listings.

---

## Overview

N5Deal Marketplace models a simplified M&A deal discovery workflow.

The application supports three roles:

- **Buyer** — discovers investment opportunities and manages acquisition criteria.
- **Seller** — publishes businesses/assets and connects with potential buyers.
- **Manager** — monitors and moderates marketplace activity.

The main focus of the implementation was to build a functional end-to-end marketplace flow rather than only static UI screens.

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Next.js Server Components
- Server Actions
- Prisma ORM
- PostgreSQL

### Authentication

- Better Auth
- Email/password authentication
- Session-based authentication
- Role-based authorization

### Database

- PostgreSQL
- Prisma schema and generated client
- Decimal fields for financial values
- Relational models for users, assets, inquiries, and moderation history

---

## Main Features

### Authentication

The application supports real email/password authentication through Better Auth.

Implemented authentication flows include:

- Registration
- Login
- Logout
- Session handling
- Password validation
- Password changes
- Account settings
- Role-based redirects
- Protected routes

Public registration only allows:

```text
BUYER
SELLER
```

The `MANAGER` role cannot be selected during public registration.

This is intentional to prevent privilege escalation through the registration form.

---

## Roles and Permissions

### Buyer

Buyers can:

- Access the Buyer Dashboard
- Configure their investment profile
- Define investment thesis
- Define target industries
- Define preferred geographies
- Define minimum and maximum deal size
- Browse published opportunities
- Search marketplace opportunities
- Filter opportunities
- View personalized opportunity matches
- See deterministic match scores based on investment criteria
- See why each opportunity matches the Buyer profile
- View individual opportunities
- Send inquiries to sellers
- Receive inquiries from sellers
- Accept or decline incoming inquiries
- Review sent and received inquiries
- Access the shared Messages view
- Update account information
- Change their password
- View personalized opportunity matches
- See deterministic match scores based on investment criteria
- See why each opportunity matches the Buyer profile

Main routes:

```text
/buyer
/buyer/profile
/buyer/inquiries
/opportunities
/opportunities/[id]
/matches
/messages
/settings/account
/settings/security
```

---

### Seller

Sellers can:

- Access the Seller Dashboard
- Create assets/listings
- Save draft listings
- Publish listings
- Edit their own listings
- View their listings
- Browse buyer profiles
- View individual buyer profiles
- Contact buyers
- Receive buyer inquiries
- Accept or decline incoming inquiries
- Review sent and received inquiries
- Access the shared Messages view
- Update account information
- Change their password

Main routes:

```text
/seller
/seller/assets
/seller/assets/new
/seller/assets/[id]
/seller/assets/[id]/edit
/seller/inquiries
/buyers
/buyers/[id]
/messages
/settings/account
/settings/security
```

---

### Manager

Managers have access to platform administration and moderation tools.

Managers can:

- Access the Manager Dashboard
- Review marketplace statistics
- Browse users
- Search/filter users
- Inspect individual users
- Suspend users
- Restore suspended users
- Browse marketplace assets
- Search/filter assets
- Inspect individual assets
- Suspend listings
- Restore listings
- Review moderation history
- View recent moderation activity

Main routes:

```text
/manager
/manager/users
/manager/users/[id]
/manager/assets
/manager/assets/[id]
/manager/moderation
```

Manager functionality is protected server-side and is not available to Buyers or Sellers.

---

## Role-Based Routing

After authentication, users are redirected to the appropriate workspace.

```text
BUYER   → /buyer
SELLER  → /seller
MANAGER → /manager
```

Authorization is enforced server-side rather than relying only on hidden UI elements.

The application uses centralized helpers similar to:

```ts
getCurrentUser();
requireUser();
requireRole();
```

`getCurrentUser()` resolves the Better Auth session to the corresponding Prisma user.

`requireUser()` requires an authenticated and active account.

`requireRole()` additionally verifies that the user has permission to access the requested role-specific route.

---

## Suspended Accounts

User suspension is enforced as an authorization rule rather than only being displayed as a status in the Manager UI.

When a user's status becomes:

```text
SUSPENDED
```

protected application routes redirect that user to:

```text
/account-suspended
```

The authorization flow is approximately:

```text
Request
   │
   ▼
Authenticated?
   │
   ├── No ───────────→ /login
   │
   ▼
Account ACTIVE?
   │
   ├── No ───────────→ /account-suspended
   │
   ▼
Correct role?
   │
   ├── No ───────────→ user's dashboard
   │
   ▼
Allow request
```

This means suspending a user has an actual effect on application access.

---

## Marketplace

The marketplace is available at:

```text
/opportunities
```

Buyers can discover published acquisition opportunities and filter them using marketplace criteria such as:

- Search text
- Industry
- Location
- Price range

Individual opportunities are available at:

```text
/opportunities/[id]
```

Only marketplace-visible assets are exposed publicly.

---

## Asset Visibility

Assets support the following statuses:

```text
DRAFT
PUBLISHED
SUSPENDED
```

Marketplace queries only expose:

```text
status = PUBLISHED
```

A suspended asset therefore disappears from the marketplace.

Direct access to an unavailable asset is also protected so that knowing an asset ID does not bypass marketplace visibility rules.

Marketplace visibility additionally considers the Seller's status.

Conceptually:

```text
Seller ACTIVE
Asset PUBLISHED
      ↓
Visible

Seller SUSPENDED
Asset PUBLISHED
      ↓
Hidden

Seller ACTIVE
Asset SUSPENDED
      ↓
Hidden
```

This prevents listings owned by suspended accounts from remaining publicly discoverable.

---

## Buyer Profiles

Buyer-specific acquisition preferences are stored separately in `BuyerProfile`.

The profile contains information such as:

```text
Investment thesis
Minimum deal size
Maximum deal size
Industries
Geographies
Investment types
Preferred deal types
```

This separation keeps authentication/account data on `User` while storing buyer-specific marketplace information in `BuyerProfile`.

---

## Seller Assets

Sellers can create acquisition opportunities represented by the `Asset` model.

An asset can contain:

```text
Title
Description
Asset type
Industry
Location
Asking price
Revenue
EBITDA
Employees
Founded year
Deal types
Investment highlights
AI match score
Status
Publication date
```

Financial fields are stored using database decimal types rather than JavaScript floating-point values.

---

## Inquiry / Contact Flow

Buyer/Seller interaction is implemented through `ContactRequest`.

A contact request contains:

```text
sender
recipient
optional asset
message
status
timestamps
```

Supported statuses are:

```text
PENDING
ACCEPTED
DECLINED
```

The model intentionally supports communication in both directions.

### Buyer → Seller

A Buyer can open an opportunity and contact the Seller.

The Seller receives the request in:

```text
/seller/inquiries
```

### Seller → Buyer

A Seller can browse:

```text
/buyers
```

open:

```text
/buyers/[id]
```

and contact a Buyer.

The Buyer receives the request in:

```text
/buyer/inquiries
```

### Incoming vs Outgoing

Inquiry pages distinguish between:

```text
Received
Sent
```

Incoming pending inquiries require an action from the current user.

Outgoing pending inquiries indicate that the current user is waiting for the other party.

This distinction prevents the sender from accepting or declining their own request.

---

## Messages

The shared message center is available at:

```text
/messages
```

It provides a unified overview of marketplace communication.

Users can view:

- All conversations
- Received requests
- Sent requests
- Pending requests
- Accepted requests
- Declined requests

Search/filter functionality allows users to find communication by message, company, participant, or related opportunity.

The role-specific inquiry pages remain available for workflows requiring Accept/Decline actions.

---

## Moderation

Managers can moderate marketplace participants.

User moderation supports:

```text
SUSPEND
UNSUSPEND
```

Every moderation operation creates a `ModerationAction`.

The moderation record stores:

```text
Manager
Moderated user
Action
Reason
Timestamp
```

This creates an audit trail rather than simply overwriting the user's current status.

---

## Moderation History

The complete moderation log is available at:

```text
/manager/moderation
```

Managers can review previous actions and identify:

- who was moderated
- what action was performed
- who performed it
- why it was performed
- when it happened

The Manager Dashboard also displays recent moderation activity for quick visibility.

---

## Asset Moderation

Managers can inspect marketplace assets through:

```text
/manager/assets
/manager/assets/[id]
```

The detail page provides information such as:

- asset status
- asset type
- financial metrics
- seller information
- description
- investment highlights
- deal types
- inquiry statistics
- metadata

Managers can suspend inappropriate listings and restore them later.

Suspended listings are removed from marketplace discovery.

---

## Account Settings

Authenticated users can manage account information at:

```text
/settings/account
```

Users can update supported profile information such as their name and other account/profile fields.

Security-related settings are separated into:

```text
/settings/security
```

---

## Password Security

Passwords are handled through Better Auth rather than being manually stored or transformed by UI code.

The application does not store plaintext passwords.

Password validation is applied during registration and password changes.

Registration requires passwords to meet minimum complexity requirements, including:

- minimum length
- uppercase character
- lowercase character
- numeric character

Sensitive password operations are handled through the authentication layer.

---

## Database Architecture

The main Prisma models are:

```text
User
BuyerProfile
Asset
ContactRequest
ModerationAction
Session
Account
Verification
```

### Relationships

A simplified relationship overview:

```text
User
 ├── BuyerProfile
 ├── Assets
 ├── Sent ContactRequests
 ├── Received ContactRequests
 ├── Sessions
 ├── Accounts
 ├── Manager ModerationActions
 └── ModerationActions received

Asset
 ├── Seller
 └── ContactRequests

ContactRequest
 ├── Sender
 ├── Recipient
 └── Asset (optional)

ModerationAction
 ├── Manager
 └── Moderated User
```

---

## Project Structure

A simplified overview:

```text
app/
├── actions/
├── matches/
│
├── api/
│   ├── auth/
│   └── health/
│
├── account-suspended/
│
├── buyer/
│   ├── inquiries/
│   └── profile/
│
├── buyers/
│   └── [id]/
│
├── login/
├── register/
│
├── manager/
│   ├── assets/
│   │   └── [id]/
│   ├── moderation/
│   └── users/
│       └── [id]/
│
├── messages/
│
├── opportunities/
│   └── [id]/
│
├── seller/
│   ├── assets/
│   │   ├── new/
│   │   └── [id]/
│   │       └── edit/
│   └── inquiries/
│
└── settings/
    ├── account/
    └── security/

components/
├── auth/
├── buyer/
├── dashboard/
├── manager/
└── seller/

lib/
├── auth.ts
├── auth-client.ts
├── currentUser.ts
└── prisma.ts

prisma/
└── schema.prisma
```

The exact component structure may evolve, but the application is organized primarily around role-specific workflows.

---

# Local Setup

## Requirements

Recommended environment:

```text
Node.js 20+
npm
PostgreSQL database
```

The project was developed and production-built successfully using Node.js 20.

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd n5deal-marketplace
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Environment variables

Create:

```text
.env
```

Configure the variables required by the application.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"

BETTER_AUTH_SECRET="replace-with-a-secure-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

Do not commit real credentials or production secrets.

For production, configure these values through the hosting provider's environment variable settings.

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

The Prisma client is generated from:

```text
prisma/schema.prisma
```

---

## 5. Apply database schema

Depending on the environment/workflow:

```bash
npx prisma migrate dev
```

or, when using schema synchronization during development:

```bash
npx prisma db push
```

For production deployments, migrations should be preferred.

---

## 6. Seed demo data

If the repository includes the seed configuration:

```bash
npx prisma db seed
```

This can be used to populate development/demo accounts and marketplace records.

---

## 7. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Production Build

Before deployment, run:

```bash
npm run build
```

A successful production build should complete:

```text
Compilation
TypeScript validation
Page data collection
Static generation
Page optimization
```

The project has been verified against the Next.js production build process.

To run the production server locally:

```bash
npm run start
```

after building.

---

# Demo Accounts

Demo credentials depend on the local seed configuration.

For the submitted project, document the actual seeded credentials here before delivery:

```text
Buyer
Email: buyer@n5deal.demo
Password: N5DealDemo123!

Seller
Email: seller@n5deal.demo
Password: N5DealDemo123!

Manager
Email: manager@n5deal.demo
Password: N5DealDemo123!
```

> Important: demo passwords should only be credentials created specifically for the test/demo environment. Never publish production credentials.

A reviewer should be able to test the complete role flow by opening separate browser sessions for Buyer, Seller, and Manager.

---

# Suggested Demo Flow

A useful end-to-end test is:

### Buyer

```text
Login as Buyer
    ↓
Open /opportunities
    ↓
Search/filter opportunities
    ↓
Open an opportunity
    ↓
Send inquiry to Seller
```

### Seller

```text
Login as Seller
    ↓
Open /seller/inquiries
    ↓
See Buyer inquiry
    ↓
Accept or decline request
```

The reverse interaction can also be tested:

```text
Seller
    ↓
/buyers
    ↓
Buyer profile
    ↓
Contact Buyer
    ↓
Buyer sees request in /buyer/inquiries
```

### Manager

```text
Login as Manager
    ↓
/manager/users
    ↓
Open Seller
    ↓
Suspend account
    ↓
Seller attempts protected action
    ↓
/account-suspended
```

Asset moderation can similarly be tested through:

```text
/manager/assets
```

A suspended asset should disappear from the public marketplace.

---

# Security Considerations

Several security decisions were intentionally made in the implementation.

### Server-side authorization

Role permissions are checked on the server.

UI visibility is not treated as an authorization mechanism.

### Registration role restrictions

Public registration only accepts:

```text
BUYER
SELLER
```

The client cannot legitimately self-register as a Manager.

Role assignment should always be validated server-side.

### Suspended accounts

Suspension is checked during protected route authorization.

A suspended account cannot regain access simply by manually entering a protected URL.

### Marketplace visibility

Suspended assets are excluded from public marketplace queries.

Assets belonging to suspended sellers should also be excluded.

### Password handling

Password handling is delegated to Better Auth rather than implementing custom password storage.

### Database access

Database operations are performed server-side through Prisma.

The Prisma client and database credentials are never exposed to the browser.

---

# Assumptions

The implementation makes several assumptions to keep the project focused on the requested marketplace workflow.

### 1. One primary role per account

A user has one role:

```text
BUYER
SELLER
MANAGER
```

Multi-role accounts are outside the current scope.

### 2. Manager accounts are provisioned internally

Managers are not available through public registration.

This reflects the privileged nature of the role.

### 3. ContactRequest represents the initial connection workflow

The current data model treats `ContactRequest` as the primary Buyer/Seller interaction object.

It is sufficient for:

```text
send request
receive request
accept request
decline request
```

It is not intended to be a complete real-time chat system.

### 4. Assets are marketplace opportunities

An `Asset` represents an acquisition/investment opportunity published by a Seller.

### 5. AI match score is stored

`aiMatchScore` currently exists as a stored value.

A production version could calculate this dynamically from BuyerProfile criteria and Asset characteristics.

### 6. Financial values use EUR formatting

The current UI primarily formats marketplace financial values in EUR.

A production global marketplace would likely support per-asset currencies.

### 7. Moderation is intentionally simple

The current moderation model records user suspension/restoration actions.

A larger platform could introduce additional moderation action types and dedicated asset moderation history.

---

# AI-Assisted Development

AI tools were used during development as an engineering assistant.

The AI-assisted workflow included help with:

- component scaffolding
- TypeScript implementation
- Prisma query construction
- role-based authorization design
- form validation
- debugging
- marketplace filtering logic
- UI iteration
- edge-case identification
- code review
- production build troubleshooting
- README/documentation drafting

AI-generated suggestions were reviewed and adapted to the project's actual Prisma schema, application architecture, and runtime behavior.

AI was used to accelerate implementation rather than replace validation.

The project was still verified through:

```text
runtime testing
role-based flow testing
database inspection
TypeScript checks
production builds
```

This was particularly important because generated code can make assumptions that do not match the current schema or application state.

---

# What I Would Improve With More Time

Given additional development time, I would focus on the following areas.

### Automated testing

Add:

- unit tests
- integration tests
- authorization tests
- Server Action tests
- Playwright end-to-end tests

Critical E2E scenarios would include:

```text
Buyer → Seller inquiry
Seller → Buyer inquiry
Accept/Decline permissions
Suspended user access
Suspended asset visibility
Role escalation attempts
```

### Real conversation system

The current inquiry model is suitable for connection requests but not full messaging.

I would introduce:

```text
Conversation
ConversationParticipant
Message
ReadReceipt
```

This would allow accepted inquiries to become real message threads.

### Notifications

Implement persisted notifications for:

- new inquiries
- accepted inquiries
- declined inquiries
- moderation actions
- listing status changes

Potential additions:

```text
unread counts
notification center
email notifications
```

### Advanced AI matching

The current implementation includes deterministic opportunity matching based on Buyer investment criteria.

With more time, I would extend this into a richer recommendation system using:

- weighted and configurable criteria
- semantic similarity between investment thesis and asset description
- financial metric normalization
- Buyer interaction history
- saved/viewed opportunities
- explainable AI-generated match reasoning
- ranking feedback

The deterministic scoring system would remain as a transparent baseline and could be combined with semantic ranking rather than completely replaced.

### Pagination

Large marketplace lists should use pagination or cursor-based loading rather than returning large result sets.

This would apply to:

```text
/opportunities
/buyers
/messages
/manager/users
/manager/assets
/manager/moderation
```

### Better search

For a larger dataset I would move beyond simple database `contains` queries.

Potential options include:

```text
PostgreSQL full-text search
pg_trgm
dedicated search service
```

### More granular moderation

Expand moderation to support:

```text
warnings
temporary suspensions
moderation notes
asset-specific audit history
moderation categories
appeals
```

### File uploads

Seller listings could support:

```text
company logos
teasers
financial documents
data-room documents
```

Uploads would use signed storage URLs rather than storing binary files directly in PostgreSQL.

### Email verification and recovery flows

Production authentication should include complete:

```text
email verification
forgot password
password reset
security notifications
```

flows.

### Rate limiting

Add rate limits around:

```text
login attempts
registration
contact requests
password changes
search
sensitive Server Actions
```

### Database transactions

Multi-step business operations could use Prisma transactions where atomicity is important.

### Observability

For production I would add:

```text
structured logging
error monitoring
performance monitoring
audit events
health monitoring
```

### Accessibility

Perform a dedicated accessibility pass covering:

```text
keyboard navigation
focus states
ARIA labels
form errors
contrast
screen readers
```

### Responsive QA

The UI is responsive, but I would perform additional device-specific QA across mobile, tablet, and desktop breakpoints.

---

# Production Considerations

Before deploying a production version I would verify:

- production database migrations
- secure environment variables
- HTTPS
- secure Better Auth configuration
- production auth URL
- database SSL verification
- rate limiting
- email verification
- password recovery
- monitoring
- automated backups
- error tracking

---

# Health Check

The application exposes:

```text
/api/health
```

This can be used by hosting infrastructure to verify that the application is running.

---

# Development Checklist

Before submitting or deploying:

```bash
npm install
npx prisma generate
npm run build
```

Then manually verify:

```text
Buyer registration/login
Seller registration/login
Manager login

Buyer marketplace search
Buyer profile
Seller asset management

Buyer → Seller inquiry
Seller → Buyer inquiry
Accept/Decline flow
Buyer personalized matches
Match score calculation
Buyer-only /matches protection

Manager user moderation
Manager asset moderation
Moderation history

Suspended user protection
Suspended asset marketplace visibility

Account settings
Password change
Logout
```

---

# Current Routes

```text
/

/account-suspended

/api/auth/[...all]
/api/health

/login
/register

/buyer
/buyer/profile
/buyer/inquiries

/buyers
/buyers/[id]

/seller
/seller/assets
/seller/assets/new
/seller/assets/[id]
/seller/assets/[id]/edit
/seller/inquiries

/opportunities
/opportunities/[id]

/messages

/manager
/manager/users
/manager/users/[id]
/manager/assets
/manager/assets/[id]
/manager/moderation

/settings/account
/settings/security
```

---

# Final Notes

The project prioritizes a complete marketplace workflow over isolated static screens.

The core implemented flow is:

```text
Authentication
      ↓
Role-based workspace
      ↓
Marketplace discovery
      ↓
Buyer / Seller interaction
      ↓
Inquiry management
      ↓
Manager moderation
      ↓
Server-side permission enforcement
```

The architecture is intentionally kept straightforward so that the system can be extended with real-time messaging, advanced matching, notifications, richer moderation, and production infrastructure without replacing the core domain model.
