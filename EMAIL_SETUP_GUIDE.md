# Email Setup Guide for Destiny Darshan

This guide explains how to set up email functionality to receive form submissions at destinydarshan@gmail.com.

## Overview

The Destiny Darshan website now sends all user form submissions to your personal email address. The system uses **Resend**, a professional email service that integrates seamlessly with Vercel.

## What You Need to Do

### Step 1: Create a Resend Account (Free)

1. Go to https://resend.com
2. Click "Sign Up" and create a free account
3. Verify your email address
4. You'll be directed to the dashboard

### Step 2: Get Your API Key

1. In the Resend dashboard, click on **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Name it something like "Destiny Darshan Production"
4. Copy the API key (it starts with `re_`)

### Step 3: Add the API Key to Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Click on your "destiny-darshan" project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Create the following environment variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Paste the API key you copied from Resend
   - **Environments:** Select "Production" and "Preview"
6. Click **"Save"**
7. Wait for the environment variable to be deployed (usually takes 1-2 minutes)

### Step 4: Verify Your Domain (Optional but Recommended)

To ensure maximum email deliverability:

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (or use the free `destinydarshan.com` subdomain that Resend provides)
4. Follow the DNS verification steps
5. Once verified, your emails will have better inbox placement

### Step 5: Test It Out

1. Deploy your app or restart it after adding the environment variable
2. Go to your website and fill out the concern form
3. You should receive an email at destinydarshan@gmail.com within 30 seconds
4. The user will also receive a confirmation email at their provided email address

## Email Format

### Email Sent to You (Admin)
- **To:** destinydarshan@gmail.com
- **Subject:** New Wellness Inquiry from [Name] - [Service Name]
- **Contains:** All user information including name, email, phone, concern, recommended service, and reasoning

### Email Sent to User
- **To:** User's provided email address
- **Subject:** We Received Your Wellness Inquiry - Destiny Darshan
- **Contains:** Confirmation message and next steps

## Troubleshooting

### No Email Received?

1. **Check Spam/Junk Folder:** Sometimes emails go to spam initially
2. **Verify API Key:** Make sure the API key is correctly set in Vercel environment variables
3. **Check Vercel Deployment:** Your deployment must be restarted after adding the environment variable
4. **View Logs:** Go to Vercel dashboard → Your Project → **Deployments** → View Logs to see any errors

### "RESEND_API_KEY is not configured" Error?

1. You haven't added the environment variable to Vercel yet
2. You added it but the deployment hasn't restarted
3. The API key value is incorrect or incomplete

### Emails Going to Spam?

1. Verify your domain in Resend dashboard
2. Make sure your Resend account email is verified
3. Wait a few days - new email addresses build reputation over time

## API Details

The form submission sends the following data to your email:

```
Name: [User's Name]
Email: [User's Email]
Phone: [User's Phone]
Concern: [User's Concern Description]
Recommended Service: [Astrology/Counselling/Yoga/Meditation]
AI Reasoning: [Why this service was recommended]
Submitted At: [Timestamp]
```

## Pricing

**Resend Free Tier:** 100 emails per day (usually more than enough for a new wellness platform)

Once you reach volume limits, paid plans start at $20/month for unlimited emails.

## Next Steps

After setup is complete:

1. Test the form with different concerns
2. Check that emails arrive at destinydarshan@gmail.com
3. Monitor email deliverability in Resend dashboard
4. As you grow, consider adding a more professional domain

## Support

If you encounter issues:
- Check Resend documentation: https://resend.com/docs
- Check Vercel deployment logs for error messages
- Ensure the environment variable is spelled exactly: `RESEND_API_KEY`

---

**Important:** Keep your Resend API key private. Never share it or commit it to version control.
