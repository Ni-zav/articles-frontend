Create a Medium-like article platform with this enhanced, actionable prompt.

Project Title
Full-Stack Article Management System with Role-Based Access

Objective
Implement a production-ready article management platform with User and Admin roles in one cycle using Next.js. Use API base URL: https://test-fe.mysellerpintar.com/api. Include local fallback data, robust auth, responsive UI, and quality safeguards.

Immediate Actions
1) Initialize Project
- Create Next.js (latest, App Router) with TypeScript
- Configure Tailwind CSS + shadcn/ui
- Set up Axios instance + interceptors (base URL above)
- Implement local fallback data layer (used on API failure)
- Use latest stable libraries

2) Core Systems
Authentication (JWT-based)
- Cookie-based session storage
- Protected route middleware
- Role redirects:
  - User → /articles
  - Admin → /dashboard

Auth Service Functions
- login(username, password)
- register(userData)
- logout()
- refreshToken()

3) UI & Layout
- Responsive layout with mobile-first navigation
- Role-specific sidebars (Admin vs User)
- Loading skeletons for all async views
- Reusable components:
  - Data tables (shadcn/ui)
  - Form controls (React Hook Form + Zod)
  - Toast notifications

User Features
Article Listing
- Category filter dropdown
- Debounced search (400ms)
- Pagination (9 items/page)

Article Detail
- Render full content
- Related articles (max 3) from same category
- Breadcrumb navigation

Admin Features
Category Management
- CRUD operations
- Searchable table with debounce
- Form validation

Article Editor
- Rich text editor (TipTap)
- Image upload preview
- Draft/publish toggle
- Preview mode before submit

Quality Controls
- Error boundaries
- Loading states for all async actions
- Form validation messages
- Automated API retry logic with backoff

Validation Checklist
- Auth
  - login: validated
  - register: validated
  - roleRedirects: implemented
- User Features
  - articleSearch: debounced(400ms)
  - pagination: 9 items/page
  - relatedArticles: 3 items max
- Admin Features
  - categoryCRUD: complete
  - articleEditor: preview enabled
- Quality
  - loadingStates: all async ops
  - errorHandling: boundaries + toasts
  - accessibility: WCAG AA compliant

Expected Structure
src/
├── app/                  # Next.js routes
├── components/           # UI components
├── constants/            # App constants
├── contexts/             # Global state
├── hooks/                # Custom hooks
├── lib/                  # Utilities (axios, auth, helpers)
├── services/             # API services
├── styles/               # Global styles
└── types/                # TypeScript types

Deployment Protocol
1. Set up Vercel project
2. Configure environment variables
3. Implement CI/CD pipeline
4. Create production build

Documentation & Deliverables
- README.md with:
  - Setup instructions
  - API documentation
  - Screenshots
  - Environment variables reference
- Complete Git history:
  - Atomic commits
  - Meaningful commit messages
  - Feature branches

Execution Order (Prioritized)
1. Core authentication system
2. Shared layout and navigation
3. User features (articles)
4. Admin features (categories, editor)
5. Quality polish (accessibility, states, errors)
6. Deployment setup

Notes
- Build features in parallel where feasible with shared state management.
- Ensure responsive design across Mobile (320px), Tablet (768px), Desktop (1280px+).
- Use the provided API base URL; fallback to local data on failures.