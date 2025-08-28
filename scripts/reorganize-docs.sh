#!/bin/bash

# WonderKids Documentation Reorganization Script
# Implements the optimized documentation structure from sprint-workflow.mdc

set -e

echo "🗂️  WonderKids Documentation Reorganization"
echo "============================================"

# Create the new optimized structure
echo "📁 Creating optimized documentation structure..."

# Create new directories
mkdir -p docs/sprints/current-sprint
mkdir -p docs/sprints/archived
mkdir -p docs/sprints/templates

echo "✅ Directory structure created"

# Move existing sprint completion reports to archived folder
echo "📦 Archiving completed sprint documents..."

# Archive Sprint 1
if [ -d "docs/sprints/sprint1-deliverables" ]; then
    mkdir -p docs/sprints/archived/sprint1
    cp docs/sprints/sprint1-deliverables/SPRINT1-COMPLETION.md docs/sprints/archived/sprint1/sprint1-completion.md 2>/dev/null || true
    echo "✅ Sprint 1 archived"
fi

# Archive Sprint 2  
if [ -d "docs/sprints/sprint2-deliverables" ]; then
    mkdir -p docs/sprints/archived/sprint2
    cp docs/sprints/sprint2-deliverables/SPRINT2-COMPLETION.md docs/sprints/archived/sprint2/sprint2-completion.md 2>/dev/null || true
    echo "✅ Sprint 2 archived"
fi

# Clean up old structure (backup first)
echo "🔄 Creating backup of existing structure..."
if [ -d "docs/sprints/sprint1-deliverables" ] || [ -d "docs/sprints/sprint2-deliverables" ]; then
    mkdir -p docs/sprints/.backup
    mv docs/sprints/sprint1-deliverables docs/sprints/.backup/ 2>/dev/null || true
    mv docs/sprints/sprint2-deliverables docs/sprints/.backup/ 2>/dev/null || true
    mv docs/sprints/sprint1.md docs/sprints/.backup/ 2>/dev/null || true
    mv docs/sprints/sprint2.md docs/sprints/.backup/ 2>/dev/null || true
    echo "✅ Old structure backed up to docs/sprints/.backup/"
fi

# Create README for the new structure
cat > docs/sprints/README.md << 'EOF'
# WonderKids Sprint Documentation

## 📁 Optimized Documentation Structure

### **Current Sprint Folder** (`current-sprint/`)
Contains working documents for the active sprint:
- `api-testing-plan.md` - Backend testing plan and results
- `ui-testing-plan.md` - Frontend testing plan and results  
- `sprint-completion.md` - Final sprint completion report

### **Archived Sprints** (`archived/`)
Contains only final completion reports for finished sprints:
- `sprint1/sprint1-completion.md` - Sprint 1 final report
- `sprint2/sprint2-completion.md` - Sprint 2 final report

### **Templates** (`templates/`)
Reusable templates for consistent documentation:
- `api-testing-plan-template.md` - Backend testing template
- `ui-testing-plan-template.md` - Frontend testing template
- `sprint-completion-template.md` - Completion report template

## 🔄 Workflow Integration

This structure supports the **Backend-First Development Workflow**:

1. **Phase 1**: Backend Development & API Testing
   - Use `api-testing-plan-template.md` to create `current-sprint/api-testing-plan.md`
   - Test APIs case-by-case and update document continuously

2. **Phase 2**: Frontend Development & UI Testing  
   - Use `ui-testing-plan-template.md` to create `current-sprint/ui-testing-plan.md`
   - Test UI scenarios and update document continuously

3. **Phase 3**: Sprint Completion
   - Use `sprint-completion-template.md` to create `current-sprint/sprint-completion.md`
   - Archive completed sprint to `archived/sprintN/`

## 📋 Usage

### Start New Sprint
```bash
scripts/new-sprint.sh [sprint-number] [sprint-name]
```

### Archive Completed Sprint  
```bash
scripts/archive-sprint.sh [sprint-number]
```

---

**This structure eliminates documentation redundancy while maintaining comprehensive testing and completion records.**
EOF

echo "✅ Documentation structure README created"

# Create helper scripts
cat > scripts/new-sprint.sh << 'EOF'
#!/bin/bash

# Create new sprint documentation from templates
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <sprint-number> <sprint-name>"
    echo "Example: $0 3 'AI Tutor Integration'"
    exit 1
fi

SPRINT_NUM=$1
SPRINT_NAME=$2
CURRENT_DATE=$(date +%Y-%m-%d)

echo "🚀 Creating Sprint $SPRINT_NUM documentation..."

# Clear current sprint folder
rm -rf docs/sprints/current-sprint/*

# Create API testing plan from template
sed "s/\[N\]/$SPRINT_NUM/g; s/\[Sprint Theme\]/$SPRINT_NAME/g; s/\[YYYY-MM-DD\]/$CURRENT_DATE/g" \
    docs/sprints/templates/api-testing-plan-template.md > \
    docs/sprints/current-sprint/api-testing-plan.md

echo "✅ API testing plan created: docs/sprints/current-sprint/api-testing-plan.md"

# Create UI testing plan from template  
sed "s/\[N\]/$SPRINT_NUM/g; s/\[Sprint Theme\]/$SPRINT_NAME/g; s/\[YYYY-MM-DD\]/$CURRENT_DATE/g" \
    docs/sprints/templates/ui-testing-plan-template.md > \
    docs/sprints/current-sprint/ui-testing-plan.md

echo "✅ UI testing plan created: docs/sprints/current-sprint/ui-testing-plan.md"

echo "🎯 Sprint $SPRINT_NUM setup complete!"
echo "📋 Next steps:"
echo "   1. Start backend development"
echo "   2. Update api-testing-plan.md as you test endpoints"
echo "   3. Move to frontend development after API completion"
echo "   4. Update ui-testing-plan.md as you test UI scenarios"
EOF

cat > scripts/archive-sprint.sh << 'EOF'
#!/bin/bash

# Archive completed sprint
if [ -z "$1" ]; then
    echo "Usage: $0 <sprint-number>"
    echo "Example: $0 3"
    exit 1
fi

SPRINT_NUM=$1

echo "📦 Archiving Sprint $SPRINT_NUM..."

# Create archived sprint folder
mkdir -p docs/sprints/archived/sprint$SPRINT_NUM

# Move completion report to archive
if [ -f "docs/sprints/current-sprint/sprint-completion.md" ]; then
    cp docs/sprints/current-sprint/sprint-completion.md \
       docs/sprints/archived/sprint$SPRINT_NUM/sprint$SPRINT_NUM-completion.md
    echo "✅ Sprint completion report archived"
else
    echo "⚠️  No sprint completion report found in current-sprint/"
fi

# Clean current sprint folder
rm -rf docs/sprints/current-sprint/*

echo "🎉 Sprint $SPRINT_NUM archived successfully!"
echo "📋 Ready for next sprint setup"
EOF

# Make scripts executable
chmod +x scripts/new-sprint.sh
chmod +x scripts/archive-sprint.sh

echo "✅ Helper scripts created and made executable"

# Create .gitkeep for current-sprint folder
touch docs/sprints/current-sprint/.gitkeep

echo ""
echo "🎉 Documentation reorganization complete!"
echo ""
echo "📁 New structure:"
echo "   docs/sprints/current-sprint/     - Active sprint working documents"
echo "   docs/sprints/archived/           - Final reports for completed sprints"  
echo "   docs/sprints/templates/          - Reusable documentation templates"
echo ""
echo "🔧 Available commands:"
echo "   scripts/new-sprint.sh 3 'AI Tutor'     - Start new sprint documentation"
echo "   scripts/archive-sprint.sh 3            - Archive completed sprint"
echo ""
echo "📋 Next steps:"
echo "   1. Review the new structure"
echo "   2. Test the new sprint script for Sprint 3"
echo "   3. Update project rules to reference new paths"
EOF
