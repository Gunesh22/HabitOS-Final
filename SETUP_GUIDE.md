# HabitOS - Complete Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd "d:\image to text using gemini website\HabitOS"
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Landing Page URL
REACT_APP_LANDING_PAGE_URL=https://habitos.com

# Razorpay Configuration (India)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
REACT_APP_RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY

# Gumroad Configuration (International)
REACT_APP_GUMROAD_PRODUCT_URL=https://gumroad.com/l/habitos

# Backend API
REACT_APP_BACKEND_URL=http://localhost:3001
```

### 3. Run Development Server
```bash
npm start
```

### 4. Run Electron App (Desktop)
```bash
npm run electron:dev
```

## 💳 Payment Integration

### Razorpay Setup (for India)

1. **Create Razorpay Account**
   - Go to https://razorpay.com
   - Sign up for an account
   - Complete KYC verification

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate Test Keys for development
   - Generate Live Keys for production

3. **Update .env file**
   ```env
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   REACT_APP_RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
   ```

4. **Test Payment**
   - Use test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any CVV

### Gumroad Setup (for International)

1. **Create Gumroad Account**
   - Go to https://gumroad.com
   - Sign up and verify email

2. **Create Product**
   - Click "Create Product"
   - Set name: "HabitOS Lifetime License"
   - Set price: $29 (or your preferred price)
   - Add description and images

3. **Get Product URL**
   - Copy the product permalink
   - Format: `https://gumroad.com/l/YOUR_PRODUCT_ID`

4. **Update .env file**
   ```env
   REACT_APP_GUMROAD_PRODUCT_URL=https://gumroad.com/l/habitos
   ```

5. **Configure Webhooks** (Optional)
   - Go to Settings → Advanced → Webhooks
   - Add webhook URL: `https://your-backend.com/api/webhooks/gumroad`
   - This will auto-generate licenses on purchase

## 🔧 Backend Configuration

### Update Backend for License Generation

The backend at `d:\image to text using gemini website\HabitOS\backend\server.js` already has:
- ✅ License creation API
- ✅ License verification API
- ✅ Razorpay webhook handler
- ✅ Gumroad webhook handler

### Start Backend Server
```bash
cd "d:\image to text using gemini website\HabitOS\backend"
node server.js
```

Backend will run on `http://localhost:3001`

## 📦 Building Desktop App

### Windows
```bash
npm run electron:build:win
```
Output: `dist/HabitOS Setup.exe` and `dist/HabitOS.exe`

### macOS
```bash
npm run electron:build:mac
```
Output: `dist/HabitOS.dmg`

### Linux
```bash
npm run electron:build:linux
```
Output: `dist/HabitOS.AppImage` and `dist/HabitOS.deb`

### All Platforms
```bash
npm run electron:build
```

## 🌐 Deploying Landing Page

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Upload 'build' folder to Netlify
```

### Option 3: GitHub Pages
```bash
npm install --save-dev gh-pages
# Add to package.json scripts:
# "deploy": "gh-pages -d build"
npm run build
npm run deploy
```

## 📥 Setting Up Downloads

### Create Download Server

1. **Upload Built Apps**
   - Upload `HabitOS Setup.exe` to your server
   - Upload `HabitOS.dmg` to your server
   - Upload `HabitOS.AppImage` to your server

2. **Update Download URLs**
   In `LandingPage.js`, update the `downloads` object:
   ```javascript
   const downloads = {
     windows: 'https://your-cdn.com/downloads/HabitOS-Setup.exe',
     mac: 'https://your-cdn.com/downloads/HabitOS.dmg',
     linux: 'https://your-cdn.com/downloads/HabitOS.AppImage'
   };
   ```

3. **Use CDN (Recommended)**
   - Upload to AWS S3 + CloudFront
   - Or use GitHub Releases
   - Or use DigitalOcean Spaces

### GitHub Releases (Free Option)

1. Create a new release on GitHub
2. Upload built apps as release assets
3. Get download URLs from release page
4. Update `LandingPage.js` with GitHub release URLs

## 🎯 Trial System

The 10-day trial is already implemented in:
- `src/licenseManager.js` - Trial logic
- `src/Onboarding.js` - Trial start
- `src/App.js` - Trial validation

Trial starts automatically when user completes onboarding without a license.

## 🔐 Security Checklist

- [ ] Change default admin password in admin dashboard
- [ ] Use environment variables for all API keys
- [ ] Never commit `.env` file to git
- [ ] Use HTTPS in production
- [ ] Enable CORS only for your domains
- [ ] Validate all payment webhooks
- [ ] Store license keys securely (hashed)

## 📊 Analytics (Optional)

Add Google Analytics or Plausible:

```javascript
// In public/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

## 🐛 Troubleshooting

### Razorpay Not Loading
- Check if Razorpay script is loaded in `public/index.html`
- Verify API keys are correct
- Check browser console for errors

### Electron Build Fails
```bash
# Clear cache
rm -rf node_modules dist build
npm install
npm run electron:build:win
```

### Download Not Working
- Check file paths are correct
- Verify server CORS settings
- Test download URLs directly

## 📞 Support

For issues:
1. Check console logs
2. Verify environment variables
3. Test in incognito mode
4. Check network tab in DevTools

## 🎉 Launch Checklist

- [ ] Test payments (Razorpay & Gumroad)
- [ ] Test downloads (all platforms)
- [ ] Test 10-day trial
- [ ] Test license activation
- [ ] Build desktop apps
- [ ] Deploy landing page
- [ ] Set up download server
- [ ] Configure webhooks
- [ ] Test end-to-end flow
- [ ] Update pricing
- [ ] Add analytics
- [ ] Launch! 🚀
