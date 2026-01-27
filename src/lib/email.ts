import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'RentPulse <noreply@rentpulse.app>'

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your RentPulse account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #22d3ee; margin-bottom: 24px; font-size: 24px;">Welcome to RentPulse!</h1>
            <p style="margin-bottom: 24px; line-height: 1.6;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <a href="${verifyUrl}" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Verify Email</a>
            <p style="margin-top: 24px; color: #94a3b8; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your RentPulse password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #22d3ee; margin-bottom: 24px; font-size: 24px;">Password Reset Request</h1>
            <p style="margin-bottom: 24px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset Password</a>
            <p style="margin-top: 24px; color: #94a3b8; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendLeaseExpirationReminder(
  email: string,
  tenantName: string,
  propertyAddress: string,
  daysUntilExpiration: number,
  leaseEndDate: string
) {
  const urgencyColor = daysUntilExpiration <= 7 ? '#ef4444' : daysUntilExpiration <= 30 ? '#f59e0b' : '#22d3ee'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Lease Expiration Alert: ${tenantName} - ${daysUntilExpiration} days remaining`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: ${urgencyColor}; margin-bottom: 24px; font-size: 24px;">Lease Expiration Alert</h1>
            <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Tenant:</strong> ${tenantName}</p>
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Property:</strong> ${propertyAddress}</p>
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Lease End Date:</strong> ${leaseEndDate}</p>
              <p style="margin: 0; font-size: 18px; color: ${urgencyColor};"><strong>${daysUntilExpiration} days remaining</strong></p>
            </div>
            <p style="margin-bottom: 24px; line-height: 1.6;">Consider reaching out to your tenant to discuss lease renewal options.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/leases" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Leases</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendMaintenanceReminder(
  email: string,
  itemTitle: string,
  propertyAddress: string,
  dueDate: string,
  isOverdue: boolean
) {
  const statusColor = isOverdue ? '#ef4444' : '#f59e0b'
  const statusText = isOverdue ? 'Overdue' : 'Due Soon'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Maintenance ${statusText}: ${itemTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: ${statusColor}; margin-bottom: 24px; font-size: 24px;">Maintenance ${statusText}</h1>
            <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Task:</strong> ${itemTitle}</p>
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Property:</strong> ${propertyAddress}</p>
              <p style="margin: 0;"><strong style="color: #94a3b8;">Due Date:</strong> <span style="color: ${statusColor};">${dueDate}</span></p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/maintenance" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Maintenance</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendPaymentReminder(
  email: string,
  tenantName: string,
  propertyAddress: string,
  amount: number,
  dueDate: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Payment Reminder: ${tenantName} - $${amount.toFixed(2)} due`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #f59e0b; margin-bottom: 24px; font-size: 24px;">Payment Reminder</h1>
            <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Tenant:</strong> ${tenantName}</p>
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Property:</strong> ${propertyAddress}</p>
              <p style="margin: 0 0 12px 0;"><strong style="color: #94a3b8;">Amount Due:</strong> <span style="font-size: 18px; color: #22d3ee;">$${amount.toFixed(2)}</span></p>
              <p style="margin: 0;"><strong style="color: #94a3b8;">Due Date:</strong> ${dueDate}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/payments" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Payments</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendPremiumGrantedEmail(email: string, userName: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Premium Access Granted - RentPulse',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #22d3ee; margin-bottom: 24px; font-size: 24px;">Congratulations, ${userName}!</h1>
            <p style="margin-bottom: 24px; line-height: 1.6;">You've been granted Premium access to RentPulse! You now have access to all premium features including:</p>
            <ul style="margin-bottom: 24px; line-height: 1.8; color: #94a3b8;">
              <li>Unlimited properties and tenants</li>
              <li>Advanced calculators with full ROI analysis</li>
              <li>Email reminders for leases and maintenance</li>
              <li>Document storage and management</li>
              <li>Priority support</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(email: string, userName: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to RentPulse!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #22d3ee; margin-bottom: 24px; font-size: 24px;">Welcome to RentPulse, ${userName}!</h1>
            <p style="margin-bottom: 24px; line-height: 1.6;">Thank you for joining RentPulse. We're excited to help you manage your rental properties more efficiently.</p>
            <p style="margin-bottom: 16px; line-height: 1.6;">Here's what you can do to get started:</p>
            <ol style="margin-bottom: 24px; line-height: 1.8; color: #94a3b8;">
              <li>Add your first property</li>
              <li>Set up your tenants</li>
              <li>Track rent payments</li>
              <li>Schedule maintenance tasks</li>
            </ol>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Get Started</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendTrialStartedEmail(email: string, userName: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your 7-Day Premium Trial Has Started - RentPulse',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #22d3ee; margin-bottom: 24px; font-size: 24px;">Your Premium Trial Has Started!</h1>
            <p style="margin-bottom: 24px; line-height: 1.6;">Hi ${userName}, you now have full access to all RentPulse Premium features for the next 7 days.</p>
            <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0; color: #22d3ee; font-weight: 600;">Premium Features Include:</p>
              <ul style="margin: 0; line-height: 1.8; color: #94a3b8;">
                <li>Unlimited properties and tenants</li>
                <li>Advanced ROI calculator for all properties</li>
                <li>Email reminders for lease expirations</li>
                <li>Maintenance scheduling with alerts</li>
                <li>Document storage</li>
              </ul>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Explore Premium Features</a>
            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
            <p style="color: #64748b; font-size: 12px;">RentPulse - Property Management Made Simple</p>
          </div>
        </body>
      </html>
    `,
  })
}
