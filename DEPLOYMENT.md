# DeepFake Defense - Deployment Guide

This guide covers deploying the DeepFake Defense game to various platforms.

## Prerequisites

- Node.js 14+ installed
- Git repository set up
- OpenAI API key (optional, for AI explanations)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd deepfake-defense
npm install
```

### 2. Environment Configuration

```bash
cp env.example .env
```

Edit `.env` and add your configuration:
```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Connect your GitHub repository
   - Import the project

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     NODE_ENV=production
     OPENAI_API_KEY=your_openai_api_key
     ```

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Your game will be available at `https://your-project.vercel.app`

### Option 2: Netlify

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `public`
   - Node version: 16

2. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your configuration variables

3. **Deploy**
   - Connect your repository
   - Deploy automatically on push

### Option 3: Heroku

1. **Create Heroku App**
   ```bash
   heroku create your-deepfake-defense-app
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set OPENAI_API_KEY=your_openai_api_key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your repository
   - Select Node.js environment

2. **Configure**
   - Build command: `npm run build`
   - Run command: `npm start`
   - Add environment variables

3. **Deploy**
   - Deploy automatically on push

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Build and Run

```bash
docker build -t deepfake-defense .
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key deepfake-defense
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `OPENAI_API_KEY` | OpenAI API key | No | (fallback mode) |
| `MONGODB_URI` | Database URI | No | (in-memory) |
| `SESSION_SECRET` | Session secret | No | random |
| `JWT_SECRET` | JWT secret | No | random |

## Performance Optimization

### 1. Enable Compression
The server already includes compression middleware.

### 2. Static File Caching
Add to your server configuration:
```javascript
app.use(express.static('public', {
    maxAge: '1d',
    etag: true
}));
```

### 3. CDN Configuration
For production, consider using a CDN for static assets:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

## Security Considerations

### 1. HTTPS
Ensure your deployment uses HTTPS:
- Vercel/Netlify: Automatic
- Heroku: Automatic
- Custom server: Configure SSL certificates

### 2. Rate Limiting
The server includes rate limiting by default:
- 100 requests per 15 minutes per IP

### 3. Content Security Policy
CSP headers are configured in the server for security.

### 4. Environment Variables
Never commit sensitive data to version control:
- Use `.env` files locally
- Use platform environment variables in production

## Monitoring and Logging

### 1. Application Monitoring
Consider adding monitoring:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

### 2. Health Checks
The server includes health check endpoints:
- `/api/health` - Basic health check
- `/api/config` - Configuration info

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

2. **OpenAI API Errors**
   - Check API key is valid
   - Verify API quota
   - Check network connectivity

3. **Static Files Not Loading**
   - Verify file paths
   - Check CORS configuration
   - Ensure files exist in `public` directory

4. **Database Connection Issues**
   - Check MongoDB URI
   - Verify network access
   - Check authentication credentials

### Debug Mode

Enable debug mode for troubleshooting:
```bash
DEBUG=true npm run dev
```

## Scaling Considerations

### 1. Load Balancing
For high traffic, consider:
- Multiple server instances
- Load balancer (nginx, HAProxy)
- Auto-scaling groups

### 2. Database Scaling
- Use MongoDB Atlas for managed database
- Implement connection pooling
- Consider read replicas

### 3. Caching
- Redis for session storage
- CDN for static assets
- Browser caching headers

## Backup and Recovery

### 1. Database Backups
- Regular automated backups
- Point-in-time recovery
- Cross-region replication

### 2. Code Backups
- Git repository backup
- Deployment rollback procedures
- Configuration versioning

## Support and Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Node.js version

### 2. Performance Monitoring
- Monitor response times
- Track error rates
- Monitor resource usage

### 3. User Support
- Error reporting system
- User feedback collection
- Documentation updates

## Cost Optimization

### 1. Server Resources
- Right-size instances
- Use spot instances where possible
- Monitor and optimize usage

### 2. API Costs
- Monitor OpenAI API usage
- Implement caching
- Set usage limits

### 3. CDN Costs
- Optimize asset sizes
- Use appropriate cache headers
- Monitor bandwidth usage 