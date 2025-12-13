# AutoLandlord - Implementation Roadmap

**Last Updated**: December 7, 2025  
**Current Progress**: 65% Complete (Infrastructure + Core Features)

---

## Quick Reference

### What's Working Right Now

✅ **Core Infrastructure** (Fully Operational)

- **Authentication**: Clerk integration with auto user sync
- **Database**: D1 with Drizzle ORM (13 tables migrated & seeded)
- **API**: Hono on Cloudflare Workers with OpenAPI
- **Storage**: R2 for file uploads
- **Cache**: KV for rate limiting and caching
- **Monitoring**: Health checks and request tracing

✅ **Core Functionality** (Production Ready)

- User authentication & authorization (Clerk + user sync middleware)
- Property management (Full CRUD with ownership checks)
- Tenant management (Full CRUD implementation)
- Maintenance ticket tracking (Complete system)
- File upload to R2 (Working endpoint)
- Rate limiting (KV-based with proper TTL)
- CORS configuration (Multi-origin support)
- Error handling (Global + boundaries)

### What Needs Attention

⚠️ **Partially Complete** (Tech Debt - 18 items remaining)

**Critical (P0) - 3 items**:

- Enhanced user sync with Clerk API fallback
- Database migration verification on startup
- Automated seed data in setup scripts

**High Priority (P1) - 5 items**:

- Clerk webhook handler for user.created
- Applications endpoint completion (findAllForLandlord)
- Landing page connection to real API data
- Input sanitization (XSS prevention)
- File upload security (type/size validation)

**Medium Priority (P2) - 3 items**:

- API pagination for all list endpoints
- Image optimization with Sharp
- Frontend validation with Zod + react-hook-form

⏳ **Not Started** (Business Features)

- PayPal subscription payments & enforcement
- Tenant self-service portal
- Super admin dashboard
- Document management system
- Automated rent collection

---

## Development Phases

### ✅ Phase 1-4: Foundation (COMPLETE)

**Time Invested**: ~25 hours  
**Status**: All infrastructure operational, dev servers running  
**Tech Stack**: Turborepo + Hono + Cloudflare Workers + Drizzle ORM

**Infrastructure Delivered**:

1. ✅ **Monorepo Setup**: Turborepo with 3 apps + shared package
2. ✅ **Database**: Cloudflare D1 with Drizzle ORM
   - 13 tables: users, properties, tenants, tickets, applications, plans, subscriptions, etc.
   - Migrations system configured
   - Seed data for subscription plans
3. ✅ **API Framework**: Hono with OpenAPI/Swagger
   - Type-safe routes with Zod validation
   - Global error handling
   - Request ID tracing
   - Rate limiting (KV-based)
   - CORS configured
4. ✅ **Authentication**: Clerk integration
   - User sync middleware (auto-creates DB records)
   - Token validation
   - Role-based access control
5. ✅ **Storage**: Cloudflare R2 for file uploads
6. ✅ **Frontend**:
   - Admin: React 19 + Vite + TailwindCSS
   - Landing: Next.js 16 + Turbopack
   - Glassmorphic UI design
   - Loading skeletons
   - Error boundaries

**Features Delivered**:

1. ✅ Property CRUD (full ownership checks)
2. ✅ Tenant CRUD (complete implementation)
3. ✅ Maintenance ticket system
4. ✅ File upload endpoint
5. ✅ Health monitoring
6. ✅ Environment validation

**Database Schema**: 13 tables fully migrated

- Core: users, properties, tenants, tickets, applications
- Subscription: plans (seeded), subscriptions
- Media: property_images, marketing_kits
- System: notifications

---

### ⏳ Phase 5: Tech Debt Resolution (CURRENT PHASE)

**Estimated Time**: 12-15 hours  
**Priority**: HIGH (production readiness)  
**Progress**: 5 of 23 items completed (22%)

**Scope**: Complete remaining tech debt items before adding new features

**Critical Items (P0) - Must complete first**:

1. [ ] Enhance user sync to call Clerk API for email/name
2. [ ] Add database migration check on startup
3. [ ] Automate seed data in setup scripts

**High Priority (P1) - Security & Core Features**: 4. [ ] Implement Clerk webhook handler 5. [ ] Complete applications endpoint 6. [ ] Connect landing page to real data 7. [ ] Add input sanitization (XSS prevention) 8. [ ] Secure file uploads (validation)

**See [TASK_LIST.md](../TASK_LIST.md) for complete breakdown**

---

### 🚧 Phase 6: Monetization (NEXT)

**Estimated Time**: 8-10 hours  
**Priority**: HIGH (enables revenue)

**Scope**:

1. **PayPal Subscription Integration**
   - Checkout flow for plan upgrades
   - Webhook handler for payment events
   - Subscription status management

2. **Feature Gating**
   - Property limit enforcement (2/10/unlimited)
   - Upgrade prompts when limit reached
   - Modal to select plan

3. **Billing Portal**
   - View current subscription details
   - Upgrade/downgrade options
   - Payment history

**Acceptance Criteria**:

- [ ] User can upgrade from Starter to Pro
- [ ] Property limit enforced (can't create beyond limit)
- [ ] PayPal webhooks update DB in real-time
- [ ] Cancellation downgrades user to Starter

**Technical Tasks**:

```typescript
// 1. Install PayPal SDK
npm install @paypal/react-paypal-js

// 2. Create checkout component
// src/components/paypal-checkout.tsx

// 3. Webhook handler
// src/app/api/webhooks/paypal/route.ts

// 4. Feature gate helper
// src/lib/check-limits.ts
export async function canCreateProperty(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const count = await prisma.property.count({ where: { landlordId: userId } });
  const limits = { STARTER: 2, PRO: 10, ENTERPRISE: Infinity };
  return count < limits[sub.planName];
}
```

---

### ⏳ Phase 7: Admin Dashboard (PLANNED)

**Estimated Time**: 6-8 hours  
**Priority**: MEDIUM

**Scope**:

1. User management interface
2. Revenue analytics
3. System health monitoring
4. Manual subscription adjustments
5. Support ticket internal tracking

**Routes**:

- `/admin` (dashboard overview)
- `/admin/users` (user list with filters)
- `/admin/subscriptions` (revenue report)
- `/admin/system` (logs & health checks)

**Access Control**:

```typescript
// middleware.ts
if (pathname.startsWith("/admin")) {
  const user = await getOrCreateUser();
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect("/dashboard");
  }
}
```

---

### ⏳ Phase 8: Tenant Portal (PLANNED)

**Estimated Time**: 12-15 hours  
**Priority**: HIGH (core value proposition)

**Scope**:

1. **Tenant Dashboard**
   - View lease details (start/end dates, rent amount)
   - Landlord contact information
   - Property details

2. **Maintenance Request System**
   - Create new tickets with image attachments
   - Track ticket status
   - View resolution history

3. **Document Access**
   - View lease agreement
   - Download receipts (future)

4. **Communication**
   - Message landlord directly (in-app chat)

**Routes**:

- `/tenant-portal` (dashboard)
- `/tenant-portal/tickets` (ticket list)
- `/tenant-portal/tickets/new` (create ticket)
- `/tenant-portal/lease` (lease details)

**Database Changes**:

- Add `Tenant.userId` foreign key (currently nullable)
- Add `Message` model for landlord-tenant communication

---

### ⏳ Phase 9: Document Management (PLANNED)

**Estimated Time**: 10-12 hours  
**Priority**: MEDIUM

**Scope**:

1. Upload lease agreements (PDF, DOCX)
2. E-signature integration (HelloSign)
3. Document expiration reminders
4. Template library for common docs

**Storage**:

- Cloudflare R2 (separate bucket or folder prefix)
- Server-side encryption

---

### ⏳ Phase 10: Rent Collection (PLANNED)

**Estimated Time**: 15-20 hours  
**Priority**: HIGH (recurring revenue opportunity)

**Scope**:

1. Connect bank accounts (Plaid integration)
2. Schedule automatic payments
3. ACH payment processing (Stripe)
4. Late fee automation
5. Payment history & receipt generation

**Revenue Model**:

- Platform fee: 2-3% of rent collected
- OR flat monthly fee per tenant

---

### ⏳ Phase 11: Analytics & Reporting (PLANNED)

**Estimated Time**: 8-10hours  
**Priority**: LOW (nice-to-have)

**Scope**:

1. Vacancy rate trends
2. Maintenance cost breakdown
3. Tenant turnover analysis
4. Rental income projections
5. Exportable reports (PDF, CSV)

**Charts**:

- Recharts library
- Export via jsPDF

---

## Current Sprint Focus

### Week 1: Tech Debt Resolution (IN PROGRESS)

**Goal**: Complete all P0 (Critical) items + Start P1 items  
**Progress**: 5 of 23 tasks completed (22%)

**Completed This Week** ✅:

1. ✅ Fixed rate limiter TTL issue (30 min)
2. ✅ Added environment variable validation (1 hour)
3. ✅ Fixed TypeScript `any` types (1 hour)
4. ✅ Applied loading skeletons consistently (1 hour)
5. ✅ Added request ID tracing (1 hour)

**This Week's Remaining Tasks**:

1. **P0-1: Enhance User Sync** (2-3 hours)
   - Call Clerk Users API if sessionClaims.email missing
   - Add proper error handling
   - Test with various Clerk configurations

2. **P0-2: Database Migration Check** (1-2 hours)
   - Add startup verification in health endpoint
   - Warn if critical tables missing
   - Return helpful error messages

3. **P0-3: Automate Seed Data** (2 hours)
   - Update setup.sh/setup.bat to run seed
   - Add validation in user-sync for plans
   - Create test data generator

4. **P1-5: Secure File Uploads** (2 hours)
   - Add file type whitelist
   - Enforce 10MB size limit
   - Add rate limiting on upload endpoint

5. **P1-4: Input Sanitization** (3-4 hours)
   - Install DOMPurify
   - Sanitize all user text inputs
   - Test XSS prevention

**Target**: Complete 5 more tasks (10 total = 43% progress)

---

## Success Metrics

### Platform Health

- **Uptime**: 99.9% (Cloudflare SLA)
- **Response Time**: < 200ms (p95)
- **Build Success Rate**: 100%

### Business Metrics (Post-Launch)

- **User Signups**: Track weekly growth
- **Conversion Rate**: Free → Paid (target:10%)
- **Churn Rate**: < 5% monthly
- **Average Properties/User**: Track engagement

### Technical Metrics

- **Test Coverage**: > 70% (future)
- **Lighthouse Score**: > 90
- **Zero Critical Bugs**: In production

---

## Risk Management

### Technical Risks

| Risk                      | Probability | Impact | Mitigation                                |
| ------------------------- | ----------- | ------ | ----------------------------------------- |
| D1 database limits (10GB) | Medium      | High   | Monitor usage, plan migration to Postgres |
| R2 bandwidth costs        | Low         | Medium | Implement CDN caching                     |
| PayPal webhook failures   | Medium      | High   | Retry logic + manual reconciliation tool  |
| Clerk rate limits         | Low         | Medium | Implement caching                         |

### Business Risks

| Risk                      | Probability | Impact | Mitigation                          |
| ------------------------- | ----------- | ------ | ----------------------------------- |
| Low user adoption         | Medium      | High   | Beta testing with real landlords    |
| Competitors               | High        | Medium | Focus on UX differentiation         |
| Payment processing issues | Low         | High   | Clear error messaging, support docs |

---

## Resource Requirements

### Infrastructure Costs (Monthly)

| Service          | Tier          | Cost                   |
| ---------------- | ------------- | ---------------------- |
| Clerk            | Pro           | $25 (up to 1000 users) |
| Cloudflare Pages | Free          | $0 (500 builds/month)  |
| Cloudflare D1    | Free          | $0 (< 10GB)            |
| Cloudflare R2    | Pay-as-you-go | ~$5-20                 |
| Resend           | Free          | $0 (100 emails/day)    |
| **Total**        |               | **~$30-45/month**      |

**Scaling Projections**:

- 100 users: ~$50/month
- 500 users: ~$100/month
- 1000 users: ~$200/month (Clerk upgrade)

---

## Next Steps

**For Product Owner**:

1. ✅ Review business flows documentation
2. ⬜ Prioritize Phase 5-10 features
3. ⬜ Set up PayPal Business account
4. ⬜ Define success metrics for beta launch

**For Development Team**:

1. ✅ Complete code linting & cleanup
2. ⬜ Implement PayPal checkout (Sprint 1)
3. ⬜ Build webhook handler (Sprint 1)
4. ⬜ Add feature gating (Sprint 1)
5. ⬜ User acceptance testing (Sprint 2)

**For Marketing/Sales**:

1. ⬜ Prepare beta user onboarding materials
2. ⬜ Create demo video
3. ⬜ Write help documentation
4. ⬜ Set up support email/chat

---

**Questions or Concerns?**  
Refer to `/docs/BUSINESS_FLOWS.md` for detailed technical specifications.
