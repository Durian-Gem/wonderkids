# WonderKids Setup Guide

## Prerequisites
- Node.js 18+
- Yarn package manager
- Supabase account

## Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Environment Variables Setup
🔐 **SECURITY NOTICE**: All hardcoded credentials have been removed from the codebase for security. You must set up environment variables to run the application.

#### **Required Environment Variables**

##### **API Application** (`apps/api/.env`)
Create `apps/api/.env` with:
```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# API Configuration (Optional)
PORT=4000
NODE_ENV=development
```

##### **Web Application** (`apps/web/.env.local`)
Create `apps/web/.env.local` with:
```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# API Configuration (Optional)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **Getting Your Supabase Credentials**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings > API**
4. **Copy the following values**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

#### **Security Requirements**

##### **Environment Files**
- ✅ `.env` files are in `.gitignore`
- ✅ No credentials committed to repository
- ✅ Applications require environment variables

##### **Key Types**
- **`NEXT_PUBLIC_*`**: Safe for client-side (browser)
- **`SUPABASE_SERVICE_ROLE_KEY`**: Server-only (API), never expose to client

#### **Environment Variable Priority**

##### **API (NestJS)**
1. `apps/api/.env` (local environment file)
2. System environment variables
3. ❌ No fallbacks (security requirement)

##### **Web (Next.js)**
1. `apps/web/.env.local` (local environment file)
2. `apps/web/.env` (shared environment file)
3. System environment variables
4. ❌ No fallbacks (security requirement)

### 3. Database Setup
The database schema and seed data are already applied via Supabase MCP. The following are already configured:
- ✅ Database schema with RLS policies
- ✅ Seed data: A1 Starters course with 3 units and 6 lessons
- ✅ Authentication tables

### 4. Start Development Servers

#### **With Environment Variables Set**
```bash
# API Server
yarn dev:api
# ✅ Starts on http://localhost:4000

# Web Application
yarn dev:web
# ✅ Starts on http://localhost:3000
```

#### **Without Environment Variables**
```bash
# API Server
yarn dev:api
# ❌ Error: supabaseUrl is required

# Web Application
yarn dev:web
# ❌ Error: Missing environment variables
```

#### **Verify Setup**
```bash
# Test API
curl http://localhost:4000/api/content/test
# Expected: {"message":"API is working","timestamp":"..."}

# Test Web App
# Open http://localhost:3000 in browser
# Check console for environment variable errors
```

## Available Scripts

- `yarn dev:web` - Start web development server
- `yarn dev:api` - Start API development server  
- `yarn build` - Build all applications
- `yarn lint` - Lint all packages
- `yarn typecheck` - Run TypeScript type checking

## Application Structure

```
wonderkids/
├── apps/
│   ├── api/          # NestJS API server
│   └── web/          # Next.js web application
├── packages/
│   ├── config/       # Shared configuration (ESLint, Prettier, Tailwind)
│   ├── types/        # Shared TypeScript types and Zod schemas
│   ├── ui/           # Shared UI components (shadcn/ui)
│   └── typescript-config/ # TypeScript configurations
├── supabase/         # Database migrations and seed files
└── docs/            # Documentation
```

## Features Implemented (Sprint-1)

### Authentication & Authorization
- ✅ Email/password authentication with Supabase
- ✅ Magic link authentication
- ✅ Guardian profile creation
- ✅ Protected routes with authentication guards

### Family Management
- ✅ Create, read, update, delete child profiles
- ✅ Row Level Security (RLS) protection
- ✅ Multi-child support per guardian

### Course Content
- ✅ Course map display
- ✅ A1 Starters course with 3 units and 6 lessons
- ✅ Published content filtering
- ✅ CEFR level tagging

### Marketing Site
- ✅ Landing page with features
- ✅ Pricing page
- ✅ Responsive design
- ✅ SEO optimization

### Technical Features
- ✅ Type-safe API with NestJS
- ✅ Modern React with Next.js App Router
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Internationalization (English + Vietnamese)
- ✅ Monorepo with Turborepo
- ✅ CI/CD pipeline

## API Endpoints

### Content (Public)
- `GET /api/content/courses` - Get all published courses
- `GET /api/content/courses/:slug` - Get course with units and lessons

### Authentication Required
- `GET /api/profiles/me` - Get current user profile
- `PATCH /api/profiles/me` - Update current user profile
- `GET /api/children` - Get children for current guardian
- `POST /api/children` - Create new child
- `PATCH /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

## Testing

### Test User Journey
1. Visit http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create an account with email/password
4. Add a child profile
5. Navigate to the A1 Starters course
6. Explore the course content

### API Testing
- Swagger docs: http://localhost:4000/docs
- Test endpoints with authentication headers

## Troubleshooting

### API Server Issues
- Make sure port 4000 is not in use
- Check Supabase connection with `yarn dev:api`
- Verify database schema is applied

### Web App Issues  
- Clear Next.js cache: `rm -rf apps/web/.next`
- Restart development server
- Check browser console for errors

### Database Issues
- Verify Supabase project is active
- Check MCP connection for schema updates
- Ensure RLS policies are properly configured

## Next Steps (Future Sprints)

- Lesson player implementation
- XP and gamification system
- AI tutor integration
- Progress tracking
- Payment integration with Stripe
- Advanced lesson types (audio, interactive activities)

## Support

For development questions or issues:
1. Check the console logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure all dependencies are installed with `yarn install`
4. Check that both API and web servers are running

---

**🔒 Security Note**: Never commit actual credentials to version control. Use placeholder values in documentation and example files only. All `.env` files are included in `.gitignore` for security.
