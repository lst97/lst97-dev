# Setting up Gmail OAuth2 for Nodemailer

This project uses OAuth2 authentication with Gmail for sending emails. Follow these steps to set up your OAuth2 credentials.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Dashboard"
4. Click on "+ ENABLE APIS AND SERVICES"
5. Search for "Gmail API" and enable it

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
4. Add the following scopes:
   - `https://mail.google.com/`
5. Add any test users (including your own email)
6. Complete the configuration

## Step 3: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Add a name for your OAuth client
5. Add the following redirect URI:
   - `https://developers.google.com/oauthplayground`
6. Click "Create"
7. Save your Client ID and Client Secret

## Step 4: Generate a Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon in the top right and check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret from Step 3
4. Select `https://mail.google.com/` from the list of APIs
5. Click "Authorize APIs"
6. Sign in with your Google account and grant access
7. Click "Exchange authorization code for tokens"
8. Copy the Refresh Token

## Step 5: Update Environment Variables

Add the following variables to your `.env` file:

```sh
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_RECIPIENT=recipient-email@example.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_REFRESH_TOKEN=your-refresh-token
```

## Notes

- The refresh token is valid indefinitely unless you revoke access or change your Google account password
- Make sure your Gmail account has [Less secure app access](https://myaccount.google.com/lesssecureapps) turned off, as you're using OAuth2
- If deploying to a production environment, make sure to update the OAuth consent screen to production status
