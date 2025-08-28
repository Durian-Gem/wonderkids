#!/bin/bash

# Sprint 3 Bug Fix Script
# This script helps apply the critical fixes for Sprint 3

echo "🔧 Sprint 3 Bug Fix Script"
echo "=========================="
echo ""

echo "📋 This script will help you fix the critical issues found in Sprint 3:"
echo "   1. Missing database tables and columns"
echo "   2. Component import path aliases"
echo "   3. Stripe environment configuration"
echo ""

echo "🗄️  STEP 1: Apply Database Migration"
echo "-----------------------------------"
echo "You need to execute the SQL migration in your Supabase dashboard:"
echo ""
echo "1. Open your Supabase project dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy and paste the contents of: supabase/fix-sprint3-migration.sql"
echo "4. Click 'Run' to execute the migration"
echo ""
echo "This will fix:"
echo "  ✅ Missing duration_sec column in attempts table"
echo "  ✅ Missing is_premium column in courses table"
echo "  ✅ Missing review_items table for spaced repetition"
echo "  ✅ Missing subscriptions table for billing"
echo "  ✅ Basic views for dashboard analytics"
echo ""

read -p "Press Enter after you've applied the database migration..."

echo ""
echo "🧩 STEP 2: Fix Component Path Aliases"
echo "------------------------------------"
echo "The new Sprint 3 components need proper import path configuration."
echo ""

if [ -f "apps/web/tsconfig.json" ]; then
    echo "✅ Found apps/web/tsconfig.json"

    # Check if paths are already configured
    if grep -q '"@/' apps/web/tsconfig.json; then
        echo "✅ Component path aliases already configured"
    else
        echo "⚠️  Component path aliases need to be added to tsconfig.json"
        echo ""
        echo "Please add this to your apps/web/tsconfig.json compilerOptions:"
        echo ""
        cat << 'EOF'
        "paths": {
          "@/*": ["./src/*"],
          "@/components/*": ["./src/components/*"],
          "@/lib/*": ["./src/lib/*"],
          "@/hooks/*": ["./src/hooks/*"],
          "@/styles/*": ["./src/styles/*"]
        }
EOF
        echo ""
    fi
else
    echo "❌ apps/web/tsconfig.json not found"
fi

echo ""
echo "💳 STEP 3: Configure Stripe Environment (Optional)"
echo "--------------------------------------------------"
echo "For billing functionality, you need to set these environment variables:"
echo ""
echo "In your .env.local file, add:"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "You can get these from your Stripe dashboard."
echo ""

echo ""
echo "🎯 STEP 4: Test the Fixes"
echo "-------------------------"
echo "After applying the fixes, run these tests:"
echo ""
echo "1. Start the servers:"
echo "   yarn dev"
echo ""
echo "2. Test dashboard mastery endpoint:"
echo "   curl -s -X GET 'http://localhost:4000/api/dashboard/mastery?childId=YOUR_CHILD_ID' -H 'Authorization: Bearer YOUR_JWT_TOKEN'"
echo ""
echo "3. Test review queue endpoint:"
echo "   curl -s -X GET 'http://localhost:4000/api/review/queue?childId=YOUR_CHILD_ID' -H 'Authorization: Bearer YOUR_JWT_TOKEN'"
echo ""

echo ""
echo "✅ Sprint 3 bug fixes preparation complete!"
echo "Follow the steps above to resolve all identified issues."
