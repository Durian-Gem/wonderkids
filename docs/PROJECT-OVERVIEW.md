# WonderKids English - Project Overview
**Interactive English Learning Platform for Children**

## 🎯 **Project Vision**
Create a safe, engaging, and effective English learning platform for children aged 5-12, combining interactive lessons, gamification, AI tutoring, and family involvement.

## 📊 **Current Status**
- **Sprint**: Sprint-1 ✅ **COMPLETED**
- **Platform**: Foundation & Authentication
- **Next Sprint**: Sprint-2 (Progress & Gamification)
- **API Server**: http://localhost:4000
- **Web App**: http://localhost:3000

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript + Swagger/OpenAPI
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (JWT + Magic Links)
- **Build**: Turborepo monorepo with shared packages
- **Deployment**: Development environment ready

### **Monorepo Structure**
```
wonderkids/
├── apps/
│   ├── api/                 # NestJS API server (port 4000)
│   └── web/                 # Next.js web app (port 3000)
├── packages/
│   ├── config/              # ESLint, Prettier, Tailwind config
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # shadcn/ui components
│   └── typescript-config/   # TypeScript configurations
├── supabase/               # Database migrations & seed
├── docs/                   # Project documentation
│   ├── sprints/            # Sprint-specific documentation
│   ├── PRD.md              # Product Requirements
│   └── EPICS_STORIES.md    # User stories & epics
└── .github/workflows/      # CI/CD pipeline
```

## 🗄️ **Database Schema**

### **Core Tables**
- **`profiles`**: User/guardian profiles (linked to auth.users)
- **`children`**: Child profiles (linked to guardians)
- **`courses`**: Course content (CEFR-aligned)
- **`units`**: Course units (grouped lessons)
- **`lessons`**: Individual lesson content

### **Current Content**
- **1 Course**: A1 Starters (CEFR Level A1)
- **3 Units**: Hello & Introductions, Family & Pets, Colors & Numbers
- **6 Lessons**: 2 lessons per unit, 5 minutes each

## 📡 **API Status**

### **✅ Working Endpoints**
- `GET /api/content/courses` - List published courses
- `GET /api/content/courses/:slug` - Get course with content
- `GET /api/content/test` - API health check

### **🧪 Ready for Testing** (Authentication Required)
- `GET /api/profiles/me` - Get user profile
- `PATCH /api/profiles/me` - Update user profile
- `GET /api/children` - Get children for guardian
- `POST /api/children` - Create child profile
- `PATCH /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

## 🌐 **Frontend Status**

### **✅ Implemented Pages**
- **Authentication**: `/auth/sign-in`, `/auth/sign-up`
- **Dashboard**: `/dashboard` with stats and quick actions
- **Family Management**: `/family` with child CRUD
- **Course Display**: `/course/a1-starters` with units/lessons
- **Marketing**: `/` homepage, `/pricing` page

### **🎨 UI Components**
- shadcn/ui component library integrated
- Responsive design with Tailwind CSS
- Internationalization support (English + Vietnamese)
- Framer Motion animations

## 🔐 **Security Implementation**

### **Authentication**
- Supabase JWT tokens
- Magic link authentication
- Protected routes with authentication guards

### **Authorization**
- Row Level Security (RLS) policies
- Guardian-child relationships enforced
- Public access to published content only

## 📈 **Development Workflow**

### **Start Development**
```bash
# API Server (Terminal 1)
yarn dev:api
# Runs on http://localhost:4000

# Web App (Terminal 2) 
yarn dev:web
# Runs on http://localhost:3000
```

### **Available Scripts**
- `yarn build` - Build all apps
- `yarn lint` - Lint all packages
- `yarn typecheck` - TypeScript checking
- `yarn dev:web` - Start web development
- `yarn dev:api` - Start API development

## 📋 **Sprint Documentation**

### **Sprint-1 Deliverables**
- [Sprint Completion Report](./sprints/sprint1-deliverables/SPRINT1-COMPLETION.md)
- [API Testing Guide](./sprints/sprint1-deliverables/API-TESTING-GUIDE.md)

### **Documentation Standards**
Each sprint must include:
1. **Completion Report**: Full sprint summary with technical details
2. **API Testing Guide**: Comprehensive endpoint testing
3. **Architecture Updates**: Any structural changes
4. **Known Issues**: Technical debt tracking

## 🎯 **Product Roadmap**

### **Sprint-2 Goals** (Next)
- [ ] Interactive lesson player
- [ ] User progress tracking
- [ ] XP and achievement system
- [ ] Basic gamification elements

### **Future Sprints**
- **Sprint-3**: AI Tutor integration
- **Sprint-4**: Advanced lesson types (audio, games)
- **Sprint-5**: Monetization (Stripe integration)
- **Sprint-6**: Teacher Mode & Analytics

## 🔍 **Quality Metrics**

### **Current Quality**
- ✅ TypeScript strict mode throughout
- ✅ ESLint + Prettier with import sorting
- ✅ Zero console errors in development
- ✅ RLS policies protecting user data
- ✅ Responsive design with accessibility
- ✅ CI/CD pipeline configured

### **Testing Coverage**
- **Public APIs**: ✅ Fully tested
- **Protected APIs**: 🧪 Ready for testing
- **Frontend**: ✅ Manual testing complete
- **E2E Testing**: 📋 Planned for Sprint-2

## 🚀 **Deployment**

### **Current Environment**
- **Development**: Local development setup
- **Database**: Supabase hosted PostgreSQL
- **Authentication**: Supabase Auth service

### **Production Readiness** (Sprint-3+)
- Environment configuration
- CI/CD deployment pipeline
- Monitoring and analytics
- Performance optimization

## 🤝 **Contributing**

### **Development Rules**
- Follow TypeScript strict mode
- Use latest library versions (no pinning)
- Keep PRs atomic (<300 lines)
- Document all API changes
- Test endpoints thoroughly
- Maintain sprint documentation

### **Code Standards**
- **Components**: PascalCase
- **Hooks**: useCamelCase
- **Files**: kebab-case
- **Commits**: `type(scope): summary`

## 📞 **Support & Resources**

### **Documentation**
- [Product Requirements](./PRD.md)
- [User Stories](./EPICS_STORIES.md)
- [Sprint Documentation](./sprints/)

### **Development URLs**
- **API Docs**: http://localhost:4000/docs
- **Web App**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard

---

**Last Updated**: 2025-08-27  
**Current Sprint**: Sprint-1 ✅ Complete  
**Next Milestone**: Sprint-2 Progress & Gamification
