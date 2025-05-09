# Environment Variables Setup Guide

This document outlines the required environment variables for both the Backend and Frontend applications.

## Backend Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Server Configuration
PORT=3000  # Optional, defaults to 3000 if not set

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration (if using custom JWT)
JWT_SECRET=your_jwt_secret_key

# Google OAuth Configuration 
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service Configuration
EMAIL_SERVICE=your_email_service  # e.g., 'gmail'
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_password
```

### How to obtain Supabase credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Project Settings > API
4. You'll find:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

### How to obtain Google OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the application name, user support email, and developer contact information
   - Add authorized domains
   - Add required scopes (typically email and profile)
6. Create OAuth 2.0 Client ID:
   - Choose "Web application" as the application type
   - Add authorized JavaScript origins (e.g., http://localhost:5173 for development)

7. After creation, you'll receive:
   - Client ID (GOOGLE_CLIENT_ID)
   - Client Secret (GOOGLE_CLIENT_SECRET)

### How to obtain Email Service credentials:

1. For Gmail:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled
   - Go to App Passwords
   - Select "Mail" and your device
   - Generate and copy the 16-character password
   - Use this password as EMAIL_PASSWORD
   - Set EMAIL_SERVICE=gmail
   - Set EMAIL_USER=your_gmail_address


## Frontend Environment Variables

Create a `.env` file in the `Frontend` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_SUPABASE_BUCKET_NAME=asset_name

VITE_GOOGLE_CLIENT_ID=google_client_id
VITE_GOOGLE_CLIENT_SECRET=google_client_secret_key

# API Configuration
VITE_API_URL=http://localhost:3000  # Backend API URL
```

### How to obtain Frontend Supabase credentials:

1. Use the same Supabase project as the backend
2. Go to Project Settings > API
3. Copy the same Project URL and anon/public key

## Security Notes

1. Never commit `.env` files to version control
2. Keep your service_role key secure and only use it in the backend
3. The anon key is safe to use in the frontend as it has limited permissions
4. Make sure to add `.env` to your `.gitignore` file
5. For Google OAuth:
   - Keep your client secret secure
   - Regularly review authorized domains and redirect URIs
   - Monitor OAuth consent screen for any issues
6. For Email Service:
   - Use app-specific passwords when possible
   - Never use your main account password
   - Regularly rotate credentials
   - Monitor for suspicious activity

## Testing the Configuration

1. Backend:
   - Start the server: `npm start`
   - Check console for successful connection messages
   - Test email sending functionality
   - Verify Google OAuth flow

2. Frontend:
   - Start the development server: `npm run dev`
   - Check browser console for any connection errors
   - Test authentication flows
   - Verify Google login/signup
   - Test password reset flow 