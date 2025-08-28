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
echo ""
echo "📋 Next steps:"
echo "   1. 🗄️  Create database migration files (if needed):"
echo "      - supabase/migrations/$(printf "%04d" $(($(ls supabase/migrations/ 2>/dev/null | wc -l) + 1)))_sprint${SPRINT_NUM}_[feature].sql"
echo "      - supabase/seed/seed_sprint${SPRINT_NUM}.sql"
echo "   2. 🔧 Start backend development and API implementation"
echo "   3. 📝 Update api-testing-plan.md as you test endpoints"
echo "   4. 🎨 Move to frontend development after API completion"
echo "   5. 🧪 Update ui-testing-plan.md as you test UI scenarios"
echo ""
echo "📚 Resources:"
echo "   - docs/DATABASE-MIGRATION-GUIDE.md for migration help"
echo "   - docs/sprints/templates/ for reference templates"
