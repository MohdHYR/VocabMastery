# VocabMastery - Vocabulary Learning Platform

## Overview

VocabMastery is an educational web application designed to help students learn vocabulary through interactive lessons, dictation tests, and gamified challenges. The platform supports multiple grade levels and units, featuring English-Arabic bilingual vocabulary content with definitions, synonyms, antonyms, and usage examples. It includes a leaderboard system for gamification and an admin dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions and interactions
- **Build Tool**: Vite with HMR support

The frontend follows a page-based architecture with three main routes:
- Home (`/`) - Landing page with leaderboard display
- Learn (`/learn`) - Interactive vocabulary learning flow with selection, learning, dictation, and MCQ steps
- Admin (`/admin`) - Content management dashboard for administrators

Custom hooks abstract API interactions (`use-vocabularies`, `use-leaderboard`, `use-results`, `use-auth`).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express-session with MemoryStore (development) or connect-pg-simple (production-ready)
- **Authentication**: Dual system supporting both manual login and Replit Auth integration

The backend serves as a REST API with endpoints for:
- Vocabulary CRUD operations with filtering by grade/unit
- User authentication and session management
- Result submission and leaderboard retrieval
- Bulk vocabulary import via CSV

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**:
  - `users` - User accounts with optional admin flag
  - `vocabularies` - Word entries with translations, synonyms, antonyms, usage examples
  - `results` - Score records linked to users
  - `sessions` - Session storage for Replit Auth

### API Design
- Centralized API contract in `shared/routes.ts` using Zod schemas
- Type-safe request/response validation
- RESTful endpoints under `/api/` prefix

### Authentication
Two authentication mechanisms are implemented:
1. **Manual Login**: Simple username/password authentication for admin access (credentials: admin/admin)
2. **Replit Auth**: OIDC-based authentication for Replit platform users (optional integration in `server/replit_integrations/auth/`)

## External Dependencies

### Frontend Libraries
- `@tanstack/react-query` - Server state management
- `framer-motion` - Animation library
- `canvas-confetti` - Celebration effects for correct answers
- `papaparse` - CSV parsing for bulk vocabulary upload
- `react-hook-form` with `@hookform/resolvers` - Form handling with Zod validation
- `wouter` - Client-side routing
- `date-fns` - Date formatting utilities

### Backend Libraries
- `drizzle-orm` with `drizzle-kit` - Database ORM and migrations
- `express-session` with `memorystore` - Session handling
- `connect-pg-simple` - PostgreSQL session store
- `passport` with `openid-client` - Replit Auth OIDC integration
- `pg` - PostgreSQL driver

### UI Components
- Full shadcn/ui component library (Radix UI primitives)
- Tailwind CSS with custom theme extending colors, fonts, and border radius

### Database
- PostgreSQL (required, configured via `DATABASE_URL` environment variable)
- Migrations output to `./migrations` directory

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (optional, has fallback)
- `ISSUER_URL` - Replit OIDC issuer (optional, for Replit Auth)
- `REPL_ID` - Replit environment identifier (auto-provided in Replit)