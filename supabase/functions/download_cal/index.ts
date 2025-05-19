// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.2';

console.log("Hello from Functions!")

const supabaseUrl = "https://wxllnzdbcwzydikbqvvu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGxuemRiY3d6eWRpa2JxdnZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAxNDU4MiwiZXhwIjoyMDU2NTkwNTgyfQ.3UFNZ5AreNiENEeohQGv0NHT7aX5RrsWl3jXRxCELX4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const id = req.url.split('/').pop()
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('calendar_files')
    .select('context')
    .eq('id', id)
    .single()

  if (error) {
    console.error('error', error);
    return new Response(JSON.stringify({ error: 'Error generating calendar' }), { status: 500 })
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'No calendar data found' }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    )
  }

  const calendar = data.context
  return new Response(
    calendar,
    { headers: { ...corsHeaders, "Content-Type": "text/calendar" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/download_cal' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
