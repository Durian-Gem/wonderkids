# Sprint [N] API Testing Plan

**Sprint**: Sprint-[N] ([Sprint Theme])  
**Phase**: Backend Development & API Testing  
**Created**: [YYYY-MM-DD]  
**Status**: 🧪 **IN PROGRESS** / ✅ **COMPLETED**

---

## 🗄️ **DATABASE MIGRATION MANAGEMENT**

### **Migration Files Created**
| Migration File | Purpose | Status | Applied via MCP |
|----------------|---------|--------|-----------------|
| `[XXXX]_sprint[N]_[feature].sql` | [Description] | ⏳ PENDING | ⏳ PENDING |

### **Migration Workflow Checklist**
- [ ] **Create Migration File**: `supabase/migrations/[XXXX]_sprint[N]_[feature].sql`
- [ ] **Update Seed Data**: `supabase/seed/seed_sprint[N].sql` (if needed)
- [ ] **Apply via MCP**: Use `mcp_supabase_apply_migration` tool
- [ ] **Test Forward Migration**: Verify tables/columns created correctly
- [ ] **Test Data Integrity**: Ensure existing data preserved
- [ ] **Update API Code**: Modify code to work with new schema
- [ ] **Document Schema Changes**: Update testing plan with new schema

### **Schema Changes Summary**
```sql
-- New Tables
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [column_definitions]
);

-- Modified Tables  
ALTER TABLE [existing_table] 
ADD COLUMN [new_column] [type] [constraints];

-- New Indexes
CREATE INDEX [index_name] ON [table] ([columns]);
```

---

## 🎯 **API Testing Overview**

### **Testing Scope**
- **Database Migrations**: [Number] migration files created and applied
- **New Endpoints**: [Number] new API endpoints
- **Modified Endpoints**: [Number] existing endpoints updated
- **Schema Integration**: API endpoints working with new database schema
- **Authentication**: JWT/Session validation requirements
- **Security**: Input validation, XSS/SQL injection prevention

### **Test Environment Setup**
```bash
# Environment Setup Commands
cd apps/api && yarn start:dev  # API server on :4000
cd apps/web && yarn dev        # Web app on :3000

# Test User Credentials
Email: [test-email]
Password: [test-password]

# Required Environment Variables
SUPABASE_URL=[your-supabase-url]
SUPABASE_SERVICE_ROLE_KEY=[service-key]
JWT_SECRET=[jwt-secret]
```

---

## 📋 **Endpoint Testing Matrix**

| Priority | Method | Endpoint | Auth Required | Expected Status | Error Cases | Test Status |
|----------|--------|----------|---------------|-----------------|-------------|-------------|
| High | POST | `/api/new-endpoint` | ✅ JWT | 201 Created | 400, 401, 403 | ⏳ PENDING |
| High | GET | `/api/existing/:id` | ✅ JWT | 200 OK | 404, 401, 403 | ⏳ PENDING |
| Medium | PUT | `/api/update/:id` | ✅ JWT | 200 OK | 400, 404, 401 | ⏳ PENDING |
| Low | DELETE | `/api/delete/:id` | ✅ JWT | 204 No Content | 404, 401, 403 | ⏳ PENDING |

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

**Generated**: [YYYY-MM-DD]  
**Next Phase**: Frontend Development & UI Testing  
**Estimated Frontend Start**: [YYYY-MM-DD]
