// Quick script to apply RLS policies via Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ijrevkbirborknukwaku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmV2a2JpcmJvcmtudWt3YWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTAxOTUsImV4cCI6MjA4OTE2NjE5NX0.1OND3mG-yjqMCFKKecMVNE5Pbz6wURnzo1jxpOZqoLI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  // Try to read events table
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .limit(1);
  
  if (eventsError) {
    console.log('Events table read:', eventsError.message);
  } else {
    console.log('Events table: OK (can read)');
  }
  
  // Try to write to events table
  const { error: insertError } = await supabase
    .from('events')
    .insert([{
      event_type: 'test_connection',
      agent: 'test',
      data: { test: true }
    }]);
  
  if (insertError) {
    console.log('Events table write:', insertError.message);
    console.log('\n⚠️  RLS is blocking writes. You need to apply the migration SQL.');
    console.log('\nGo to: https://supabase.com/dashboard/project/ijrevkbirborknukwaku/sql/new');
    console.log('\nPaste the SQL from: /tmp/hawking-lab-missioncontrol/supabase/migrations/20260315173000_fix_rls_policies.sql');
  } else {
    console.log('Events table: OK (can write)');
    console.log('\n✅ RLS policies are already applied!');
  }
}

testConnection();