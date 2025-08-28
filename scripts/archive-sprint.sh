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
