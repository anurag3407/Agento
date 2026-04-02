# CareerPilot — Heroku Deployment Guide

This guide covers deploying both the **Next.js frontend** and **Python backend** to Heroku.

## Prerequisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. Heroku account (free tier works for testing)
3. Git repository initialized

## Required API Keys

Before deploying, get these API keys:

| Service | Purpose | Get Key |
|---------|---------|---------|
| **Supabase** | Database + Auth | [supabase.com/dashboard](https://supabase.com/dashboard) |
| **Google Gemini** | AI Functions | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Resend** (optional) | Email Digests | [resend.com](https://resend.com) |

---

## Step 1: Deploy Python Backend

```bash
# Navigate to backend folder
cd backend

# Login to Heroku
heroku login

# Create a new Heroku app for the backend
heroku create careerpilot-backend

# Set Python buildpack
heroku buildpacks:set heroku/python

# Set environment variables
heroku config:set GOOGLE_API_KEY=your_gemini_api_key
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_KEY=your_supabase_service_key
heroku config:set RESEND_API_KEY=your_resend_api_key
heroku config:set CORS_ORIGINS=https://careerpilot-frontend.herokuapp.com,http://localhost:3000

# Initialize git if not already (in backend folder)
git init
git add .
git commit -m "Initial backend deploy"

# Deploy to Heroku
git push heroku main

# Verify it's running
heroku logs --tail
```

Your backend URL will be: `https://careerpilot-backend.herokuapp.com`

---

## Step 2: Deploy Next.js Frontend

```bash
# Go back to root folder
cd ..

# Create a new Heroku app for the frontend
heroku create careerpilot-frontend

# Set Node.js buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
heroku config:set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
heroku config:set NEXT_PUBLIC_AGENT_API_URL=https://careerpilot-backend.herokuapp.com
heroku config:set AGENT_API_URL=https://careerpilot-backend.herokuapp.com
heroku config:set NEXT_PUBLIC_SITE_URL=https://careerpilot-frontend.herokuapp.com

# Deploy
git add .
git commit -m "Initial frontend deploy"
git push heroku main

# Verify it's running
heroku logs --tail
```

Your frontend URL will be: `https://careerpilot-frontend.herokuapp.com`

---

## Step 3: Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Authentication** → **URL Configuration**
3. Add your frontend URL to **Site URL**: `https://careerpilot-frontend.herokuapp.com`
4. Add to **Redirect URLs**:
   - `https://careerpilot-frontend.herokuapp.com/**`
   - `http://localhost:3000/**` (for local dev)

### OAuth Setup (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID & Secret → Supabase → Auth → Providers → Google

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID & Secret → Supabase → Auth → Providers → GitHub

---

## Environment Variables Reference

### Backend (Python)

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Gemini API key for AI | ✅ Yes |
| `SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | ✅ Yes |
| `RESEND_API_KEY` | Resend API key for emails | Optional |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | ✅ Yes |
| `DEBUG` | Enable debug mode | Optional |

### Frontend (Next.js)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon key | ✅ Yes |
| `NEXT_PUBLIC_AGENT_API_URL` | Backend API URL (public) | ✅ Yes |
| `AGENT_API_URL` | Backend API URL (server-side) | ✅ Yes |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | ✅ Yes |

---

## Troubleshooting

### Backend won't start
```bash
heroku logs --tail -a careerpilot-backend
```
Common issues:
- Missing `GOOGLE_API_KEY` - Add it with `heroku config:set`
- Port binding - Ensure using `$PORT` env variable

### Frontend 500 errors
```bash
heroku logs --tail -a careerpilot-frontend
```
Common issues:
- Build failure - Check `heroku-postbuild` script
- Missing env vars - Verify all `NEXT_PUBLIC_*` vars are set

### CORS errors
Update backend CORS:
```bash
heroku config:set CORS_ORIGINS=https://your-frontend.herokuapp.com -a careerpilot-backend
```

### SSE not working
Heroku has a 55-second request timeout. For long-running agent workflows:
- Consider using webhooks instead of SSE
- Or upgrade to Heroku's premium dyno types

---

## Monorepo Deployment (Alternative)

If you want both apps in one repo, use Heroku's multi-Procfile buildpack:

```bash
# Add buildpacks
heroku buildpacks:add -i 1 heroku-community/multi-procfile
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python

# Set Procfile paths
heroku config:set PROCFILE=Procfile  # for frontend
# OR
heroku config:set PROCFILE=backend/Procfile  # for backend
```

---

## Cost Estimate

**Free/Eco tier ($5/month each):**
- Frontend: Eco dyno
- Backend: Eco dyno
- Supabase: Free tier (500MB DB, 1GB storage)
- Gemini: Free tier (60 req/min)

**Total: ~$10/month** for basic deployment

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Configure Supabase auth
4. ✅ Test the full flow
5. Set up monitoring (Heroku metrics, Sentry)
6. Configure scheduled jobs (Heroku Scheduler)
