
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

    const { paymentData, source } = await req.json()
    console.log('Processing payment:', paymentData)

    // Parse payment data based on source (M-Pesa, KCB, etc.)
    let parsedPayment;
    if (source === 'mpesa') {
      parsedPayment = await processMpesaPayment(paymentData)
    } else if (source === 'kcb') {
      parsedPayment = await processKcbPayment(paymentData)
    } else {
      throw new Error('Unsupported payment source')
    }

    // Store payment transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        amount: parsedPayment.amount,
        payment_method: parsedPayment.method,
        payment_reference: parsedPayment.reference,
        external_transaction_id: parsedPayment.externalId,
        status: 'completed',
        processed_at: new Date().toISOString(),
        metadata: parsedPayment.metadata
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    // Try to match payment to invoice
    const matchedInvoice = await matchPaymentToInvoice(supabase, parsedPayment)
    
    if (matchedInvoice) {
      // Update invoice as paid
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_amount: parsedPayment.amount,
          payment_method: parsedPayment.method,
          payment_reference: parsedPayment.reference,
          paid_at: new Date().toISOString()
        })
        .eq('id', matchedInvoice.id)

      // Send confirmation SMS to tenant
      await sendPaymentConfirmationSMS(supabase, matchedInvoice, parsedPayment)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction: transaction,
        matchedInvoice: matchedInvoice 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processMpesaPayment(data: any) {
  // TODO: Replace with actual M-Pesa API integration
  console.log('Processing M-Pesa payment:', data)
  
  return {
    amount: data.amount || 0,
    method: 'mpesa',
    reference: data.mpesa_receipt_number || data.reference,
    externalId: data.trans_id || data.transaction_id,
    metadata: {
      phone_number: data.msisdn || data.phone,
      account_reference: data.account_reference,
      transaction_desc: data.trans_type || 'M-Pesa Payment'
    }
  }
}

async function processKcbPayment(data: any) {
  // TODO: Replace with actual KCB API integration
  console.log('Processing KCB payment:', data)
  
  return {
    amount: data.amount || 0,
    method: 'kcb',
    reference: data.reference_number || data.reference,
    externalId: data.transaction_id,
    metadata: {
      account_number: data.account_number,
      branch_code: data.branch_code,
      transaction_desc: 'KCB Bank Transfer'
    }
  }
}

async function matchPaymentToInvoice(supabase: any, payment: any) {
  // Try to match by amount and recent invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      tenants(first_name, last_name, phone_number)
    `)
    .eq('amount', payment.amount)
    .in('status', ['sent', 'overdue'])
    .order('created_at', { ascending: false })
    .limit(5)

  if (invoices && invoices.length > 0) {
    // For now, match the most recent invoice with the same amount
    // In production, you'd want more sophisticated matching logic
    return invoices[0]
  }

  return null
}

async function sendPaymentConfirmationSMS(supabase: any, invoice: any, payment: any) {
  if (!invoice.tenants?.phone_number) {
    console.log('No phone number for tenant, skipping SMS')
    return
  }

  const message = `Payment confirmed! KES ${payment.amount} received for invoice ${invoice.id.slice(0, 8)}. Thank you for your payment.`
  
  // Store SMS notification
  await supabase
    .from('sms_notifications')
    .insert({
      tenant_id: invoice.tenants.id,
      phone_number: invoice.tenants.phone_number,
      message: message,
      type: 'payment_confirmation'
    })

  // TODO: Send actual SMS via AfricaTalking
  console.log('Would send SMS to:', invoice.tenants.phone_number, 'Message:', message)
}
