# Deployment Guide for Project 3

This guide will walk you through deploying your frontend to Vercel and backend to Render.

## Prerequisites

Before starting, ensure you have:
- A GitHub account (to connect with Vercel and Render)
- Your project pushed to a GitHub repository
- A Vercel account (free at https://vercel.com)
- A Render account (free at https://render.com)
- Your Google Cloud service account JSON key file
- Supabase project credentials

## Frontend Deployment (Vercel)

### Step 1: Prepare Your Frontend

1. Make sure your frontend builds correctly locally:
   ```bash
   cd /Users/shaharyarzaidi/Downloads/project\ 3
   npm install
   npm run build
   ```

2. Create a `vercel.json` file in your project root:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables in Vercel

Click on "Environment Variables" and add the following:

1. **VITE_API_URL**: `https://your-backend-name.onrender.com/api` (you'll get this URL after deploying backend)
2. **VITE_BIGQUERY_PROJECT_ID**: Your Google Cloud project ID
3. **VITE_BIGQUERY_CREDENTIALS**: Your entire service account JSON as a string (copy the entire JSON content)
4. **VITE_BIGQUERY_DATASET_ID**: `orders`
5. **VITE_BIGQUERY_TABLE_ID**: `order_lines`
6. **VITE_SUPABASE_URL**: Your Supabase project URL
7. **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your frontend will be available at `https://your-project-name.vercel.app`

## Backend Deployment (Render)

### Step 1: Prepare Your Backend

1. Create a `render.yaml` file in your backend directory:
   ```yaml
   services:
     - type: web
       name: project3-backend
       env: node
       buildCommand: cd backend && npm install && npm run build
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 3001
   ```

### Step 2: Deploy to Render

1. Go to https://render.com and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure your service:
   - **Name**: `project3-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables in Render

In the "Environment" tab, add:

1. **PORT**: `3001`
2. **NODE_ENV**: `production`
3. **BIGQUERY_PROJECT_ID**: Your Google Cloud project ID
4. **BIGQUERY_CREDENTIALS**: Your entire service account JSON as a string
5. **BIGQUERY_DATASET_ID**: `orders`
6. **BIGQUERY_TABLE_ID**: `order_lines`
7. **ALLOWED_ORIGINS**: Your Vercel frontend URL (e.g., `https://your-project-name.vercel.app`)

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your backend
3. Your backend will be available at `https://your-backend-name.onrender.com`

## Post-Deployment Steps

### 1. Update Frontend Environment Variables

Once your backend is deployed:
1. Go back to your Vercel project settings
2. Update the `VITE_API_URL` environment variable with your Render backend URL
3. Redeploy your frontend by going to the "Deployments" tab and clicking "Redeploy"

### 2. Configure CORS

Make sure your backend's CORS configuration allows your Vercel frontend URL. Update your backend's `src/index.ts` if needed:

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-project-name.vercel.app'],
  credentials: true
};
```

### 3. Test Your Deployment

1. Visit your Vercel frontend URL
2. Check the browser console for any errors
3. Test all functionality (authentication, data fetching, etc.)

## Environment Variables Checklist

### Frontend (Vercel):
- [ ] VITE_API_URL
- [ ] VITE_BIGQUERY_PROJECT_ID
- [ ] VITE_BIGQUERY_CREDENTIALS
- [ ] VITE_BIGQUERY_DATASET_ID
- [ ] VITE_BIGQUERY_TABLE_ID
- [ ] VITE_SUPABASE_URL (if using Supabase)
- [ ] VITE_SUPABASE_ANON_KEY (if using Supabase)

### Backend (Render):
- [ ] PORT
- [ ] NODE_ENV
- [ ] BIGQUERY_PROJECT_ID
- [ ] BIGQUERY_CREDENTIALS
- [ ] BIGQUERY_DATASET_ID
- [ ] BIGQUERY_TABLE_ID
- [ ] ALLOWED_ORIGINS

## Troubleshooting

### Frontend Issues:
- **Build fails**: Check your environment variables are properly set
- **API calls fail**: Verify VITE_API_URL is correct and includes `/api`
- **CORS errors**: Ensure backend ALLOWED_ORIGINS includes your frontend URL

### Backend Issues:
- **Build fails**: Check Node version compatibility (Render uses Node 18 by default)
- **Service crashes**: Check logs in Render dashboard
- **BigQuery errors**: Verify service account credentials and permissions

### Common Issues:
1. **Environment variables not working**: Ensure they're prefixed with `VITE_` for frontend
2. **CORS errors**: Double-check allowed origins in backend configuration
3. **Build timeouts**: Consider upgrading to paid tier if builds take too long

## Security Notes

1. Never commit your `.env` files to GitHub
2. Always use environment variables for sensitive data
3. Restrict your BigQuery service account to minimum required permissions
4. Enable HTTPS (automatic on both Vercel and Render)

## Next Steps

1. Set up a custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD pipelines for automatic deployments
4. Implement proper error logging and monitoring

For more detailed documentation:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://docs.render.com