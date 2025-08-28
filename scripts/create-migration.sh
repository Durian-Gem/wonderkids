#!/bin/bash

# Create new database migration file with proper numbering and template

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <sprint-number> <feature-description>"
    echo "Example: $0 3 ai_tutor_tables"
    exit 1
fi

SPRINT_NUM=$1
FEATURE_DESC=$2
CURRENT_DATE=$(date +%Y-%m-%d)

# Get next migration number
MIGRATION_DIR="supabase/migrations"
if [ ! -d "$MIGRATION_DIR" ]; then
    echo "⚠️  Migration directory not found: $MIGRATION_DIR"
    echo "Creating migration directory..."
    mkdir -p "$MIGRATION_DIR"
fi

# Calculate next number
NEXT_NUM=$(printf "%04d" $(($(ls $MIGRATION_DIR 2>/dev/null | wc -l) + 1)))
MIGRATION_FILE="${MIGRATION_DIR}/${NEXT_NUM}_sprint${SPRINT_NUM}_${FEATURE_DESC}.sql"

echo "🗄️  Creating database migration..."
echo "   File: $MIGRATION_FILE"

# Create migration file with template
cat > "$MIGRATION_FILE" << EOF
-- Migration: ${NEXT_NUM}_sprint${SPRINT_NUM}_${FEATURE_DESC}.sql
-- Sprint: Sprint ${SPRINT_NUM} - [Sprint Theme]
-- Purpose: [Brief description of changes]
-- Created: ${CURRENT_DATE}

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create new tables
CREATE TABLE IF NOT EXISTS [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add your columns here
    -- [column_name] [data_type] [constraints],
    
    -- Common patterns
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Create indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_[table]_[column] ON [table]([column]);
-- CREATE INDEX IF NOT EXISTS idx_[table]_user_id ON [table](user_id);
-- CREATE INDEX IF NOT EXISTS idx_[table]_created_at ON [table](created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
-- ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- CREATE POLICY "Users can view their own [table_name]" ON [table_name]
--     FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own [table_name]" ON [table_name]
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own [table_name]" ON [table_name]
--     FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own [table_name]" ON [table_name]
--     FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update timestamp trigger
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS \$\$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- \$\$ language 'plpgsql';

-- CREATE TRIGGER update_[table]_updated_at 
--     BEFORE UPDATE ON [table_name]
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROLLBACK COMMANDS (if needed)
-- ============================================================================

/*
-- ROLLBACK COMMANDS:
-- DROP TRIGGER IF EXISTS update_[table]_updated_at ON [table_name];
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS [table_name];
*/
EOF

echo "✅ Migration file created: $MIGRATION_FILE"

# Optionally create seed data file
SEED_FILE="supabase/seed/seed_sprint${SPRINT_NUM}.sql"
if [ ! -f "$SEED_FILE" ]; then
    echo ""
    echo "🌱 Creating seed data file..."
    
    # Create seed directory if it doesn't exist
    mkdir -p "supabase/seed"
    
    cat > "$SEED_FILE" << EOF
-- Seed Data: seed_sprint${SPRINT_NUM}.sql
-- Sprint: Sprint ${SPRINT_NUM} - [Sprint Theme]
-- Purpose: Test data for new features
-- Created: ${CURRENT_DATE}

-- Insert test data
-- INSERT INTO [table_name] ([columns]) VALUES
--     ([values]),
--     ([values]),
--     ([values]);

-- Update existing data (if needed)
-- UPDATE [existing_table] 
-- SET [column] = [value]
-- WHERE [condition];
EOF
    
    echo "✅ Seed data file created: $SEED_FILE"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Edit migration file: $MIGRATION_FILE"
echo "   2. Update seed data file: $SEED_FILE (if needed)"
echo "   3. Apply migration via MCP Supabase tools:"
echo "      - mcp_supabase_apply_migration(name: 'sprint${SPRINT_NUM}_${FEATURE_DESC}', query: '...')"
echo "   4. Update docs/sprints/current-sprint/api-testing-plan.md"
echo "   5. Test database integration with API endpoints"
echo ""
echo "📚 See docs/DATABASE-MIGRATION-GUIDE.md for detailed guidance"
EOF

# Make script executable
chmod +x scripts/create-migration.sh

echo "✅ Migration creation script updated with template support"
