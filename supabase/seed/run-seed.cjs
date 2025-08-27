/**
 * Seed script for WonderKids database
 * Runs the seed SQL via Supabase client
 */

const fs = require('fs');
const path = require('path');

async function runSeed() {
  try {
    // Check if we have environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    // Import Supabase dynamically since this is a CJS file
    const { createClient } = await import('@supabase/supabase-js');
    
    // Create client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Read the seed SQL file
    const seedSqlPath = path.join(__dirname, 'seed_sprint1.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    console.log('🌱 Running database seed...');

    // Execute the seed SQL
    const { error } = await supabase.rpc('exec_sql', { sql: seedSql });

    if (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }

    console.log('✅ Database seeded successfully!');
    console.log('📚 Created A1 Starters course with 3 units and 6 lessons');

  } catch (error) {
    console.error('❌ Seed script failed:', error.message);
    process.exit(1);
  }
}

runSeed();
