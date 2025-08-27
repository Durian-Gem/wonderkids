# Environment Variables Setup
**WonderKids English Learning Platform**

## 🔐 **Security Notice**
All hardcoded credentials have been removed from the codebase for security. You must set up environment variables to run the application.

## 📝 **Required Environment Variables**

### **API Application** (`apps/api/.env`)
Create `apps/api/.env` with:
```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# API Configuration (Optional)
PORT=4000
NODE_ENV=development
```

### **Web Application** (`apps/web/.env.local`)
Create `apps/web/.env.local` with:
```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# API Configuration (Optional)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔑 **Getting Your Supabase Credentials**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings > API**
4. **Copy the following values**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## ⚠️ **Security Requirements**

### **Environment Files**
- ✅ `.env` files are in `.gitignore`
- ✅ No credentials committed to repository
- ✅ Applications require environment variables

### **Key Types**
- **`NEXT_PUBLIC_*`**: Safe for client-side (browser)
- **`SUPABASE_SERVICE_ROLE_KEY`**: Server-only (API), never expose to client

## 🚀 **Starting the Applications**

### **With Environment Variables Set**
```bash
# API Server
yarn dev:api
# ✅ Starts on http://localhost:4000

# Web Application
yarn dev:web  
# ✅ Starts on http://localhost:3000
```

### **Without Environment Variables**
```bash
# API Server
yarn dev:api
# ❌ Error: supabaseUrl is required

# Web Application  
yarn dev:web
# ❌ Error: Missing environment variables
```

## 🧪 **Testing Environment Setup**

### **Verify API Environment**
```bash
# This should work if .env is set correctly
curl http://localhost:4000/api/content/test

# Expected response:
# {"message":"API is working","timestamp":"..."}
```

### **Verify Web Environment**
1. Start web app: `yarn dev:web`
2. Open browser: http://localhost:3000
3. Check browser console for any environment variable errors

## 🔄 **Environment Variable Priority**

### **API (NestJS)**
1. `apps/api/.env` (local environment file)
2. System environment variables
3. ❌ No fallbacks (security requirement)

### **Web (Next.js)**
1. `apps/web/.env.local` (local environment file)
2. `apps/web/.env` (shared environment file)
3. System environment variables  
4. ❌ No fallbacks (security requirement)

---

**Security Note**: Never commit actual credentials to version control. Use placeholder values in documentation and example files only.
