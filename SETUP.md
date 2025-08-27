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

### 2. Environment Variables
⚠️ **SECURITY UPDATE**: Environment variables are now **REQUIRED**. All hardcoded credentials have been removed for security.

**📖 See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for detailed setup instructions.**

Create the following `.env` files:

**For API (`apps/api/.env`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Web (`apps/web/.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Database Setup
The database schema and seed data are already applied via Supabase MCP. The following are already configured:
- ✅ Database schema with RLS policies
- ✅ Seed data: A1 Starters course with 3 units and 6 lessons
- ✅ Authentication tables

### 4. Start Development Servers

**Terminal 1 - API Server:**
```bash
yarn dev:api
```
The API will run on http://localhost:4000
Swagger docs available at http://localhost:4000/docs

**Terminal 2 - Web App:**
```bash
yarn dev:web
```
The web app will run on http://localhost:3000

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
