import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId, organizationName, phone } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
      phone_number: phone
    })
    .select()
    .single()

  // Create team member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner'
    })

  return new Response(JSON.stringify({ success: true, organization: org }))
})