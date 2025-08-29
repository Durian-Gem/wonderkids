# Sprint 4 API Testing Plan

**Sprint**: Sprint-4 (AI Tutor, Pronunciation v1, Offline PWA, Weekly Email)  
**Phase**: Backend Development & API Testing  
**Created**: 2025-01-15  
**Status**: 🧪 **IN PROGRESS**

---

## 🗄️ **DATABASE MIGRATION MANAGEMENT**

### **Migration Files Created**
| Migration File | Purpose | Status | Applied via MCP |
|----------------|---------|--------|-----------------|
| `0005_tutor_pronunciation_pwa_email.sql` | AI tutor sessions, speech attempts, content packs, email jobs | ✅ COMPLETED | ✅ COMPLETED |

### **Migration Workflow Checklist**
- [x] **Create Migration File**: `supabase/migrations/0005_tutor_pronunciation_pwa_email.sql`
- [ ] **Update Seed Data**: `supabase/seed/seed_sprint4.sql` (not needed for Sprint 4)
- [x] **Apply via MCP**: Used `mcp_supabase_apply_migration` tool successfully
- [x] **Test Forward Migration**: Tables created correctly (ai_sessions, ai_messages, speech_attempts, content_packs, email_jobs)
- [x] **Test Data Integrity**: Existing data preserved
- [x] **Update API Code**: All modules implemented and integrated
- [x] **Document Schema Changes**: Schema documented below

### **Schema Changes Summary**
```sql
-- AI Tutor Tables
CREATE TABLE app.ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  child_id UUID REFERENCES app.children ON DELETE CASCADE,
  topic TEXT,
  provider TEXT DEFAULT 'anthropic',
  system_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE app.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES app.ai_sessions ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user','assistant','system')) NOT NULL,
  content TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pronunciation Tables
CREATE TABLE app.speech_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  child_id UUID REFERENCES app.children ON DELETE CASCADE,
  lesson_id UUID REFERENCES app.lessons ON DELETE CASCADE,
  activity_id UUID REFERENCES app.activities ON DELETE CASCADE,
  question_id UUID REFERENCES app.questions ON DELETE CASCADE,
  audio_path TEXT NOT NULL,
  words_total INT,
  words_correct INT,
  accuracy NUMERIC,
  fluency_score NUMERIC,
  pron_score NUMERIC,
  wpm NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PWA Content Packs
CREATE TABLE app.content_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT false
);

-- Email Queue
CREATE TABLE app.email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('weekly_summary')),
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Storage Bucket for Recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings','recordings', false);

-- Performance Indexes
CREATE INDEX idx_ai_sessions_user_child ON app.ai_sessions(user_id, child_id);
CREATE INDEX idx_ai_messages_session ON app.ai_messages(session_id);
CREATE INDEX idx_speech_attempts_child_lesson ON app.speech_attempts(child_id, lesson_id);
CREATE INDEX idx_email_jobs_status_scheduled ON app.email_jobs(status, scheduled_at);
CREATE INDEX idx_content_packs_published ON app.content_packs(is_published) WHERE is_published = true;
```

---

## 🎯 **API Testing Overview**

### **Testing Scope**
- **Database Migrations**: 1 migration file created and applied (0005_tutor_pronunciation_pwa_email.sql)
- **New Endpoints**: 14 new API endpoints across 4 modules
- **Modified Endpoints**: 0 existing endpoints updated
- **Schema Integration**: All endpoints integrated with new database schema
- **Authentication**: JWT validation required for protected endpoints
- **Security**: Input validation, content filtering, PII protection for AI tutor
- **Cron Jobs**: Weekly email scheduling and processing
- **File Storage**: Audio recording upload and management

### **Test Environment Setup**
```bash
# Environment Setup Commands
cd apps/api && yarn start:dev  # API server on :4000
cd apps/web && yarn dev        # Web app on :3000

# Test User Credentials (use project test user)
Email: test@wonderkids.edu
Password: testpassword123
User ID: [UUID from database]

# Required Environment Variables
SUPABASE_URL=[your-supabase-url]
SUPABASE_SERVICE_ROLE_KEY=[service-key]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Sprint 4 Specific Environment Variables
EMAIL_PROVIDER=mock                    # mock/resend/smtp
RESEND_API_KEY=[resend-key]           # if using Resend
SMTP_HOST=[smtp-host]                 # if using SMTP
SMTP_PORT=587                         # if using SMTP
SMTP_USER=[smtp-user]                 # if using SMTP
SMTP_PASS=[smtp-pass]                 # if using SMTP
EMAIL_FROM="WonderKids <hello@wonderkids.edu>"
TIMEZONE=Asia/Bangkok
```

---

## 📋 **Endpoint Testing Matrix**

| Priority | Method | Endpoint | Auth Required | Expected Status | Error Cases | Test Status |
|----------|--------|----------|---------------|-----------------|-------------|-------------|
| **AI TUTOR MODULE** ||||||||
| High | POST | `/tutor/sessions` | ✅ JWT | 201 Created | 400, 401, 403 | ⏳ PENDING |
| High | POST | `/tutor/sessions/:id/messages` | ✅ JWT | 201 Created | 400, 401, 403, 404 | ⏳ PENDING |
| High | GET | `/tutor/sessions/:id` | ✅ JWT | 200 OK | 401, 403, 404 | ⏳ PENDING |
| Medium | GET | `/tutor/sessions` | ✅ JWT | 200 OK | 401, 403 | ⏳ PENDING |
| **PRONUNCIATION MODULE** ||||||||
| High | POST | `/pronunciation/attempts` | ✅ JWT | 201 Created | 400, 401, 403, 404 | ⏳ PENDING |
| High | GET | `/pronunciation/attempts` | ✅ JWT | 200 OK | 401, 403 | ⏳ PENDING |
| Medium | GET | `/pronunciation/attempts/:id` | ✅ JWT | 200 OK | 401, 403, 404 | ⏳ PENDING |
| **PWA MODULE** ||||||||
| High | GET | `/pwa/packs` | ❌ Public | 200 OK | 500 | ⏳ PENDING |
| Medium | GET | `/pwa/packs/:code` | ❌ Public | 200 OK | 404, 500 | ⏳ PENDING |
| Low | POST | `/pwa/admin/packs` | ✅ JWT | 201 Created | 400, 401, 409 | ⏳ PENDING |
| Low | PUT | `/pwa/admin/packs/:id` | ✅ JWT | 200 OK | 400, 401, 404 | ⏳ PENDING |
| Low | DELETE | `/pwa/admin/packs/:id` | ✅ JWT | 200 OK | 401, 404 | ⏳ PENDING |
| Low | GET | `/pwa/admin/packs` | ✅ JWT | 200 OK | 401 | ⏳ PENDING |
| Low | POST | `/pwa/admin/generate-samples` | ✅ JWT | 201 Created | 401 | ⏳ PENDING |
| **EMAIL MODULE** ||||||||
| Medium | POST | `/email/send-weekly-now` | ✅ JWT | 201 Created | 401, 404 | ⏳ PENDING |

**Status Legend**: ⏳ PENDING | 🧪 TESTING | ✅ PASS | ❌ FAIL | 🔧 FIXING

---

## 🧪 **Detailed Test Cases**

### **Test Case 1: [Endpoint Name]**
**Priority**: High/Medium/Low  
**Method**: POST/GET/PUT/DELETE  
**URL**: `/api/endpoint-path`  
**Authentication**: Required/Optional  

#### **Input Requirements**
```json
{
  "field1": "value1",
  "field2": "value2",
  "nested": {
    "subfield": "value"
  }
}
```

#### **Expected Response**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "field1": "value1",
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

#### **Test Commands**
```bash
# Success Case
curl -X POST http://localhost:4000/api/endpoint-path \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -d '[REQUEST_BODY]'

# Expected Response: 201 Created
```

#### **Error Scenarios**
| Error Type | Input | Expected Status | Expected Response |
|------------|-------|-----------------|-------------------|
| Missing Auth | No Authorization header | 401 | `{"error": "Unauthorized"}` |
| Invalid Input | Invalid JSON | 400 | `{"error": "Validation failed"}` |
| Resource Not Found | Non-existent ID | 404 | `{"error": "Resource not found"}` |

#### **Security Tests**
```bash
# SQL Injection Test
curl -X GET "http://localhost:4000/api/endpoint/'; DROP TABLE users; --"
# Expected: 400 Bad Request (Invalid UUID format)

# XSS Test  
curl -X POST http://localhost:4000/api/endpoint \
  -d '{"field": "<script>alert(\"xss\")</script>"}'
# Expected: Input sanitized or 400 Bad Request
```

#### **Test Results**
- **Status**: ⏳ PENDING / 🧪 TESTING / ✅ PASS / ❌ FAIL
- **Last Tested**: [YYYY-MM-DD HH:MM]
- **Issues Found**: [List any issues discovered]
- **Resolution Notes**: [How issues were fixed]

---

## 🔒 **Security Testing Checklist**

### **Authentication Testing**
- [ ] JWT token validation works correctly
- [ ] Invalid tokens return 401 Unauthorized
- [ ] Expired tokens are rejected
- [ ] Token extraction from Authorization header

### **Authorization Testing**
- [ ] Users can only access their own data
- [ ] Admin endpoints require admin privileges
- [ ] Child data access restricted to guardians
- [ ] Cross-user data access prevented

### **Input Validation Testing**
- [ ] Required fields validation
- [ ] Data type validation (string, number, UUID)
- [ ] Input length limits enforced
- [ ] Special character handling
- [ ] SQL injection prevention
- [ ] XSS attack prevention

### **Error Handling Testing**
- [ ] Consistent error response format
- [ ] Appropriate HTTP status codes
- [ ] No sensitive data in error messages
- [ ] Graceful handling of database errors

---

## 🚀 **Integration Testing**

### **End-to-End Flow Test**
**Scenario**: [Describe complete user flow]

```bash
#!/bin/bash
# Complete flow test script

echo "🔍 Step 1: [Description]"
RESPONSE1=$(curl -s [COMMAND])
echo "✅ Step 1 completed"

echo "🔍 Step 2: [Description]"  
RESPONSE2=$(curl -s [COMMAND])
echo "✅ Step 2 completed"

echo "🎉 Integration test successful!"
```

### **Database Integration**
- [ ] **Migration Files Created**: All migrations saved to `supabase/migrations/`
- [ ] **Migrations Applied via MCP**: Used MCP Supabase tools for application
- [ ] **Schema Validation**: New tables/columns created correctly
- [ ] **Seed Data Updated**: New test data loaded in `supabase/seed/`
- [ ] **Data Integrity**: Existing data preserved during migration
- [ ] **RLS Policies**: Row Level Security updated for new tables
- [ ] **Foreign Keys**: Relationships maintained and constraints enforced
- [ ] **API Integration**: Endpoints working with new schema

---

## 📊 **Performance Testing**

### **Response Time Benchmarks**
| Endpoint | Expected Time | Actual Time | Status |
|----------|---------------|-------------|--------|
| GET /simple | <100ms | [TBD] | ⏳ |
| POST /complex | <500ms | [TBD] | ⏳ |
| PUT /update | <300ms | [TBD] | ⏳ |

### **Load Testing**
```bash
# Concurrent request test
for i in {1..10}; do
  curl -w "Response time: %{time_total}s\n" -o /dev/null -s \
    "http://localhost:4000/api/endpoint" &
done
wait
```

---

## 🐛 **Issues Tracking**

### **Critical Issues** ❌
| Issue ID | Description | Endpoint | Status | Resolution |
|----------|-------------|----------|--------|------------|
| API-001 | [Issue description] | `/api/endpoint` | Open | [Fix notes] |

### **Medium Issues** ⚠️
| Issue ID | Description | Endpoint | Status | Resolution |
|----------|-------------|----------|--------|------------|
| API-002 | [Issue description] | `/api/endpoint` | Fixed | [Fix notes] |

### **Low Issues** ℹ️
| Issue ID | Description | Endpoint | Status | Resolution |
|----------|-------------|----------|--------|------------|
| API-003 | [Issue description] | `/api/endpoint` | Won't Fix | [Reasoning] |

---

## ✅ **API Testing Completion Checklist**

### **Migration & Schema Coverage**
- [ ] All migration files created and tracked in git
- [ ] All migrations applied via MCP and working
- [ ] Database schema matches API implementation
- [ ] Seed data updated and loaded successfully

### **Endpoint Coverage**
- [ ] All new endpoints tested and documented
- [ ] All modified endpoints re-tested
- [ ] Error scenarios covered for each endpoint
- [ ] Performance benchmarks met

### **Security Validation**
- [ ] Authentication testing completed
- [ ] Authorization testing completed  
- [ ] Input validation testing completed
- [ ] Security vulnerability scan passed

### **Integration Validation**
- [ ] End-to-end flow testing completed
- [ ] Database integration verified
- [ ] Cross-module integration tested
- [ ] External service integration validated

### **Documentation**
- [ ] All test results documented
- [ ] Issues logged and tracked
- [ ] Resolution notes updated
- [ ] API documentation updated

---

## 🎯 **Phase Completion Status**

**Backend Development Phase**: [IN PROGRESS / COMPLETED]

### **Success Criteria**
- ✅/❌ All endpoints implemented and tested
- ✅/❌ Security validation completed
- ✅/❌ Performance benchmarks met
- ✅/❌ Integration testing passed
- ✅/❌ Documentation updated

### **Transition to Frontend Phase**
- [ ] All critical API issues resolved
- [ ] API testing documentation completed
- [ ] Backend development freeze
- [ ] Frontend team can begin integration

---

**Generated**: 2025-08-29  
**Next Phase**: Frontend Development & UI Testing  
**Estimated Frontend Start**: 2025-08-29
