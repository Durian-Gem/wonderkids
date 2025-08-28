# API Testing Guide - Sprint 1
**WonderKids English Learning Platform**

## 🎯 **Testing Overview**
This document provides comprehensive testing for all API endpoints implemented in Sprint-1. All tests should be run against the development server at `http://localhost:4000`.

## 🔧 **Setup Requirements**

### **Start the API Server**
```bash
yarn dev:api
# Server should start on http://localhost:4000
# Swagger docs available at http://localhost:4000/docs
```

### **Verify Server Health**
```bash
curl http://localhost:4000/api/content/test
# Expected: {"message":"API is working","timestamp":"..."}
```

## 📡 **Public Endpoints (No Authentication)**

### **✅ GET /api/content/courses**
**Purpose**: Get all published courses

```bash
curl -X GET http://localhost:4000/api/content/courses
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "a1-starters",
      "title": "A1 Starters",
      "cefr_level": "A1",
      "description": "Beginner topics for ages 6-10",
      "is_published": true,
      "created_at": "timestamp"
    }
  ],
  "success": true
}
```

**Test Cases**:
- ✅ Returns 200 status code
- ✅ Returns array with A1 Starters course
- ✅ All required fields present
- ✅ Only published courses returned

---

### **✅ GET /api/content/courses/:slug**
**Purpose**: Get course with units and lessons

```bash
curl -X GET http://localhost:4000/api/content/courses/a1-starters
```

**Expected Response**:
```json
{
  "data": {
    "id": "uuid",
    "slug": "a1-starters",
    "title": "A1 Starters",
    "cefr_level": "A1",
    "description": "Beginner topics for ages 6-10",
    "is_published": true,
    "created_at": "timestamp",
    "units": [
      {
        "id": "uuid",
        "idx": 1,
        "title": "Hello & Introductions",
        "description": "Greetings and names",
        "lessons": [
          {
            "id": "uuid",
            "idx": 1,
            "title": "Saying Hello",
            "objective": "Greet and ask names",
            "est_minutes": 5,
            "is_published": true
          }
        ]
      }
    ]
  },
  "success": true
}
```

**Test Cases**:
- ✅ Returns 200 for valid slug
- ✅ Returns 404 for invalid slug
- ✅ Includes 3 units with proper ordering (idx: 1, 2, 3)
- ✅ Each unit has 2 lessons
- ✅ Total 6 lessons across all units
- ✅ Only published content returned

**Invalid Slug Test**:
```bash
curl -X GET http://localhost:4000/api/content/courses/invalid-slug
# Expected: 404 with error message
```

## 🔐 **Protected Endpoints (Require Authentication)**

### **Authentication Setup**
To test protected endpoints, you need a valid JWT token. Here's how to get one:

#### **Option 1: Sign Up via Web App**
1. Start web app: `yarn dev:web`
2. Go to `http://localhost:3000/auth/sign-up`
3. Create account and check browser dev tools for the JWT token

#### **Option 2: Direct Supabase Auth (Recommended for Testing)**
```bash
# Sign up new user
curl -X POST 'https://YOUR_SUPABASE_URL.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Sign in to get token
curl -X POST 'https://YOUR_SUPABASE_URL.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### **🧪 GET /api/profiles/me**
**Purpose**: Get current user profile

```bash
curl -X GET http://localhost:4000/api/profiles/me \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Expected Response**:
```json
{
  "data": {
    "user_id": "uuid",
    "display_name": "Guardian Name",
    "avatar_url": null,
    "role": "guardian",
    "locale": "en",
    "created_at": "timestamp"
  },
  "success": true
}
```

**Test Cases**:
- [ ] Returns 200 with valid token
- [ ] Returns 401 without token
- [ ] Returns 401 with invalid token
- [ ] Returns user data matching authenticated user

---

### **🧪 PATCH /api/profiles/me**
**Purpose**: Update current user profile

```bash
curl -X PATCH http://localhost:4000/api/profiles/me \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "display_name": "Updated Name",
    "locale": "vi"
  }'
```

**Expected Response**:
```json
{
  "data": {
    "user_id": "uuid",
    "display_name": "Updated Name",
    "avatar_url": null,
    "role": "guardian",
    "locale": "vi",
    "created_at": "timestamp"
  },
  "success": true,
  "message": "Profile updated successfully"
}
```

**Test Cases**:
- [ ] Updates display_name successfully
- [ ] Updates locale successfully
- [ ] Validates locale enum values
- [ ] Returns 401 without authentication
- [ ] Returns 400 with invalid data

---

### **🧪 GET /api/children**
**Purpose**: Get children for current guardian

```bash
curl -X GET http://localhost:4000/api/children \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Expected Response**:
```json
{
  "data": [],
  "success": true
}
```

**Test Cases**:
- [ ] Returns empty array for new guardian
- [ ] Returns children array for guardian with children
- [ ] Only returns children belonging to authenticated guardian
- [ ] Returns 401 without authentication

---

### **🧪 POST /api/children**
**Purpose**: Create new child profile

```bash
curl -X POST http://localhost:4000/api/children \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "display_name": "Test Child",
    "birth_year": 2015,
    "locale": "en"
  }'
```

**Expected Response**:
```json
{
  "data": {
    "id": "uuid",
    "guardian_id": "uuid",
    "display_name": "Test Child",
    "avatar_url": null,
    "birth_year": 2015,
    "locale": "en",
    "created_at": "timestamp"
  },
  "success": true,
  "message": "Child profile created successfully"
}
```

**Test Cases**:
- [ ] Creates child with valid data
- [ ] Associates child with authenticated guardian
- [ ] Validates required fields (display_name)
- [ ] Validates birth_year range (2010-2025)
- [ ] Validates locale enum values
- [ ] Returns 401 without authentication

---

### **🧪 PATCH /api/children/:id**
**Purpose**: Update child profile

```bash
# First create a child, then update using its ID
curl -X PATCH http://localhost:4000/api/children/CHILD_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "display_name": "Updated Child Name",
    "birth_year": 2016
  }'
```

**Expected Response**:
```json
{
  "data": {
    "id": "uuid",
    "guardian_id": "uuid",
    "display_name": "Updated Child Name",
    "avatar_url": null,
    "birth_year": 2016,
    "locale": "en",
    "created_at": "timestamp"
  },
  "success": true,
  "message": "Child profile updated successfully"
}
```

**Test Cases**:
- [ ] Updates child data successfully
- [ ] Only allows guardian to update their own children
- [ ] Returns 404 for non-existent child
- [ ] Returns 403 for other guardian's children
- [ ] Validates updated data fields

---

### **🧪 DELETE /api/children/:id**
**Purpose**: Delete child profile

```bash
curl -X DELETE http://localhost:4000/api/children/CHILD_ID \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Child profile deleted successfully"
}
```

**Test Cases**:
- [ ] Deletes child successfully
- [ ] Only allows guardian to delete their own children
- [ ] Returns 404 for non-existent child
- [ ] Returns 403 for other guardian's children
- [ ] Child no longer appears in GET /api/children

## 🛡️ **Security Testing**

### **Row Level Security (RLS) Tests**
1. **Profile Isolation**: User can only access their own profile
2. **Children Isolation**: Guardian can only manage their own children
3. **Content Access**: Published content accessible without auth
4. **Cross-User Access**: Verify users cannot access each other's data

### **Authentication Tests**
1. **No Token**: All protected endpoints return 401
2. **Invalid Token**: Malformed tokens return 401
3. **Expired Token**: Test token expiration handling
4. **Wrong User**: Verify RLS prevents cross-user access

## 📊 **Testing Checklist**

### **Public Endpoints**
- [x] ✅ GET /api/content/test
- [x] ✅ GET /api/content/courses
- [x] ✅ GET /api/content/courses/a1-starters
- [x] ✅ GET /api/content/courses/invalid-slug (404 test)

### **Protected Endpoints**
- [ ] 🧪 GET /api/profiles/me
- [ ] 🧪 PATCH /api/profiles/me
- [ ] 🧪 GET /api/children
- [ ] 🧪 POST /api/children
- [ ] 🧪 PATCH /api/children/:id
- [ ] 🧪 DELETE /api/children/:id

### **Security & Edge Cases**
- [ ] 🧪 Authentication required for protected endpoints
- [ ] 🧪 RLS policy enforcement
- [ ] 🧪 Input validation and error handling
- [ ] 🧪 CORS headers for web app integration

## 🚀 **Next Steps**

1. **Complete Authentication Testing**: Set up test user and JWT token
2. **Automate Testing**: Create test scripts for CI/CD pipeline
3. **Integration Tests**: Test full user workflows end-to-end
4. **Performance Testing**: Load testing for API endpoints

---

**Last Updated**: 2025-08-27  
**Status**: Public endpoints tested ✅, Protected endpoints pending 🧪  
**Next Review**: After Sprint-2 completion
