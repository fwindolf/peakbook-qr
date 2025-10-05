# peakbook admin UI

**peakbook Admin** is an administrative platform for managing peakbook content and operations.
The project is evolving from a simple QR code generator into a comprehensive admin system with the following capabilities:

- **Peak Creation & Management**: Create, edit, and manage peaks (mountains with description, and stats)
- **Translation Management**: Manage multilingual content for peaks
- **QR Code Generation**: Generate print-ready QR stickers for peak check-ins (peak QR code)
- **Approval Engine**: Moderator mode for reviewing and approving peakbook entries (summit book entries w/ photo)
- **Content Administration**: Centralized platform for all peakbook admin operations
- **Statistics & Analytics**: View statistics and analytics for peakbook

## Technology Stack

- **Framework**: Next.js 14+ (App Router) with React 18+
- **Styling**: TailwindCSS 3+ with custom design system
- **Database**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite (current) → migrating to Next.js
- **Language**: TypeScript (migrating from vanilla JS)
- **Package Manager**: npm

## Development Commands

```bash
# Current Vite-based commands
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build (http://localhost:4173)
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Future Next.js commands (after migration)
npm run dev          # Start Next.js dev server
npm run build        # Build Next.js app
npm run start        # Start production server
npm run lint         # Run Next.js linting
npm run type-check   # TypeScript type checking
```

## Architecture & Project Structure

### Current Structure (Vite/Vanilla JS)
```
peakbook-admin/
├── src/
│   ├── main.js              # Application entry point
│   ├── style.css            # TailwindCSS & custom styles
│   ├── config/
│   │   └── constants.js     # Configuration constants
│   └── modules/
│       ├── validator.js     # Input validation
│       ├── qrGenerator.js   # QR code generation
│       ├── svgBuilder.js    # SVG composition
│       └── fileHandler.js   # File operations
├── public/
│   └── icons/               # Static assets
├── index.html               # Entry HTML
└── vite.config.js           # Vite configuration
```

### Target Structure (Next.js/TypeScript)
```
peakbook-admin/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth routes (login, signup)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── peaks/          # Peak management
│   │   ├── qr-codes/       # QR generation
│   │   ├── translations/   # Translation management
│   │   └── moderation/     # Approval engine
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── forms/              # Form components
│   ├── layouts/            # Layout components
│   └── features/           # Feature-specific components
├── lib/
│   ├── supabase/           # Supabase client & utilities
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── validations/        # Zod schemas
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
└── config/                 # App configuration
```

## Best Practices

### Next.js Patterns

1. **Server Components by Default**
   - Use Server Components for data fetching and static content
   - Only add `'use client'` when you need interactivity, hooks, or browser APIs
   - Fetch data in Server Components and pass to Client Components as props

2. **File Organization**
   - Use route groups `(name)` for logical organization without affecting URLs
   - Co-locate related files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
   - Keep API routes in `app/api/` following REST conventions

3. **Data Fetching**
   - Use Server Components for database queries (Supabase SSR)
   - Implement React Server Actions for mutations
   - Use `revalidatePath()` and `revalidateTag()` for cache invalidation
   - Leverage Next.js caching with appropriate `fetch()` options

4. **Performance**
   - Use `next/image` for all images with proper sizing
   - Implement dynamic imports for heavy components: `const Modal = dynamic(() => import('./Modal'))`
   - Use `loading.tsx` for Suspense boundaries
   - Optimize fonts with `next/font`

### React Patterns

1. **Component Design**
   - Keep components small and focused (single responsibility)
   - Extract reusable UI into `components/ui/` (consider shadcn/ui)
   - Use composition over prop drilling
   - Implement error boundaries for graceful error handling

2. **State Management**
   - Use React Server State (Server Components) when possible
   - Client state: `useState`, `useReducer` for local state
   - Global state: Context API or Zustand (lightweight)
   - Server state: React Query/SWR or Server Actions

3. **Hooks**
   - Create custom hooks for reusable logic in `lib/hooks/`
   - Follow hook naming convention: `use[Name]`
   - Keep hooks pure and testable
   - Examples: `useSupabase()`, `usePeakForm()`, `useModeration()`

### TailwindCSS Guidelines

1. **Design System**
   - Define custom colors in `tailwind.config.js` (peakbook brand colors)
   - Use CSS variables for theming support
   - Create reusable utility classes in `@layer components`
   - Maintain consistent spacing scale (4px base unit)

2. **Component Styling**
   - Use Tailwind utilities directly in JSX (avoid premature abstraction)
   - Extract repeated patterns into components, not CSS classes
   - Use `clsx` or `cn()` utility for conditional classes
   - Leverage Tailwind variants: `hover:`, `focus:`, `dark:`, `md:`, etc.

3. **Responsive Design**
   - Mobile-first approach (base styles for mobile, then `md:`, `lg:`)
   - Use Tailwind breakpoints consistently: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
   - Test on multiple screen sizes

### Supabase Best Practices

1. **Client Setup**
   - Use separate clients for server/client components
   - Server: `createServerClient()` with cookies
   - Client: `createBrowserClient()`
   - Middleware: `createMiddlewareClient()` for auth

2. **Database Patterns**
   - Use Row Level Security (RLS) for all tables
   - Define TypeScript types from database schema: `supabase gen types typescript`
   - Use Supabase realtime for live updates where needed
   - Implement proper indexes for query performance

3. **Authentication**
   - Protect routes with middleware auth checks
   - Use Supabase Auth UI components or build custom
   - Implement proper role-based access control (RBAC)
   - Handle session refresh and token expiration

4. **Query Optimization**
   - Use `select()` with specific columns to minimize data transfer
   - Implement pagination for large datasets: `.range()`
   - Use `.single()` when expecting one result
   - Leverage Postgres views for complex queries

### Code Quality

1. **TypeScript**
   - Enable strict mode in `tsconfig.json`
   - Define interfaces for all data structures
   - Avoid `any` - use `unknown` if type is truly unknown
   - Use Zod for runtime validation and type inference

2. **Validation**
   - Use Zod schemas for all form validation
   - Validate on both client and server
   - Create reusable validation schemas in `lib/validations/`
   - Example: `peakSchema`, `qrCodeSchema`, `translationSchema`

3. **Error Handling**
   - Implement try-catch in Server Actions
   - Return typed errors: `{ error: string } | { data: T }`
   - Use error boundaries for client errors
   - Log errors appropriately (consider Sentry)

4. **Testing**
   - Write unit tests for utilities and validation
   - Integration tests for API routes
   - E2E tests for critical user flows (Playwright)
   - Test edge cases and error states

## Key Configuration Files

### Environment Variables (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PEAKBOOK_URL=https://peakbook.app

# QR Code Configuration
NEXT_PUBLIC_QR_BASE_URL=https://peakbook.app/scan
```

### Constants & Configuration
- **Global config**: `config/constants.ts`
- **QR settings**: Token length (20), error correction (Q), sticker size (5cm × 5cm)
- **Theme**: Brand colors, typography (Noto Naskh Arabic)
- **Validation**: Token pattern `[A-Z0-9]{20}`, caption max 50 chars

## Domain-Specific Logic

### QR Code Generation
- Generate SVG stickers for peakbook check-in
- Sticker specs: 5cm × 5cm with 3mm bleed margins
- QR code: 4cm with high error correction (Q level)
- Logo overlay: ≤25% of QR width, centered
- URL format: `https://peakbook.app/scan?token={20-char-token}`
- Output: Print-ready SVG with proper DPI and color space

### Peak Management
- CRUD operations for mountain peaks
- Fields: name, elevation, location (lat/lng), region, difficulty
- Multilingual support: store translations separately
- Image management: multiple photos per peak
- Moderation workflow: draft → pending → approved

### Translation System
- Support multiple languages (en, de, fr, it, etc.)
- Translatable fields: peak name, description, region
- Fallback to default language if translation missing
- Translation status tracking (pending, approved)

### Approval Engine (Moderation)
- Queue system for pending entries
- Moderator actions: approve, reject, request changes
- Audit trail: track who approved/rejected and when
- Notification system for submitters
- Batch operations support

## Migration Path

The project is migrating from Vite/Vanilla JS to Next.js/TypeScript:

1. **Phase 1**: Set up Next.js project structure
   - Initialize Next.js with App Router
   - Configure TypeScript, ESLint, Prettier
   - Set up Tailwind with design system
   - Configure Supabase integration

2. **Phase 2**: Migrate QR functionality
   - Convert QR modules to TypeScript
   - Create Next.js API routes for QR generation
   - Build React components for QR UI
   - Maintain backward compatibility

3. **Phase 3**: Add new features
   - Peak management CRUD
   - Translation management
   - Approval engine
   - Admin dashboard

4. **Phase 4**: Polish & Deploy
   - Comprehensive testing
   - Performance optimization
   - Documentation
   - Deployment setup (Vercel)

## Common Tasks

### Create a new page
```bash
# Create route folder
mkdir app/(dashboard)/new-feature
# Add page component
touch app/(dashboard)/new-feature/page.tsx
```

### Add a new component
```bash
# UI component
touch components/ui/new-component.tsx
# Feature component
touch components/features/new-feature/FeatureCard.tsx
```

### Generate Supabase types
```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Format code
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

## Development Workflow

1. **Before starting work**
   - Pull latest changes: `git pull`
   - Install dependencies: `npm install`
   - Check environment variables are set

2. **During development**
   - Run dev server: `npm run dev`
   - Auto-format on save (VS Code)
   - Run linter: `npm run lint`
   - Check types: `npm run type-check` (after TS migration)

3. **Before committing**
   - Ensure all tests pass
   - Run formatter: `npm run format`
   - Fix lint errors: `npm run lint -- --fix`
   - Review changes: `git diff`

4. **Commit conventions**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
   - Write descriptive commit messages
   - Reference issues/tickets when applicable

## Database Schema Overview

### Tables (Supabase)

**peaks**
- id (uuid, pk)
- name (text) - default language
- elevation (int) - meters
- latitude (decimal)
- longitude (decimal)
- region (text)
- difficulty (enum)
- status (enum: draft, pending, approved)
- created_by (uuid, fk to users)
- approved_by (uuid, fk to users)
- created_at, updated_at

**peak_translations**
- id (uuid, pk)
- peak_id (uuid, fk)
- language (text)
- name (text)
- description (text)
- status (enum: pending, approved)

**qr_codes**
- id (uuid, pk)
- peak_id (uuid, fk)
- token (text, unique, length 20)
- created_at

**moderator_actions**
- id (uuid, pk)
- entity_type (text: peak, translation, etc.)
- entity_id (uuid)
- action (enum: approved, rejected, requested_changes)
- moderator_id (uuid, fk)
- notes (text)
- created_at

## Important Notes

- All QR tokens must be exactly 20 characters (A-Z, 0-9)
- Sticker SVGs must include 3mm bleed for professional printing
- Use high error correction (Q level) for QR codes with logos
- All database queries must respect Row Level Security policies
- Images should be optimized before upload (consider using Supabase Storage)
- Moderator permissions required for approval actions
- Always validate input on both client and server

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
