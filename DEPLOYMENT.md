# StudyByte Vercel Deployment Guide

This guide will help you deploy both the React frontend and FastAPI backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **API Keys**: Have your DeepSeek and/or OpenAI API keys ready

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Set Environment Variables

You'll need to configure these environment variables in Vercel:

#### Via Vercel Dashboard:
1. Go to your project settings in Vercel dashboard
2. Navigate to "Environment Variables"
3. Add the following variables:

```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here (if using OpenAI)
SECRET_KEY=your_secret_key_here
```

#### Via Vercel CLI:
```bash
vercel env add DEEPSEEK_API_KEY
vercel env add OPENAI_API_KEY
vercel env add SECRET_KEY
```

### 4. Deploy from Repository

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will automatically detect the configuration from `vercel.json`
4. Click "Deploy"

#### Option B: Deploy via CLI
```bash
# From your project root directory
vercel --prod
```

### 5. Update CORS Origins

After deployment, update the CORS origins in `server/main.py`:

```python
allow_origins=[
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:5175",
    "https://*.vercel.app",
    "https://your-actual-domain.vercel.app"  # Replace with your actual Vercel URL
],
```

## Important Notes

### WebSocket Limitations
- Vercel serverless functions have limited WebSocket support
- The app automatically falls back to regular HTTP requests in production
- For real-time features, consider implementing Server-Sent Events (SSE)

### Cold Starts
- Serverless functions may experience cold starts
- First request after inactivity might be slower
- Consider implementing warming strategies if needed

### File Structure
Your deployment uses this structure:
```
vercel.json          # Deployment configuration
├── client/          # React frontend (deployed as static site)
│   └── dist/       # Built frontend files
└── server/         # FastAPI backend (deployed as serverless functions)
    └── main.py     # API endpoints accessible via /api/*
```

## Troubleshooting

### Build Errors
1. Check that all dependencies are in `requirements.txt`
2. Ensure Python version compatibility (using Python 3.9)
3. Verify that `mangum` is installed

### API Not Working
1. Check environment variables are set correctly
2. Verify API routes use `/api/` prefix
3. Check Vercel function logs in dashboard

### Frontend Issues
1. Ensure `npm run build` works locally
2. Check that API calls use relative URLs in production
3. Verify CORS configuration

## Monitoring

- **Vercel Dashboard**: Monitor deployments and function invocations
- **Function Logs**: Check Vercel function logs for backend errors
- **Analytics**: Use Vercel Analytics for performance monitoring

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update CORS origins to include your custom domain

## Support

If you encounter issues:
1. Check Vercel's documentation
2. Review function logs in Vercel dashboard
3. Test locally first to isolate deployment-specific issues 