#!/bin/bash

# WonderKids Sprint Documentation Generator
# Usage: ./scripts/create-sprint-docs.sh <sprint-number> <sprint-theme>
# Example: ./scripts/create-sprint-docs.sh 2 "Progress & Gamification"

set -e

# Check if sprint number is provided
if [ -z "$1" ]; then
  echo "❌ Error: Sprint number is required"
  echo "Usage: ./scripts/create-sprint-docs.sh <sprint-number> <sprint-theme>"
  echo "Example: ./scripts/create-sprint-docs.sh 2 \"Progress & Gamification\""
  exit 1
fi

# Check if sprint theme is provided
if [ -z "$2" ]; then
  echo "❌ Error: Sprint theme is required"
  echo "Usage: ./scripts/create-sprint-docs.sh <sprint-number> <sprint-theme>"
  echo "Example: ./scripts/create-sprint-docs.sh 2 \"Progress & Gamification\""
  exit 1
fi

SPRINT_NUMBER=$1
SPRINT_THEME=$2
SPRINT_DIR="docs/sprints/sprint${SPRINT_NUMBER}-deliverables"
DATE=$(date +%Y-%m-%d)

echo "🚀 Creating Sprint-${SPRINT_NUMBER} documentation..."
echo "📋 Theme: ${SPRINT_THEME}"
echo "📅 Date: ${DATE}"

# Create sprint deliverables directory
mkdir -p "${SPRINT_DIR}"

# Generate Sprint Completion Report
cat > "${SPRINT_DIR}/SPRINT${SPRINT_NUMBER}-COMPLETION.md" << EOF
# Sprint-${SPRINT_NUMBER} Completion Report
**WonderKids English Learning Platform**

## 📊 **Sprint Overview**
- **Sprint**: Sprint-${SPRINT_NUMBER} (${SPRINT_THEME})
- **Completion Date**: ${DATE}
- **Status**: 🧪 **IN PROGRESS**
- **Team**: Solo Development
- **Duration**: 1 Sprint

## 🎯 **Sprint Goals Achieved**

### ✅ **Primary Objectives**
- [ ] Goal 1: [To be filled during development]
- [ ] Goal 2: [To be filled during development]
- [ ] Goal 3: [To be filled during development]

### ✅ **Secondary Objectives**
- [ ] Nice-to-have 1: [To be filled during development]
- [ ] Nice-to-have 2: [To be filled during development]

## 🏗️ **Technical Implementation**

### **New Features Implemented**
- **Feature 1**: [Description and technical details]
- **Feature 2**: [Description and technical details]

### **API Changes**
| Method | Endpoint | Description | Status | Test Status |
|--------|----------|-------------|---------|-------------|
| POST | \`/api/new-endpoint\` | [Description] | 🧪 | 🧪 |

### **Database Changes**
- **New Tables**: [List new tables]
- **Schema Updates**: [List schema changes]
- **Migrations Applied**: [List migration files]

### **Frontend Changes**
- **New Pages**: [List new routes]
- **Component Updates**: [Major UI changes]
- **State Management**: [New stores or queries]

## 🧪 **API Testing Results**

### **✅ New Endpoints**
\`\`\`bash
# Example test commands - update with actual endpoints
curl -X GET http://localhost:4000/api/new-endpoint
# Expected: Success response

curl -X POST http://localhost:4000/api/protected-endpoint \\
  -H 'Authorization: Bearer TOKEN'
# Expected: Authenticated response
\`\`\`

### **🧪 Updated Endpoints**
- [ ] Existing endpoint changes tested
- [ ] Backward compatibility verified
- [ ] Error handling improved

## 📈 **Quality Metrics**

### **Code Quality**
- [ ] TypeScript strict mode maintained
- [ ] ESLint rules passing
- [ ] No console errors
- [ ] Test coverage maintained/improved

### **Security**
- [ ] RLS policies updated
- [ ] Authentication flows tested
- [ ] Input validation implemented
- [ ] No data leakage confirmed

## 🎯 **Acceptance Criteria**

### **Sprint-${SPRINT_NUMBER} Acceptance Checklist**
- [ ] Primary goal 1 completed ✅/❌
- [ ] Primary goal 2 completed ✅/❌
- [ ] Primary goal 3 completed ✅/❌
- [ ] All new APIs tested and documented ✅/❌
- [ ] Frontend integration working ✅/❌
- [ ] Security policies verified ✅/❌

## 📊 **Final Status**

**Sprint-${SPRINT_NUMBER} Goal**: ${SPRINT_THEME}  
**Status**: [COMPLETED/PARTIAL/BLOCKED]  
**Quality**: [HIGH/MEDIUM/LOW]  
**Readiness for Next Sprint**: [READY/NEEDS WORK/BLOCKED]

---

**Generated**: ${DATE}  
**Sprint Lead**: AI Assistant  
**Next Sprint**: Sprint-$((SPRINT_NUMBER + 1)) ([Next Theme])
EOF

# Generate API Testing Guide
cat > "${SPRINT_DIR}/API-TESTING-GUIDE.md" << EOF
# API Testing Guide - Sprint ${SPRINT_NUMBER}
**WonderKids English Learning Platform**

## 🎯 **Testing Overview**
This document provides comprehensive testing for all API endpoints implemented in Sprint-${SPRINT_NUMBER}. All tests should be run against the development server at \`http://localhost:4000\`.

## 🔧 **Setup Requirements**

### **Start the API Server**
\`\`\`bash
yarn dev:api
# Server should start on http://localhost:4000
# Swagger docs available at http://localhost:4000/docs
\`\`\`

### **Verify Server Health**
\`\`\`bash
curl http://localhost:4000/api/content/test
# Expected: {"message":"API is working","timestamp":"..."}
\`\`\`

## 📡 **New Endpoints (Sprint-${SPRINT_NUMBER})**

### **🧪 [METHOD] /api/new-endpoint**
**Purpose**: [Description of endpoint purpose]

\`\`\`bash
curl -X [METHOD] http://localhost:4000/api/new-endpoint
\`\`\`

**Expected Response**:
\`\`\`json
{
  "data": "[Expected data structure]",
  "success": true
}
\`\`\`

**Test Cases**:
- [ ] Returns 200 status code
- [ ] Returns expected data structure
- [ ] Handles authentication if required
- [ ] Validates input parameters
- [ ] Returns appropriate error responses

## 🛡️ **Security Testing**

### **Authentication Tests**
- [ ] Protected endpoints require valid JWT
- [ ] Invalid tokens return 401
- [ ] RLS policies enforced
- [ ] Cross-user access prevented

### **Input Validation**
- [ ] Required fields validated
- [ ] Data types enforced
- [ ] Malicious input rejected
- [ ] SQL injection prevented

## 📊 **Testing Checklist**

### **New Endpoints (Sprint-${SPRINT_NUMBER})**
- [ ] 🧪 [METHOD] /api/endpoint1
- [ ] 🧪 [METHOD] /api/endpoint2
- [ ] 🧪 [METHOD] /api/endpoint3

### **Updated Endpoints**
- [ ] 🔄 Previously tested endpoints still working
- [ ] 🔄 Backward compatibility maintained
- [ ] 🔄 Performance not degraded

### **Integration Tests**
- [ ] 🔗 Frontend integration working
- [ ] 🔗 Database operations successful
- [ ] 🔗 Authentication flow complete

## 🚀 **Next Steps**

1. **Complete New Endpoint Testing**: Test all Sprint-${SPRINT_NUMBER} endpoints
2. **Regression Testing**: Verify existing functionality
3. **Performance Testing**: Check response times
4. **Security Audit**: Verify all security measures

---

**Last Updated**: ${DATE}  
**Status**: New endpoints pending testing 🧪  
**Next Review**: After Sprint-${SPRINT_NUMBER} completion
EOF

echo "✅ Sprint-${SPRINT_NUMBER} documentation created successfully!"
echo ""
echo "📁 Created files:"
echo "   📄 ${SPRINT_DIR}/SPRINT${SPRINT_NUMBER}-COMPLETION.md"
echo "   📄 ${SPRINT_DIR}/API-TESTING-GUIDE.md"
echo ""
echo "📝 Next steps:"
echo "   1. Update the completion report as you implement features"
echo "   2. Document and test all new API endpoints"
echo "   3. Update sprint status when complete"
echo ""
echo "🚀 Happy coding on Sprint-${SPRINT_NUMBER}: ${SPRINT_THEME}!"
