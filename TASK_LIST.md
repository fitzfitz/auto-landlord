# Auto Landlord - Development Task List

**Last Updated**: December 10, 2025  
**Status**: Phase 5 Complete! All P1 Tasks Done! 🎉  
**Current Phase**: 65% complete (15/23) → **ALL P0 & P1 COMPLETE!** 🚀  
**Reference**: See [docs/ROADMAP.md](docs/ROADMAP.md) for phase details

---

## 📊 Progress Overview

| Priority      | Total  | Completed | Remaining |
| ------------- | ------ | --------- | --------- |
| P0 (Critical) | 5      | **5** ✅  | **0**     |
| P1 (High)     | 5      | **5** ✅  | **0**     |
| P2 (Medium)   | 6      | 5         | 1         |
| P3 (Low)      | 7      | 0         | 7         |
| **TOTAL**     | **23** | **15**    | **8**     |

---

## 🔴 P0: Critical Priority - ✅ ALL COMPLETE!

All critical blocking issues have been resolved! 🎉

### Authentication & User Management

- [x] **P0-1: User Sync with Database** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Added placeholder email fallback, made subscription optional
  - **Files**: `apps/auto-landlord-api/src/middleware/auth.ts`, `apps/auto-landlord-api/src/lib/user-sync.ts`
  - **Impact**: Users always created successfully, no failures

- [x] **P0-2: 401 Handling & Token Refresh** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Automatic token refresh on 401, queue mechanism for concurrent requests
  - **Files**: `apps/auto-landlord-admin/src/lib/api.ts`, `apps/auto-landlord-admin/src/providers/AuthProvider.tsx`
  - **Impact**: No more auth errors, seamless experience

### Infrastructure & Reliability

- [x] **P0-3: Database Migration & Seeding** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Applied migrations, loaded seed data successfully
  - **Command**: `npx wrangler d1 migrations apply auto-landlord-db --local`
  - **Impact**: Database fully operational with all tables

- [x] **P0-4: Environment Variable Validation** ✅
  - **Completed**: Dec 7, 2025
  - **Files**: `apps/auto-landlord-admin/src/main.tsx`, `apps/auto-landlord-api/src/middleware/env-validation.ts`
  - **Impact**: Clear startup errors with setup instructions

### Build & Test Issues

- [x] **P0-5: TypeScript Compilation Errors** ✅
  - **Completed**: Dec 10, 2025
  - **Fixed**: ZodError API (v3 → v4), rate limiter test
  - **Files**: `apps/auto-landlord-api/src/middleware/error-handler.ts`, `rate-limit.test.ts`
  - **Impact**: All packages compile cleanly, all tests passing (13/13)

---

## 🟠 P1: High Priority (Core Features & Security)

These items fix broken features and security vulnerabilities.

### Feature Completion

- [ ] **P1-1: Implement Clerk Webhook Handler**
  - **Issue**: Users created on first API call instead of signup
  - **Impact**: Race conditions possible (though middleware sync works well)
  - **Solution**: Implement webhook endpoint for `user.created` event
  - **File**: Create `apps/auto-landlord-api/src/routes/webhooks.ts`
  - **Estimated Time**: 3-4 hours
  - **Status**: Optional - current middleware approach is working
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#5-no-clerk-webhook-handler)

- [x] **P1-2: Complete Applications Endpoint** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Implemented full join query with property details
  - **File**: `apps/auto-landlord-api/src/features/applications/applications.service.ts`
  - **Impact**: Landlords can now view all rental applications

- [x] **P1-6: Property Images Upload & Display** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Full image pipeline - upload to R2, store in DB, display in UI
  - **Files**: `upload/index.ts`, `properties.service.ts`, frontend components
  - **Impact**: Properties now have image galleries

- [x] **P1-3: Connect Landing Page to Real Data** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Full public API integration - listings page, individual property pages, image display
  - **Files**:
    - `apps/auto-landlord-landing/src/lib/api.ts` - API client (NEW)
    - `apps/auto-landlord-landing/src/app/listings/page.tsx` - Connected to real data
    - `apps/auto-landlord-landing/src/app/listings/[slug]/page.tsx` - Property details page (NEW)
    - `apps/auto-landlord-api/src/features/properties/index.ts` - Public endpoints (NEW)
    - `apps/auto-landlord-api/src/features/properties/properties.service.ts` - Public methods
  - **Features**: Public property listings, individual property pages, image display, SEO-friendly slugs
  - **Impact**: Public-facing listings now work, SEO enabled, real data displayed

### Security

- [x] **P1-4: Add Input Sanitization (XSS Prevention)** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Comprehensive XSS protection with `isomorphic-dompurify` - plain text, rich text, and URL sanitization
  - **Files**:
    - `apps/auto-landlord-admin/src/lib/sanitize.ts` - Sanitization utilities (NEW)
    - `apps/auto-landlord-admin/src/lib/sanitize.test.ts` - 35 tests (NEW)
    - `apps/auto-landlord-admin/src/features/properties/PropertySidebar.tsx` - Applied to addresses, descriptions, amenities
    - `apps/auto-landlord-admin/src/features/properties/index.tsx` - Applied to property cards
    - `apps/auto-landlord-admin/src/features/tickets/index.tsx` - Applied to ticket titles
    - `apps/auto-landlord-admin/src/features/tenants/index.tsx` - Applied to tenant names, emails
  - **Tests**: 35 new tests - all passing
  - **Impact**: Complete XSS protection, safe rendering of user content

- [x] **P1-5: Secure File Upload Endpoint** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Comprehensive validation - file type (images only), size (1.5MB max), extension checking, filename sanitization
  - **Files**:
    - `apps/auto-landlord-api/src/features/upload/index.ts` - Backend validation
    - `apps/auto-landlord-admin/src/components/ImageUploader.tsx` - Frontend validation
    - `apps/auto-landlord-admin/src/features/properties/usePropertyMutations.ts` - Error handling
  - **Tests**: 7 new tests added (`upload.test.ts`) - all passing
  - **Impact**: Protected against abuse, controlled costs, better UX

---

## 🟡 P2: Medium Priority (UX & Scalability)

These items improve user experience and prepare for scale.

### Code Quality

- [x] **P2-1: Fix TypeScript `any` Types** ✅
  - **Completed**: Dec 7, 2025
  - **Solution**: Replaced with proper `LucideIcon` type
  - **Impact**: Full type safety restored

- [x] **P2-5: Slug Generation** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Automatic SEO-friendly slug generation with uniqueness check
  - **File**: `apps/auto-landlord-api/src/features/properties/properties.service.ts`
  - **Impact**: All properties now have proper slugs for URLs

- [x] **P2-8: Logout Functionality** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Clerk signOut integration with state cleanup
  - **Files**: `AuthProvider.tsx`, `Sidebar.tsx`
  - **Impact**: Professional logout flow

- [x] **P2-9: Query Performance (Images)** ✅
  - **Completed**: Dec 10, 2025
  - **Solution**: Optimized image loading with batch queries
  - **File**: `apps/auto-landlord-api/src/features/properties/properties.service.ts`
  - **Impact**: Efficient property list loading

### Performance & Scalability

- [ ] **P2-2: Implement Pagination**
  - **Issue**: All list endpoints return all records
  - **Impact**: Performance issues at scale
  - **Solution**: Add cursor-based pagination (page, limit, cursor)
  - **Files**: All list endpoints in `apps/auto-landlord-api/src/features/**/index.ts`
  - **Estimated Time**: 4-5 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#11-no-pagination)

- [ ] **P2-3: Add Image Optimization**
  - **Issue**: Images uploaded as-is, no compression
  - **Impact**: Bandwidth costs, slow loading
  - **Solution**: Use Sharp to resize and compress before R2 upload
  - **File**: `apps/auto-landlord-api/src/features/upload/index.ts`
  - **Estimated Time**: 3 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#12-no-image-optimization)

### User Experience

- [x] **P2-4: Apply Loading Skeletons Consistently**
  - **Issue**: Properties and Tickets pages use generic "Loading..." text
  - **Impact**: Inconsistent UX (Dashboard has skeletons, others don't)
  - **Solution**: Use `LoadingSkeleton` component throughout
  - **Files**:
    - `apps/auto-landlord-admin/src/features/properties/index.tsx`
    - `apps/auto-landlord-admin/src/features/tickets/index.tsx`
  - **Estimated Time**: 1 hour
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#13-basic-loading-states)

- [ ] **P2-5: Add Optimistic Updates**
  - **Issue**: Mutations feel slow (wait for server response)
  - **Impact**: Perceived performance issues
  - **Solution**: Implement React Query optimistic updates for create/update/delete
  - **Files**: All mutation hooks in `apps/auto-landlord-admin/src/features/`
  - **Estimated Time**: 4-5 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#14-no-optimistic-updates)

- [ ] **P2-6: Add Frontend Validation**
  - **Issue**: Only backend validation exists
  - **Impact**: Poor UX, unnecessary API calls
  - **Solution**: Use Zod schemas from shared package with react-hook-form
  - **Files**: All form components in `apps/auto-landlord-admin/src/features/`
  - **Estimated Time**: 3-4 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#15-no-data-validation-on-frontend)

### Debugging

- [x] **P2-7: Add Request ID Tracing**
  - **Issue**: Can't trace requests across logs
  - **Impact**: Difficult debugging in production
  - **Solution**: Add middleware to generate and attach X-Request-ID header
  - **File**: `apps/auto-landlord-api/src/middleware/` (new file)
  - **Estimated Time**: 1 hour
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#16-missing-request-id-tracing)

---

## 🟢 P3: Low Priority (Future Improvements)

These items are nice-to-have improvements for production readiness.

### Database Optimization

- [ ] **P3-1: Add Database Indexes**
  - **Issue**: Queries may be slow at scale
  - **Solution**: Add indexes on foreign keys and frequently queried fields
  - **File**: `packages/shared/src/db/schema.ts`
  - **Estimated Time**: 2 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#17-no-database-indexes)

### Observability

- [ ] **P3-2: Replace console.log with Structured Logging**
  - **Issue**: No structured logs, no log levels
  - **Solution**: Use structured logger (pino, winston)
  - **Files**: Throughout API codebase
  - **Estimated Time**: 3-4 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#18-consolelog-for-logging)

- [ ] **P3-3: Add Error Monitoring**
  - **Issue**: Can't see production errors or metrics
  - **Solution**: Integrate Sentry or similar service
  - **Files**: Both admin and API apps
  - **Estimated Time**: 3-4 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#19-no-monitoring)

### DevOps

- [ ] **P3-4: Create CI/CD Pipeline**
  - **Issue**: Manual deployments, no automated testing
  - **Solution**: Create GitHub Actions workflow for lint/typecheck/test/deploy
  - **File**: Create `.github/workflows/ci.yml`
  - **Estimated Time**: 4-5 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#20-no-cicd-pipeline)

### Data Safety

- [ ] **P3-5: Implement Soft Deletes**
  - **Issue**: Permanent data loss on delete
  - **Solution**: Add `deletedAt` timestamp to all tables
  - **Files**: Schema and all delete operations
  - **Estimated Time**: 4-5 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#21-no-soft-deletes)

- [ ] **P3-6: Add Audit Trail**
  - **Issue**: Can't track who changed what
  - **Solution**: Create audit_logs table and track all mutations
  - **Files**: Create new feature, add to all mutations
  - **Estimated Time**: 6-8 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#22-no-audit-trail)

### Schema Consistency

- [ ] **P3-7: Resolve Clerk ID vs UUID Mismatch**
  - **Issue**: Schema generates UUIDs but using Clerk IDs as primary key
  - **Solution**: Either remove UUID generation or create separate clerkId field
  - **File**: `packages/shared/src/db/schema.ts` (users table)
  - **Estimated Time**: 2 hours
  - **Reference**: [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md#23-clerk-id-vs-uuid-mismatch)

---

## 📅 Recommended Sprint Planning

### Sprint 1: Critical Fixes (Week 1)

**Goal**: Make app production-ready

- [ ] P0-1: Enhance User Sync
- [ ] P0-2: Database Migration Check
- [ ] P0-3: Automate Seed Data
- [ ] P0-4: Environment Validation
- [ ] P0-5: Fix Rate Limiter TTL

### Sprint 2: Core Features (Week 2)

**Goal**: Complete missing features and security

- [ ] P1-1: Clerk Webhook Handler
- [ ] P1-2: Applications Endpoint
- [ ] P1-3: Landing Page Real Data
- [ ] P1-4: Input Sanitization
- [ ] P1-5: Secure File Uploads

### Sprint 3: Polish & UX (Week 3)

**Goal**: Improve user experience

- [ ] P2-1: Fix TypeScript Types
- [ ] P2-4: Loading Skeletons
- [ ] P2-6: Frontend Validation
- [ ] P2-7: Request Tracing

### Sprint 4: Scalability (Week 4)

**Goal**: Prepare for growth

- [ ] P2-2: Pagination
- [ ] P2-3: Image Optimization
- [ ] P2-5: Optimistic Updates

### Sprint 5+: Production Hardening (Later)

**Goal**: Production operations

- [ ] All P3 items as needed

---

## 🎯 Quick Wins (Easy Wins to Build Momentum)

These tasks are relatively simple and can be completed quickly:

1. ✅ **P0-5**: Fix Rate Limiter TTL (30 min) - Just change one number
2. ✅ **P0-4**: Environment Validation (1 hour) - Simple checks
3. ✅ **P2-1**: Fix TypeScript Types (1 hour) - Import and replace
4. ✅ **P2-4**: Loading Skeletons (1 hour) - Copy existing component
5. ✅ **P2-7**: Request ID Tracing (1 hour) - Simple middleware

---

## 🔄 Business Flow Alignment

These tasks directly support the core business flows documented in [docs/BUSINESS_FLOWS.md](docs/BUSINESS_FLOWS.md):

### Flow 1: Landlord Onboarding & First Property Setup

**Status**: ✅ Fully Working - 100% Complete (Full CRUD Implemented)

| Flow Step                   | Status      | Related Tasks                  |
| --------------------------- | ----------- | ------------------------------ |
| 1. Visit landing page       | ✅ Working  | -                              |
| 2. Sign up via Clerk        | ✅ Working  | P0-1 (enhance), P1-1 (webhook) |
| 3. Auto-create DB user      | ✅ Working  | P0-1 (Clerk API fallback)      |
| 4. Redirect to dashboard    | ✅ Working  | -                              |
| 5. View empty state         | ✅ Working  | -                              |
| 6. Create first property    | ✅ Complete | Full form with image upload ✅ |
| 7. Property appears in list | ✅ Working  | -                              |
| 8. Click to view details    | ✅ Complete | Sidebar with all info ✅       |
| 9. Edit property            | ✅ Complete | Pre-filled form ✅             |
| 10. Delete property         | ✅ Complete | With confirmation ✅           |

**Blockers**: None - flow is 100% functional  
**Improvements Needed**: P0-1 (better user sync), P1-5 (upload validation)

---

### Flow 2: Tenant Management

**Status**: ⚠️ Partially Working (backend done, needs improvements)

| Feature            | Status      | Related Tasks              |
| ------------------ | ----------- | -------------------------- |
| View all tenants   | ✅ API Done | P2-4 (loading states) ✅   |
| Invite new tenant  | ⚠️ UI only  | Need backend invitation    |
| Assign to property | ✅ Working  | -                          |
| Track lease dates  | ✅ Working  | -                          |
| Update tenant info | ✅ API Done | P2-6 (frontend validation) |

**Blockers**: Tenant invitation email system not implemented  
**Improvements Needed**: Frontend validation, email integration

---

### Flow 3: Maintenance Ticket System

**Status**: ✅ Fully Working

| Feature          | Status      | Related Tasks                          |
| ---------------- | ----------- | -------------------------------------- |
| Create ticket    | ✅ Working  | P1-4 (sanitization), P2-6 (validation) |
| View all tickets | ✅ Working  | P2-4 (loading states) ✅               |
| Update status    | ✅ API Done | P2-5 (optimistic updates)              |
| Filter by status | ⏳ Not Done | P2-2 (pagination)                      |

**Blockers**: None - flow is functional  
**Improvements Needed**: Security & UX enhancements

---

### Flow 4: Application Processing

**Status**: ⚠️ Backend Incomplete

| Feature                    | Status                 | Related Tasks       |
| -------------------------- | ---------------------- | ------------------- |
| Public submit application  | ✅ Working             | P1-4 (sanitization) |
| Landlord view applications | ❌ Returns []          | **P1-2 (BLOCKER)**  |
| Approve/reject             | ⚠️ Status update works | P1-2 prerequisite   |

**Blockers**: P1-2 must be completed - applications endpoint stub  
**Critical**: This is a core business feature

---

### Flow 5: Public Property Listings

**Status**: ❌ Not Implemented

| Feature                  | Status          | Related Tasks      |
| ------------------------ | --------------- | ------------------ |
| View listings on landing | ❌ Fake data    | **P1-3 (BLOCKER)** |
| SEO-friendly URLs        | ✅ Schema ready | P1-3 prerequisite  |
| Filter/search listings   | ⏳ Not Done     | P2-2 (pagination)  |

**Blockers**: P1-3 must be completed - landing page not connected  
**Critical**: Public-facing feature affects marketing

---

## 🎯 Critical Path to Phase 6 (Monetization)

Before implementing PayPal and subscription enforcement (Phase 6), we must complete:

**Required** (Blockers):

1. ✅ P0-4: Environment validation ✅ DONE
2. ✅ P0-5: Rate limiter fix ✅ DONE
3. [ ] P0-1: Enhanced user sync
4. [ ] P1-2: Applications endpoint ← **Blocks core business flow**
5. [ ] P1-3: Landing page data ← **Blocks public marketing**
6. [ ] P1-4: Input sanitization ← **Security requirement**
7. [ ] P1-5: Upload security ← **Security requirement**

**Recommended** (Quality): 8. [x] P2-1: Type safety ✅ DONE 9. [x] P2-4: Loading skeletons ✅ DONE 10. [x] P2-7: Request tracing ✅ DONE 11. [ ] P2-6: Frontend validation

**Time to Phase 6**: ~18-21 hours of focused work

---

## 📚 Additional Resources

- [QUICK_START.md](QUICK_START.md) - Setup instructions
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current state & progress
- [TECH_DEBT_ANALYSIS.md](TECH_DEBT_ANALYSIS.md) - Detailed analysis
- [docs/ROADMAP.md](docs/ROADMAP.md) - Phase-by-phase implementation plan
- [docs/BUSINESS_FLOWS.md](docs/BUSINESS_FLOWS.md) - Detailed user flows & technical specs

---

## ✅ Completed Setup Tasks

- [x] Database migrations applied
- [x] Seed data loaded (3 subscription plans)
- [x] Clerk authentication configured
- [x] Environment files created
- [x] All development servers running
- [x] User sync mechanism implemented
- [x] Health check endpoint added

---

## 📝 Notes

- Update checkboxes as you complete tasks by changing `- [ ]` to `- [x]`
- Update the Progress Overview table when completing tasks
- Feel free to reorder tasks based on your priorities
- Add your own notes or estimated times as needed
- Create branches for each task for better organization

**Happy coding! 🚀**
