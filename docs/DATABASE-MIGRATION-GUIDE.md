# WonderKids Database Migration Management Guide

**Comprehensive guide for managing database migrations with MCP Supabase integration**

**Applies to:**
- `supabase/migrations/` - Migration files
- `supabase/seed/` - Seed data files
- Backend development phases in sprint workflow

---

## 🎯 **MIGRATION WORKFLOW OVERVIEW**

### **Dual-Track Approach**
1. **File-Based Tracking**: Save migration files in `supabase/migrations/` for git versioning
2. **MCP Application**: Use MCP Supabase tools to apply migrations to database
3. **Both Required**: Ensure both file tracking AND MCP application happen

### **Migration Naming Convention**
```
supabase/migrations/[XXXX]_sprint[N]_[feature_description].sql

Examples:
- 0002_sprint3_ai_tutor_tables.sql
- 0003_sprint3_conversation_schema.sql
- 0004_sprint3_rls_policies.sql
```

---

## 🗄️ **MIGRATION FILE STRUCTURE**

### **Migration File Template**
```sql
-- Migration: [XXXX]_sprint[N]_[feature_description].sql
-- Sprint: Sprint [N] - [Sprint Theme]
-- Purpose: [Brief description of changes]
-- Created: [YYYY-MM-DD]

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create new tables
CREATE TABLE IF NOT EXISTS [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add your columns here
    [column_name] [data_type] [constraints],
    
    -- Common patterns
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_[table]_[column] ON [table]([column]);
CREATE INDEX IF NOT EXISTS idx_[table]_user_id ON [table](user_id);
CREATE INDEX IF NOT EXISTS idx_[table]_created_at ON [table](created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own [table_name]" ON [table_name]
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own [table_name]" ON [table_name]
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own [table_name]" ON [table_name]
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own [table_name]" ON [table_name]
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_[table]_updated_at 
    BEFORE UPDATE ON [table_name]
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Seed Data File Template**
```sql
-- Seed Data: seed_sprint[N].sql
-- Sprint: Sprint [N] - [Sprint Theme]
-- Purpose: Test data for new features
-- Created: [YYYY-MM-DD]

-- Insert test data
INSERT INTO [table_name] ([columns]) VALUES
    ([values]),
    ([values]),
    ([values]);

-- Update existing data (if needed)
UPDATE [existing_table] 
SET [column] = [value]
WHERE [condition];
```

---

## 🔄 **SPRINT MIGRATION WORKFLOW**

### **Phase 1: Planning & Creation**

#### **1. Analyze Requirements**
- Review sprint requirements for database changes
- Identify new tables, columns, indexes needed
- Plan RLS policies for new data
- Consider existing data impact

#### **2. Create Migration File**
```bash
# Create new migration file with proper numbering
touch supabase/migrations/$(printf "%04d" $(($(ls supabase/migrations/ | wc -l) + 1)))_sprint3_ai_tutor_tables.sql

# Edit migration file with schema changes
code supabase/migrations/[new_file].sql
```

#### **3. Plan Seed Data** (if needed)
```bash
# Create or update seed data file
touch supabase/seed/seed_sprint3.sql

# Add test data for new features
code supabase/seed/seed_sprint3.sql
```

### **Phase 2: Application & Testing**

#### **4. Apply Migration via MCP**
```typescript
// Use MCP Supabase tools in development
await mcp_supabase_apply_migration({
    name: "sprint3_ai_tutor_tables",
    query: `[migration_sql_content]`
});
```

#### **5. Validate Migration**
```bash
# Check tables created
mcp_supabase_list_tables()

# Verify schema structure
mcp_supabase_execute_sql("DESCRIBE [table_name];")

# Test RLS policies
mcp_supabase_execute_sql("SELECT * FROM [table_name];")
```

#### **6. Load Seed Data** (if needed)
```typescript
// Apply seed data via MCP
await mcp_supabase_execute_sql({
    query: `[seed_sql_content]`
});
```

### **Phase 3: Integration & Documentation**

#### **7. Update API Code**
- Modify NestJS services to work with new schema
- Update TypeScript types in `packages/types/`
- Add new DTOs and validation schemas
- Test API endpoints with new database structure

#### **8. Document in Testing Plan**
- Update `current-sprint/api-testing-plan.md`
- Document schema changes and migration status
- Include database integration testing steps
- Track migration application via MCP

---

## 🔧 **MIGRATION BEST PRACTICES**

### **File Management**
- **Sequential Numbering**: Use 4-digit prefixes (0001, 0002, etc.)
- **Descriptive Names**: Include sprint number and feature description
- **Git Tracking**: Always commit migration files to version control
- **Documentation**: Include comments explaining purpose and changes

### **Database Design**
- **UUID Primary Keys**: Use `gen_random_uuid()` for primary keys
- **Timestamps**: Always include `created_at` and `updated_at`
- **Soft Deletes**: Consider using `is_active` instead of hard deletes
- **Foreign Keys**: Properly reference other tables with CASCADE options

### **Security (RLS)**
- **Enable RLS**: Always enable Row Level Security on new tables
- **User Isolation**: Ensure users can only access their own data
- **Least Privilege**: Grant minimum necessary permissions
- **Policy Testing**: Test RLS policies with different user contexts

### **Performance**
- **Strategic Indexes**: Add indexes for common query patterns
- **User-based Indexes**: Index on `user_id` for multi-tenant queries
- **Timestamp Indexes**: Index on `created_at` for time-based queries
- **Composite Indexes**: Consider multi-column indexes for complex queries

---

## 🧪 **TESTING MIGRATIONS**

### **Forward Migration Testing**
```sql
-- Test table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = '[new_table]';

-- Test column structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = '[new_table]';

-- Test indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = '[new_table]';

-- Test RLS policies
SELECT policyname FROM pg_policies 
WHERE tablename = '[new_table]';
```

### **Data Integrity Testing**
```sql
-- Test existing data preservation
SELECT COUNT(*) FROM [existing_table];

-- Test foreign key constraints
INSERT INTO [new_table] (user_id) VALUES ('invalid-uuid');
-- Should fail with foreign key constraint error

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM [new_table];
-- Should only return user's own data
```

### **API Integration Testing**
```bash
# Test API endpoints with new schema
curl -X POST http://localhost:4000/api/new-endpoint \
  -H "Authorization: Bearer [token]" \
  -d '{"field": "value"}'

# Verify data persisted correctly
curl -X GET http://localhost:4000/api/new-endpoint \
  -H "Authorization: Bearer [token]"
```

---

## 📊 **MIGRATION TRACKING**

### **Sprint Migration Checklist**
```markdown
## Sprint [N] Migration Status

### Migration Files
- [ ] `[XXXX]_sprint[N]_[feature].sql` created
- [ ] Migration committed to git
- [ ] Schema changes documented

### MCP Application
- [ ] Migration applied via MCP Supabase tools
- [ ] Tables/columns created successfully
- [ ] Indexes created and optimized
- [ ] RLS policies enabled and tested

### Data Management
- [ ] Seed data file created (if needed)
- [ ] Test data loaded via MCP
- [ ] Existing data preserved
- [ ] Data integrity validated

### API Integration
- [ ] TypeScript types updated
- [ ] NestJS services modified
- [ ] API endpoints tested
- [ ] Error handling validated
```

### **Documentation Updates**
- Update `api-testing-plan.md` with migration status
- Document schema changes in sprint completion report
- Include migration commands in testing documentation
- Track migration numbers for future reference

---

## 🚨 **TROUBLESHOOTING**

### **Common Migration Issues**

#### **1. Migration Numbering Conflicts**
```bash
# Check existing migration numbers
ls -la supabase/migrations/

# Find next available number
echo $(($(ls supabase/migrations/ | wc -l) + 1))

# Rename if conflicts occur
mv supabase/migrations/0003_old.sql supabase/migrations/0004_updated.sql
```

#### **2. RLS Policy Errors**
```sql
-- Debug RLS policies
SELECT * FROM pg_policies WHERE tablename = '[table_name]';

-- Test policy conditions
SELECT auth.uid(); -- Should return current user ID
SELECT * FROM [table_name] WHERE user_id = auth.uid();
```

#### **3. Foreign Key Constraint Violations**
```sql
-- Check foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint WHERE contype = 'f';

-- Verify referenced data exists
SELECT id FROM auth.users LIMIT 5;
```

#### **4. Index Creation Failures**
```sql
-- Check existing indexes
SELECT indexname FROM pg_indexes WHERE tablename = '[table_name]';

-- Drop and recreate if needed
DROP INDEX IF EXISTS idx_[name];
CREATE INDEX idx_[name] ON [table]([column]);
```

---

## 🔮 **ADVANCED PATTERNS**

### **Migration Rollback Strategies**
```sql
-- Include rollback commands in migration files (commented)
/*
-- ROLLBACK COMMANDS (if needed):
-- DROP TABLE IF EXISTS [new_table];
-- ALTER TABLE [existing_table] DROP COLUMN IF EXISTS [new_column];
-- DROP INDEX IF EXISTS idx_[name];
*/
```

### **Data Migration Patterns**
```sql
-- Safe data migration with validation
BEGIN;

-- Create new column
ALTER TABLE [table] ADD COLUMN [new_column] [type];

-- Migrate data with validation
UPDATE [table] 
SET [new_column] = [transformation]
WHERE [condition];

-- Verify migration success
SELECT COUNT(*) FROM [table] WHERE [new_column] IS NULL;
-- Should be 0 if migration complete

COMMIT;
```

### **Performance-Safe Migrations**
```sql
-- Add indexes concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_[name] ON [table]([column]);

-- Large table alterations with minimal downtime
ALTER TABLE [large_table] ADD COLUMN [new_column] [type] DEFAULT [value];
-- Then update in batches if needed
```

---

## ✅ **MIGRATION SUCCESS CRITERIA**

### **Technical Validation**
- [ ] Migration file created with proper naming
- [ ] Migration applied successfully via MCP
- [ ] Database schema matches expectations
- [ ] All constraints and indexes created
- [ ] RLS policies working correctly
- [ ] Seed data loaded (if applicable)

### **Integration Validation**
- [ ] API code updated for new schema
- [ ] TypeScript types updated
- [ ] All tests passing
- [ ] Error handling working
- [ ] Performance acceptable

### **Documentation Validation**
- [ ] Migration documented in testing plan
- [ ] Schema changes explained
- [ ] MCP commands recorded
- [ ] Integration steps documented

---

**This comprehensive migration management ensures both file-based tracking and MCP application work together seamlessly in the Backend-first sprint workflow.**
