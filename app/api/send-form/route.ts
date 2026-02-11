import { NextRequest, NextResponse } from 'next/server'

// Resend email service
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string
) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('[v0] RESEND_API_KEY is not configured')
    throw new Error('Email service not configured. Please add RESEND_API_KEY to environment variables.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Destiny Darshan <noreply@destinydarshan.com>',
      to: toEmail,
      subject: subject,
      html: htmlContent,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[v0] Resend API error:', error)
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
  }

  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { name, email, phone, concern, recommendedService, aiReason } = data

    // Validate required fields
    if (!name || !concern || !recommendedService) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create professional HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #F4C21A 0%, #E6B800 100%); color: #1E1E1E; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
      .field { margin-bottom: 15px; }
      .label { font-weight: bold; color: #F4C21A; margin-bottom: 5px; }
      .value { padding: 10px; background: white; border-left: 4px solid #F4C21A; padding-left: 15px; }
      .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; padding-top: 10px; border-top: 1px solid #ddd; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">New Wellness Inquiry</h2>
        <p style="margin: 5px 0 0 0;">From Destiny Darshan Platform</p>
      </div>
      
      <div class="content">
        <div class="field">
          <div class="label">Name</div>
          <div class="value">${name}</div>
        </div>
        
        <div class="field">
          <div class="label">Email</div>
          <div class="value">${email || 'Not provided'}</div>
        </div>
        
        <div class="field">
          <div class="label">Phone</div>
          <div class="value">${phone || 'Not provided'}</div>
        </div>
        
        <div class="field">
          <div class="label">Concern</div>
          <div class="value">${concern}</div>
        </div>
        
        <div class="field">
          <div class="label">Recommended Service</div>
          <div class="value">${recommendedService}</div>
        </div>
        
        ${aiReason ? `
        <div class="field">
          <div class="label">Why This Service</div>
          <div class="value">${aiReason}</div>
        </div>
        ` : ''}
        
        <div class="field">
          <div class="label">Submitted At</div>
          <div class="value">${new Date().toLocaleString('en-US', { timeZone: 'UTC' })}</div>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated email from the Destiny Darshan wellness platform.</p>
        <p>Please reply to this email or contact the user directly at ${email || 'the provided phone number'}.</p>
      </div>
    </div>
  </body>
</html>
    `.trim()

    // Send email to admin
    console.log('[v0] Sending email to destinydarshan@gmail.com')
    await sendEmailViaResend(
      'destinydarshan@gmail.com',
      `New Wellness Inquiry from ${name} - ${recommendedService}`,
      htmlContent
    )

    // Optionally send confirmation email to user
    if (email) {
      const confirmationHtml = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #F4C21A 0%, #E6B800 100%); color: #1E1E1E; padding: 20px; border-radius: 8px; text-align: center; }
      .content { padding: 20px; text-align: center; }
      .button { display: inline-block; background: #F4C21A; color: #1E1E1E; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      .footer { font-size: 12px; color: #666; text-align: center; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">Thank You, ${name}!</h2>
      </div>
      
      <div class="content">
        <p>Thank you for reaching out to Destiny Darshan. We have received your inquiry about <strong>${recommendedService}</strong>.</p>
        
        <p>Our team will review your concerns and get back to you within 24-48 hours to help you on your wellness journey.</p>
        
        <p style="color: #F4C21A; font-weight: bold;">Expected Service: ${recommendedService}</p>
        
        <a href="https://destinydarshan.com" class="button">Visit Our Website</a>
      </div>
      
      <div class="footer">
        <p>If you have any immediate questions, please feel free to reply to this email or contact us on WhatsApp.</p>
        <p>&copy; 2026 Destiny Darshan. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
      `.trim()

      await sendEmailViaResend(
        email,
        'We Received Your Wellness Inquiry - Destiny Darshan',
        confirmationHtml
      )
      console.log('[v0] Confirmation email sent to user')
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Form submitted successfully. We will contact you soon.' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error processing form submission:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
