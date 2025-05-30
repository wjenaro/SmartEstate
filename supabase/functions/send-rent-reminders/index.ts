
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // TODO: Replace with actual AfricaTalking credentials
    const AT_API_KEY = Deno.env.get('AFRICATALKING_API_KEY') ?? 'DUMMY_AT_API_KEY_REPLACE_ME'
    const AT_USERNAME = Deno.env.get('AFRICATALKING_USERNAME') ?? 'DUMMY_AT_USERNAME_REPLACE_ME'

    console.log('Starting rent reminder process...')

    // Get overdue and due soon invoices
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select(`
        *,
        tenants(first_name, last_name, phone_number),
        properties(name)
      `)
      .eq('status', 'overdue')
      .not('tenants.phone_number', 'is', null)

    const { data: dueSoonInvoices } = await supabase
      .from('invoices')
      .select(`
        *,
        tenants(first_name, last_name, phone_number),
        properties(name)
      `)
      .eq('status', 'sent')
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])
      .not('tenants.phone_number', 'is', null)

    console.log(`Found ${overdueInvoices?.length || 0} overdue and ${dueSoonInvoices?.length || 0} due soon invoices`)

    let sentCount = 0

    // Send overdue reminders
    if (overdueInvoices) {
      for (const invoice of overdueInvoices) {
        const message = `OVERDUE RENT: Hi ${invoice.tenants.first_name}, your rent of KES ${invoice.amount} for ${invoice.properties.name} was due on ${invoice.due_date}. Please pay to avoid penalties. Reference: ${invoice.id.slice(0, 8)}`
        
        const sent = await sendSMS(AT_API_KEY, AT_USERNAME, invoice.tenants.phone_number, message)
        
        if (sent) {
          await logSMSNotification(supabase, invoice, message, 'rent_reminder')
          sentCount++
        }
      }
    }

    // Send due soon reminders
    if (dueSoonInvoices) {
      for (const invoice of dueSoonInvoices) {
        const message = `RENT REMINDER: Hi ${invoice.tenants.first_name}, your rent of KES ${invoice.amount} for ${invoice.properties.name} is due on ${invoice.due_date}. Please pay on time. Reference: ${invoice.id.slice(0, 8)}`
        
        const sent = await sendSMS(AT_API_KEY, AT_USERNAME, invoice.tenants.phone_number, message)
        
        if (sent) {
          await logSMSNotification(supabase, invoice, message, 'rent_reminder')
          sentCount++
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${sentCount} rent reminders` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Rent reminder error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function sendSMS(apiKey: string, username: string, phoneNumber: string, message: string) {
  try {
    // TODO: Replace with actual AfricaTalking API call
    if (apiKey === 'DUMMY_AT_API_KEY_REPLACE_ME') {
      console.log('DEMO SMS - Would send to:', phoneNumber, 'Message:', message)
      return true
    }

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        username: username,
        to: phoneNumber,
        message: message
      })
    })

    const result = await response.json()
    console.log('SMS API Response:', result)
    
    return result.SMSMessageData?.Recipients?.[0]?.status === 'Success'
  } catch (error) {
    console.error('SMS sending error:', error)
    return false
  }
}

async function logSMSNotification(supabase: any, invoice: any, message: string, type: string) {
  await supabase
    .from('sms_notifications')
    .insert({
      tenant_id: invoice.tenants.id,
      phone_number: invoice.tenants.phone_number,
      message: message,
      type: type,
      status: 'sent',
      sent_at: new Date().toISOString()
    })
}
