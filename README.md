# Article Platform (Next.js App Router + Tailwind v4 + TipTap)

A full-featured Article Management frontend scaffolded with bun create next-app (Next.js 15 App Router). It integrates authentication (JWT), role-based admin area, article CRUD, category management, rich text editing via TipTap, and a minimal design system powered by Tailwind CSS v4 with accessible design tokens.

This README documents the stack, architecture, routes, auth flow, API usage (based on api-docs.md), styles, local development, deployment, and extensibility tips.

## Tech Stack

- Runtime/Framework
  - Next.js 15 (App Router)
  - React 19
- Styling
  - Tailwind CSS v4 with CSS custom properties (globals.css)
  - Minimal utility classes + light design system (buttons, inputs, cards, alerts, tables)
- Editor
  - TipTap v3: @tiptap/react, StarterKit, Link, Image
- HTTP and Auth
  - Axios with robust interceptors (retry for 5xx, refresh-on-401 queue)
  - JWT stored in SameSite=Lax cookie ("token"), read client-side
  - Middleware route protection and client guards
- Typescript
  - Types and DTOs in src/types
- Tooling
  - ESLint 9, eslint-config-next
  - TypeScript 5
- Fonts
  - Geist Sans and Geist Mono through next/font

## Project Structure

- src/app
  - layout.tsx — top-level layout with header, Toaster, and containerized main
  - page.tsx — landing page
  - articles/ — public article listing and detail, plus create and edit flows for authenticated users
    - page.tsx — wrapper with Suspense fallback
    - ArticlesClient.tsx — list/search/filter/paginate; supports "mine=1"
    - [id]/page.tsx — article detail with related items
    - [id]/edit/page.tsx — edit article (owner or admin, server-enforced)
    - create/page.tsx — create article (auth required)
  - admin/ — admin area protected by AdminGuard
    - layout.tsx — admin topbar + guard
    - page.tsx — admin dashboard
    - articles/* — admin content (skeleton structure present)
    - categories/* — management pages
    - users/* — register-only flow exposed as "Users"
- src/components
  - AuthGuard.tsx — client guard with optional role gating
  - HeaderClient.tsx — auth-aware header; profile dropdown, "My Articles" and "Create Article"
  - admin/AdminGuard.tsx — role = Admin guard wrapper
  - admin/AdminSidebar.tsx — responsive AdminTopbar
  - editor/Editor.tsx — TipTap editor component
  - ui/ToastProvider.tsx — minimal toast system with context and viewport
- src/services — API layer (axios http instance)
  - articles.ts — list/getById/create/update/remove
  - categories.ts — list/create/update/remove
  - auth.ts — login/register/profile/logout
  - users.ts — register proxy (aliases auth/register)
- src/lib
  - http.ts — axios client, token header injection, 401 refresh queue, 5xx retries
  - auth.ts — cookie helpers, token save/clear, roleRedirectPath
  - fallback.ts — offline and graceful fallback utilities (used by listing/detail)
- src/constants
  - env.ts — API_BASE_URL and pagination defaults
- src/types
  - index.ts — Role, User, Category, Article, PaginatedResponse, LoginResponse

## Environments and Configuration

- API Base URL
  - NEXT_PUBLIC_API_BASE_URL, default fallback: https://test-fe.mysellerpintar.com/api
  - Set it in your hosting platform or `.env.local`:
    - NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
- next.config.ts
  - Image domains allowlist; adjust images.domains if you render remote images
- Cookies
  - Token cookie: token
  - SameSite=Lax, path=/

## Authentication and Authorization

- Token lifecycle
  - Login: POST /auth/login returns { token }; it is saved in the token cookie
  - Header uses /auth/profile to derive user role and show Admin link for Admin users
  - http.ts automatically attaches Authorization: Bearer <token> to requests if present
  - 401 handling: refresh queue attempts POST /auth/refresh, retries original request
  - logout clears cookie and redirects to /login
- Middleware protection (server side)
  - Public: "/", "/articles", "/articles/[id]", "/login", "/register", assets
  - Private: "/articles/create", "/articles?mine=1", "/admin/**", and any non-public paths
  - If missing token on private access, middleware redirects to /login?next=<path>
- Client protection
  - AuthGuard: redirect unauthenticated users to /login (optional role gating)
  - AdminGuard: wraps AuthGuard with roles=["Admin"] and fetches role via /auth/profile
  - ArticlesClient: additional client safety for /articles?mine=1 without token

## Routes Overview

Public
- / — Home with navigation to Articles/Login/Register
- /articles — Public listing with search, category filter, and pagination
- /articles/[id] — Public article detail with related articles

Authenticated (User or Admin)
- /articles?mine=1 — Private listing of the current user's articles (table view)
- /articles/create — Create article
- /articles/[id]/edit — Edit article; backend enforces owner or Admin

Admin (Admin only)
- /admin — Admin dashboard
- /admin/articles — Admin manage articles
- /admin/categories — Admin manage categories
- /admin/users — Admin manage users (register users)

Navigation
- HeaderClient shows:
  - Authenticated: Articles dropdown (Mine, Create), Profile dropdown with role and Admin link
  - Guests: Login / Register CTA

## Styling System

- globals.css sets accessible design tokens:
  - Monochrome base with orange accent
  - Custom properties: --bg, --fg, --primary, --border, radius, shadows, etc.
  - Light and dark schemes via prefers-color-scheme
  - Tailwind theme bridge with @theme inline to map tokens
- Reusable classes:
  - Buttons: .button, .button-primary, .button-outline, .button-ghost
  - Inputs: .input, .select, .textarea, .label
  - Cards: .ui-card
  - Tables: .table
  - Alerts: .alert-*
  - Utilities: .muted, .subtle, .surface, .rounded, .shadow-1, .shadow-2, .border
- Editor content uses .prose styles for readable article body

## API Usage (from api-docs.md)

Base URLs
- Production: https://test-fe.mysellerpintar.com/api
- Local (example): http://localhost:3000 (adjust if proxying)

Authentication
- JWT Bearer in Authorization header
- Roles: User, Admin
- Error codes: 400, 401, 403, 404, 500

Articles
- GET /articles — list (supports filters: articleId, userId, title, category, createdAtStart/End, sortBy, sortOrder, page, limit)
- POST /articles — create (auth required)
- GET /articles/{id} — detail
- PUT /articles/{id} — update (owner or admin)
- DELETE /articles/{id} — delete (owner or admin)

Auth
- POST /auth/register — register
- POST /auth/login — login (returns { token })
- GET /auth/profile — current user profile
- (Client expects POST /auth/refresh for token refresh; adjust if not available)

Categories
- GET /categories — list with pagination and search
- POST /categories — create (auth)
- PUT /categories/{id} — update (auth + permission)
- DELETE /categories/{id} — delete (auth + permission)

Uploads
- POST /upload — Admin-only S3 image upload (multipart/form-data: image)

Schemas (abridged)
- User: { id, username, role }
- Category: { id, name, userId, createdAt, updatedAt }
- Article: { id, title, content, userId, categoryId, createdAt, updatedAt, category?, user? }

## Data and Service Layer

- Axios instance: src/lib/http.ts
  - Base URL from NEXT_PUBLIC_API_BASE_URL
  - Request interceptor attaches Authorization header when token exists
  - Response interceptor:
    - Retries 5xx up to 2 times with exponential backoff
    - On 401: queues requests during refresh; POST /auth/refresh expected to return { token }
    - On refresh failure: clears token and rejects queued requests
- Services wrap endpoints:
  - articlesService: list, getById, create, update, remove
  - categoriesService: list, create, update, remove
  - authService: login, register, profile, logout
  - usersService: register (alias of /auth/register)
- Types define API contracts used in UI

## UI/UX Features

- Responsive layout with sticky app header
- HeaderClient with accessible dropdowns (keyboard and ARIA attributes)
- Articles list
  - Search with debounce
  - Category filter with cached names for reliable rendering
  - Pagination controlled by server response when provided
  - "Mine" view table with edit/view/delete actions
- Article detail
  - Sanitized HTML render via DOMPurify
  - Related articles by category
- Create/Edit forms
  - TipTap editor, validation messages, disabled admin-only image upload in user editor
  - Toaster notifications for success and errors
- AdminTopbar
  - Compact icon-first navigation, sticky, responsive
- Accessibility
  - aria-labels, role attributes, focus styles, alerts, and status regions throughout

## Local Development

Install dependencies
- yarn install
- or npm/pnpm/bun as you prefer (project includes a yarn packageManager field)

Run dev server
- yarn dev
- open http://localhost:3000

Environment
- Create .env.local:
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

Build and start
- yarn build
- yarn start

Lint
- yarn lint

## Production and Deployment

- Provide NEXT_PUBLIC_API_BASE_URL in environment variables at build/deploy time
- Check next.config.ts for image domains
- Consider disabling or adapting token refresh if your backend does not support /auth/refresh
- Harden cookies (e.g., add Secure in https contexts)

## Integrating Image Upload

- The editor component supports an optional onRequestImageUpload(file) handler
- Admin flow can wire it to POST /upload and insert the returned imageUrl into the editor
- Example (pseudo):
  - const url = await http.post<{ imageUrl: string }>("/upload", formData, { headers: { "Content-Type": "multipart/form-data" }});
  - return url.data.imageUrl;

## Security Considerations

- Token in client-readable cookie enables SPA ergonomics; for stronger security use httpOnly cookies and server actions
- DOMPurify is used on detail page to sanitize API-returned HTML; keep sanitization strict
- Avoid reflecting unsanitized HTML anywhere else
- Verify role and ownership on backend for PUT/DELETE routes (client enforces UX but server is the authority)

## Extending the App

- Add server actions or route handlers in /app/api for SSR-friendly flows
- Add optimistic updates for better UX after create/update/delete
- Replace polling in HeaderClient with event-driven updates (Storage events, context, or SWR)
- Integrate real pagination metadata across all list endpoints
- Add drafts/soft delete at API level and reflect in UI
- Implement admin-only editor image upload integration

## Quick Start Cheat Sheet

- Configure API URL
  - export NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
- Start
  - yarn dev
- Auth
  - Register at /register
  - Login at /login
- Content
  - Browse /articles
  - Create /articles/create
  - Manage mine: /articles?mine=1
- Admin
  - After login as Admin: top-right Profile → Admin

## License

MIT (or your preferred license)
