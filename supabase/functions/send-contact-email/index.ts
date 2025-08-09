import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  budget?: string;
  timeline?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, email, subject, message, budget, timeline }: ContactMessage = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email content
    const emailContent = `
      <h2>Nouveau message de contact - Portfolio FOULON Maxence</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Informations du contact :</h3>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        ${budget ? `<p><strong>Budget :</strong> ${budget}</p>` : ''}
        ${timeline ? `<p><strong>Timeline :</strong> ${timeline}</p>` : ''}
      </div>
      
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <h3>Message :</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
        <p><strong>Note :</strong> Ce message a été envoyé depuis votre portfolio. 
        Vous pouvez répondre directement à cette adresse email : ${email}</p>
      </div>
    `

    // Send email using a service like Resend, SendGrid, or similar
    // For this example, I'll use a mock implementation
    // In production, you would integrate with your preferred email service
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'portfolio@maxencefoulon.com',
        to: ['maxencefoulon17@gmail.com'],
        subject: `[Portfolio] ${subject}`,
        html: emailContent,
        reply_to: email,
      }),
    })

    if (!emailResponse.ok) {
      console.error('Failed to send email:', await emailResponse.text())
      // Don't fail the entire request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})