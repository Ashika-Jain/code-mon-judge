# Google OAuth Setup Guide

## Prerequisites
1. A Google Cloud Console account
2. A Google OAuth 2.0 Client ID and Client Secret

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
8. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
9. Copy the Client ID and Client Secret

## Step 2: Backend Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/online-judge

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-123456789

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

## Step 3: Frontend Environment Configuration

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Step 4: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 5: Start the Application

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## Step 6: Test Google OAuth

1. Navigate to `http://localhost:5173/login`
2. Click the "Sign in with Google" button
3. Complete the Google OAuth flow
4. You should be redirected to the problems page after successful authentication

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**: Make sure the Google Client ID is correctly set in both frontend and backend environment files.

2. **CORS errors**: Ensure the backend CORS configuration includes your frontend URL.

3. **"Redirect URI mismatch" error**: Verify that the redirect URI in Google Cloud Console matches exactly with your backend callback URL.

4. **"Access token invalid" error**: Check that the Google Client Secret is correctly set in the backend environment file.

### Security Notes:

- Never commit your `.env` files to version control
- Use strong, unique secrets for JWT and session keys
- In production, use HTTPS for all OAuth redirects
- Regularly rotate your Google OAuth credentials

## Production Deployment

For production deployment:

1. Update the Google OAuth redirect URIs in Google Cloud Console
2. Set `NODE_ENV=production` in your backend environment
3. Use HTTPS URLs for all OAuth configurations
4. Ensure your domain is properly configured in Google Cloud Console 