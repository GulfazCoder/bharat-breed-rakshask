# Google Vision API Setup Guide

This guide will help you set up the Google Cloud Vision API for the Bharat Breed Rakshask application.

## Prerequisites

- Google Cloud account (free tier available)
- Credit card for Google Cloud verification (won't be charged for free tier usage)
- Active internet connection

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on **"Select a project"** at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "bharat-breed-rakshask")
5. Click **"Create"**

## Step 2: Enable the Cloud Vision API

1. In your project dashboard, go to **"APIs & Services"** > **"Library"**
2. Search for **"Cloud Vision API"**
3. Click on **"Cloud Vision API"**
4. Click **"Enable"**

## Step 3: Create API Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"API Key"**
3. Copy the generated API key
4. (Recommended) Click **"Restrict Key"** to add restrictions:
   - Under **"API restrictions"**, select **"Restrict key"**
   - Choose **"Cloud Vision API"**
   - Under **"Application restrictions"**, you can add:
     - **HTTP referrers** for web applications
     - **IP addresses** for server applications

## Step 4: Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   NEXT_PUBLIC_GOOGLE_VISION_API_KEY=your_actual_api_key_here
   ```

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the classify page
3. Upload or capture an image of cattle/buffalo
4. The AI classification should now use Google Vision API

## API Quotas and Pricing

### Free Tier (Monthly)
- **1,000 units per month** for feature requests
- Label Detection: 1,000 images/month
- Text Detection: 1,000 images/month

### Paid Tier (after free tier)
- **Label Detection**: $1.50 per 1,000 images
- **Text Detection**: $1.50 per 1,000 images

### Current Usage Estimate
- For testing: ~50-100 API calls per day
- For production: Depends on user volume

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** for sensitive data
3. **Restrict API keys** to specific APIs and domains
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** to avoid unexpected charges

## Troubleshooting

### Common Issues

#### 1. "API key not valid" error
- Check if the API key is correctly copied
- Ensure Cloud Vision API is enabled
- Verify API key restrictions

#### 2. "Quota exceeded" error
- Check usage in Google Cloud Console
- You may have exceeded the free tier limit
- Consider upgrading to paid tier

#### 3. "Invalid image data" error
- Ensure image is in supported format (JPEG, PNG, etc.)
- Check image size (max 20MB for Vision API)
- Verify base64 encoding is correct

#### 4. Network/CORS errors
- API requests are made from client-side (browser)
- Ensure proper HTTP referrer restrictions
- Check browser developer console for errors

### Getting Help

1. **Google Cloud Support**: Available for paid accounts
2. **Stack Overflow**: Tag questions with `google-cloud-vision`
3. **Google Cloud Community**: Community forums and documentation

## Features Supported

The current implementation supports:
- ✅ **Animal Type Detection** (cattle vs buffalo)
- ✅ **Label-based Breed Classification** 
- ✅ **Fallback to Enhanced Mock Data** (when API unavailable)
- ✅ **Error Handling and Recovery**
- ✅ **Confidence Scoring**
- ✅ **Top 3 Breed Predictions**

## Future Enhancements

Potential improvements:
- Custom model training for Indian breeds
- Integration with additional AI services
- Caching of results to reduce API calls
- Batch processing for multiple images
- Real-time analysis optimization

## Alternative AI Services

If Google Vision doesn't meet your needs:
- **AWS Rekognition**: Similar image analysis
- **Azure Computer Vision**: Microsoft's solution
- **Clarifai**: Specialized in custom models
- **Custom TensorFlow/PyTorch models**: For specific breeds

## Monitoring and Analytics

Track your API usage:
1. Go to **Google Cloud Console**
2. Navigate to **"APIs & Services"** > **"Dashboard"**
3. Click on **"Cloud Vision API"**
4. View usage statistics and quotas

---

## Quick Setup Commands

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit environment file (add your API key)
nano .env.local

# 3. Install dependencies (if not done already)
npm install

# 4. Start development server
npm run dev

# 5. Test the application
# Navigate to: http://localhost:3000/classify
```

---

**Note**: The application will work without the API key by falling back to enhanced mock data, but the Google Vision API provides more accurate results for livestock classification.