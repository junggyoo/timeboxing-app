# Supabase Setup Guide

This guide walks you through setting up Supabase authentication and database for the Timeboxing application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Create Supabase Project](#create-supabase-project)
- [Configure Environment Variables](#configure-environment-variables)
- [Run Database Migrations](#run-database-migrations)
- [Configure Authentication](#configure-authentication)
  - [Email/Password Authentication](#emailpassword-authentication)
  - [Google OAuth](#google-oauth)
- [Verify Setup](#verify-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Google Cloud Platform account (for Google OAuth)
- Basic understanding of OAuth 2.0

## Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Organization**: Select or create an organization
   - **Project name**: Choose a meaningful name (e.g., "timeboxing-app")
   - **Database password**: Generate a strong password (save this securely)
   - **Region**: Select `ap-northeast-1` (Tokyo) for optimal performance
   - **Pricing plan**: Choose based on your needs (Free tier works for development)
4. Click "Create new project"
5. Wait for the project to be provisioned (this takes 1-2 minutes)

## Configure Environment Variables

1. In your Supabase project dashboard, navigate to **Project Settings** > **API**

2. Copy your project credentials:
   - **Project URL**: Copy the value from "Project URL"
   - **anon/public key**: Copy the value from "Project API keys" > "anon public"
   - **service_role key**: Copy the value from "Project API keys" > "service_role" (keep this secret!)

3. In your project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **Important Security Notes:**
   - Never commit `.env.local` to version control (it's in `.gitignore`)
   - The `SUPABASE_SERVICE_ROLE_KEY` should never be exposed to the client
   - The `anon` key is safe to expose to the client (it's used for RLS-protected operations)

## Run Database Migrations

1. Navigate to your Supabase project dashboard

2. Go to **SQL Editor**

3. Run the migrations in order:

   **Migration 1: Create Example Table** (if needed)
   ```sql
   -- Copy and paste content from supabase/migrations/0001_create_example_table.sql
   ```

   **Migration 2: Create Profiles and Timeboxes**
   ```sql
   -- Copy and paste content from supabase/migrations/0002_create_profiles_and_timeboxes.sql
   ```

   Click "Run" to execute each migration.

4. Verify the tables were created:
   - Go to **Table Editor**
   - You should see `profiles` and `timeboxes` tables

5. Verify RLS is enabled:
   - In Table Editor, check that both tables show "RLS enabled"
   - Click on each table and go to "Policies" tab to view the RLS policies

## Configure Authentication

### Email/Password Authentication

Email/password authentication is enabled by default in Supabase.

1. Go to **Authentication** > **Providers** in your Supabase dashboard

2. Find "Email" provider and verify it's enabled

3. Configure email settings (optional):
   - **Confirm email**: Enable to require email verification
   - **Secure email change**: Enable for added security
   - **Double confirm email**: Enable to require double opt-in

4. Customize email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize the "Confirm signup" and other templates

### Google OAuth

1. **Create Google OAuth Credentials:**

   a. Go to [Google Cloud Console](https://console.cloud.google.com)

   b. Create a new project or select an existing one

   c. Enable the Google+ API:
      - Go to **APIs & Services** > **Library**
      - Search for "Google+ API"
      - Click "Enable"

   d. Create OAuth credentials:
      - Go to **APIs & Services** > **Credentials**
      - Click "Create Credentials" > "OAuth client ID"
      - If prompted, configure the OAuth consent screen first:
        - User type: External (for public apps) or Internal (for workspace apps)
        - Fill in app name, support email, and developer contact
        - Add scopes: `openid`, `email`, `profile`
        - Add test users if in testing mode

   e. Configure OAuth client:
      - Application type: Web application
      - Name: "Timeboxing App" (or your app name)
      - Authorized JavaScript origins:
        - `http://localhost:3000` (for development)
        - `https://your-production-domain.com` (for production)
      - Authorized redirect URIs:
        - `https://your-project-ref.supabase.co/auth/v1/callback`
        - Replace `your-project-ref` with your actual Supabase project reference

   f. Click "Create" and copy:
      - Client ID
      - Client Secret

2. **Configure Google Provider in Supabase:**

   a. In Supabase dashboard, go to **Authentication** > **Providers**

   b. Find "Google" in the list and click on it

   c. Toggle "Enable Google provider" to ON

   d. Fill in the credentials:
      - **Client ID**: Paste your Google OAuth Client ID
      - **Client Secret**: Paste your Google OAuth Client Secret
      - **Authorized Client IDs**: Leave empty unless you have specific requirements

   e. Configure redirect URLs:
      - **Site URL**:
        - Development: `http://localhost:3000`
        - Production: `https://your-production-domain.com`
      - **Redirect URLs** (add both):
        - `http://localhost:3000/auth/callback`
        - `https://your-production-domain.com/auth/callback`

   f. Click "Save"

3. **Update OAuth Consent Screen (if needed):**

   If you see a warning about the OAuth consent screen:
   - Go back to Google Cloud Console
   - Navigate to **APIs & Services** > **OAuth consent screen**
   - Update the authorized domains to include your Supabase project domain
   - Add your production domain to the list

## Verify Setup

1. **Test Database Connection:**
   ```bash
   npm run env:check
   ```
   This should verify your environment variables are set correctly.

2. **Test Email/Password Signup:**
   - Start the development server: `npm run dev`
   - Navigate to `http://localhost:3000/signup`
   - Create an account with a test email
   - Check Supabase dashboard **Authentication** > **Users** to see the new user
   - Check **Table Editor** > **profiles** to verify profile was auto-created

3. **Test Email/Password Login:**
   - Navigate to `http://localhost:3000/login`
   - Log in with the test account
   - You should be redirected to `/dashboard`

4. **Test Google OAuth:**
   - Navigate to `http://localhost:3000/login`
   - Click "Google로 시작하기" (Start with Google)
   - You should be redirected to Google sign-in
   - After authorizing, you should be redirected back to `/dashboard`
   - Verify in Supabase dashboard that a new user and profile were created

5. **Test API Endpoints:**
   - After logging in, open browser DevTools
   - In the Console, test the API:
     ```javascript
     // Create a timebox
     const response = await fetch('/api/timeboxes', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         title: 'Test Timebox',
         start_at: new Date().toISOString(),
         end_at: new Date(Date.now() + 3600000).toISOString(),
       })
     });
     const data = await response.json();
     console.log(data);
     ```

6. **Run Tests:**
   ```bash
   # Unit and integration tests
   npm test

   # E2E tests (requires Playwright browsers: npx playwright install)
   npm run test:e2e
   ```

## Troubleshooting

### Common Issues

**1. "Invalid API key" error**
- Verify your environment variables in `.env.local`
- Make sure you copied the correct keys from Supabase dashboard
- Restart your development server after changing `.env.local`

**2. "User already registered" on Google OAuth**
- Check if the email is already registered via email/password
- Supabase links accounts by email, so the same email can't be used for both

**3. Google OAuth redirect error**
- Verify redirect URLs match exactly in both Google Console and Supabase
- Check that your Supabase project URL is correct
- Ensure you added both localhost and production URLs

**4. "Unauthorized" when accessing API**
- Make sure you're logged in (check browser cookies)
- Verify RLS policies are correctly set up in Supabase
- Check that the session is valid (not expired)

**5. Profile not created automatically**
- Check the trigger function exists: Go to **Database** > **Functions** > `handle_new_user`
- Check the trigger exists: Go to **Database** > **Triggers** > `on_auth_user_created`
- Manually create a profile if needed:
  ```sql
  INSERT INTO profiles (id, email, nickname)
  VALUES (
    'user-id-from-auth-users',
    'user@example.com',
    'nickname'
  );
  ```

**6. Database migration errors**
- Check for syntax errors in the SQL migration files
- Verify you're running migrations in the correct order
- Check Supabase logs: **Logs** > **Database** for detailed error messages
- Try running migrations one statement at a time

**7. CORS errors**
- Verify Site URL and Redirect URLs in Supabase dashboard
- Check that your URLs don't have trailing slashes
- Ensure you're using the correct protocol (http vs https)

### Getting Help

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **Project Issues**: Check the project's GitHub issues page

## Next Steps

After completing the setup:

1. Review the [API Documentation](./API.md)
2. Explore the codebase architecture in the project README
3. Start building features using the authenticated API endpoints
4. Configure production environment variables in your deployment platform (Vercel, etc.)
5. Set up monitoring and logging for production

## Security Checklist

Before deploying to production, ensure:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client
- [ ] RLS is enabled on all tables
- [ ] RLS policies are tested and verified
- [ ] OAuth redirect URLs are configured for production domain
- [ ] Site URL is set to production domain in Supabase
- [ ] Email templates are customized and tested
- [ ] Rate limiting is configured if needed
- [ ] Environment variables are set in production deployment platform
- [ ] Database backups are enabled in Supabase
- [ ] 2FA is enabled for Supabase project access
