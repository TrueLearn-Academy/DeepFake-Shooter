# Render Deployment Guide for DeepFake Defense

## Quick Deploy to Render

### Option 1: Deploy from GitHub (Recommended)

1. **Fork/Clone the Repository**
   - Fork this repository to your GitHub account
   - Or clone it to your local machine

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" and select "Web Service"

3. **Configure the Service**
   - **Name**: `deepfake-defense` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan for better performance)

4. **Environment Variables** (Optional)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will set this automatically)
   - `OPENAI_API_KEY`: Your OpenAI API key (if you want AI explanations)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app
   - Your app will be available at `https://your-app-name.onrender.com`

### Option 2: Deploy from Local Files

1. **Prepare Your Files**
   - Ensure all files are committed to Git
   - Push to GitHub if not already done

2. **Use Render Dashboard**
   - Follow the same steps as Option 1
   - Connect your GitHub repository

## Environment Variables

### Required
- `NODE_ENV`: Set to `production` for production deployment

### Optional
- `OPENAI_API_KEY`: Your OpenAI API key for AI explanations
- `PORT`: Port number (Render sets this automatically)

## Configuration Files

The project includes these deployment-ready files:

- `render.yaml`: Render-specific configuration
- `Procfile`: For Heroku and other platforms
- `package.json`: Contains all necessary scripts and dependencies
- `.gitignore`: Excludes unnecessary files

## Health Check

The app includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=14.0.0)

2. **App Won't Start**
   - Verify the start command is correct: `npm start`
   - Check logs in Render dashboard

3. **CORS Issues**
   - The app is configured to allow requests from Render domains
   - Update CORS settings if deploying to a custom domain

4. **Environment Variables**
   - Ensure all required environment variables are set in Render dashboard
   - Check that variable names match exactly

### Performance Optimization

1. **Enable Auto-Deploy**
   - Connect your GitHub repository for automatic deployments
   - Set up branch protection rules

2. **Use Paid Plans**
   - Free tier has limitations and cold starts
   - Paid plans provide better performance and uptime

3. **Monitor Usage**
   - Use Render's built-in monitoring
   - Set up alerts for errors and performance issues

## Custom Domain (Optional)

1. **Add Custom Domain**
   - In Render dashboard, go to your service
   - Click "Settings" → "Custom Domains"
   - Add your domain

2. **Update CORS**
   - Update the CORS configuration in `server/server.js`
   - Add your custom domain to the allowed origins

## SSL/HTTPS

- Render automatically provides SSL certificates
- HTTPS is enabled by default
- No additional configuration needed

## Support

For Render-specific issues:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

For app-specific issues:
- Check the main README.md
- Review the DEPLOYMENT.md file
- Open an issue in the GitHub repository 