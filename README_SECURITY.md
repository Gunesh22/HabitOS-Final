# 🔒 HabitOS Security Refactoring - Complete Guide

## Overview

This guide documents the complete security refactoring of HabitOS to follow industry best practices for handling sensitive data, API keys, and payment processing.

---

## ✅ What Changed

### **Before (Insecure)**
- ❌ Gumroad API calls made directly from frontend
- ❌ Product IDs and API endpoints exposed in client code
- ❌ Razorpay and Gumroad payment integrations in frontend
- ❌ Payment verification logic in client-side code
- ❌ API keys potentially exposed

### **After (Secure)**
- ✅ All API calls go through backend server
- ✅ No sensitive data in frontend code
- ✅ Payments handled on separate landing page
- ✅ License verification happens server-side only
- ✅ Environment variables for all configuration
- ✅ Rate limiting and security headers
- ✅ Proper separation of concerns

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
│                 │
│  - UI Only      │
│  - No Secrets   │
│  - No Payments  │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Backend       │
│   (Node.js)     │
│                 │
│  - License API  │
│  - Secrets      │
│  - Validation   │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  External APIs  │
│                 │
│  - Gumroad      │
│  - Database     │
└─────────────────┘

┌─────────────────┐
│ Landing Page    │
│                 │
│  - Payments     │
│  - Checkout     │
└─────────────────┘
```

---

## 📁 Project Structure

```
HabitOS/
├── backend/                    # NEW: Secure backend server
│   ├── server.js              # Express server with API endpoints
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   └── .gitignore             # Ensure .env is never committed
│
├── src/                       # Frontend (React)
│   ├── licenseManager.js      # UPDATED: Now calls backend API
│   ├── Onboarding.js          # UPDATED: Removed payment integrations
│   ├── LicenseActivation.js   # UPDATED: Redirects to landing page
│   └── ...
│
├── .env.example               # Frontend environment template
└── README_SECURITY.md         # This file
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your actual values
# IMPORTANT: Set GUMROAD_PRODUCT_ID
notepad .env

# Start the backend server
npm run dev
```

**Backend will run on:** `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Create environment file
cp .env.example .env.local

# Edit .env.local
# Set REACT_APP_BACKEND_URL=http://localhost:3001
# Set REACT_APP_LANDING_PAGE_URL to your landing page
notepad .env.local

# Install dependencies (if needed)
npm install

# Start the frontend
npm start
```

**Frontend will run on:** `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
GUMROAD_PRODUCT_ID=your_actual_product_id_here
JWT_SECRET=your_super_secret_key_here
```

### Frontend (.env.local)

```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_LANDING_PAGE_URL=https://your-landing-page.com/purchase
```

---

## 🔒 Security Best Practices Implemented

### 1. **No Secrets in Frontend**
- ✅ All API keys stored in backend `.env` file
- ✅ Product IDs managed server-side
- ✅ Frontend only stores license key (user data)

### 2. **Backend API Authentication**
- ✅ Rate limiting on all endpoints
- ✅ Stricter limits on license verification (10/hour)
- ✅ CORS configured for specific origins
- ✅ Helmet.js for security headers

### 3. **Payment Processing**
- ✅ All payments handled on separate landing page
- ✅ No payment gateway code in app
- ✅ License keys sent via email after purchase
- ✅ Backend verifies all license keys

### 4. **License Verification**
- ✅ Client sends license key to backend
- ✅ Backend verifies with Gumroad API
- ✅ Backend checks for refunds/disputes
- ✅ Client receives only validation result

### 5. **Data Flow**
```
User enters license key
    ↓
Frontend → Backend API
    ↓
Backend → Gumroad API
    ↓
Backend validates response
    ↓
Backend → Frontend (valid/invalid)
    ↓
Frontend stores result
```

---

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Push backend code to GitHub**
2. **Connect to deployment platform**
3. **Set environment variables:**
   - `NODE_ENV=production`
   - `PORT=3001` (or platform default)
   - `ALLOWED_ORIGINS=https://your-app-domain.com`
   - `GUMROAD_PRODUCT_ID=your_product_id`
   - `JWT_SECRET=strong_random_string`

4. **Deploy!**

### Frontend Deployment

1. **Update `.env.production`:**
   ```env
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   REACT_APP_LANDING_PAGE_URL=https://your-landing-page.com
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   # Deploy build folder to Netlify/Vercel/etc.
   ```

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/api/health

# Test license verification
curl -X POST http://localhost:3001/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"TEST-KEY-HERE","incrementUses":false}'
```

### Test Frontend

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm start`
3. Go through onboarding flow
4. Try entering a test license key

---

## 📝 API Endpoints

### `POST /api/license/verify`
Verify a license key

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "incrementUses": false
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "purchase": {
    "email": "user@example.com",
    "product_name": "HabitOS",
    ...
  }
}
```

### `POST /api/license/validate`
Validate an existing license (periodic checks)

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "purchase": {...}
}
```

---

## 🚨 Important Security Notes

### **NEVER:**
1. ❌ Commit `.env` files to Git
2. ❌ Share API keys publicly
3. ❌ Hardcode secrets in code
4. ❌ Trust client-side validation for payments
5. ❌ Expose backend endpoints without rate limiting

### **ALWAYS:**
1. ✅ Use environment variables
2. ✅ Validate on server-side
3. ✅ Use HTTPS in production
4. ✅ Implement rate limiting
5. ✅ Log security events
6. ✅ Keep dependencies updated

---

## 🔄 Migration Checklist

- [x] Create backend server
- [x] Move license verification to backend
- [x] Remove payment integrations from frontend
- [x] Update license manager to use backend API
- [x] Create environment variable templates
- [x] Update .gitignore
- [x] Create documentation
- [ ] Deploy backend to production
- [ ] Update frontend environment variables
- [ ] Deploy frontend to production
- [ ] Test end-to-end flow
- [ ] Monitor for errors

---

## 📚 Additional Resources

- [Gumroad API Documentation](https://app.gumroad.com/api)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🆘 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists and has correct values
- Run `npm install` in backend directory

### Frontend can't connect to backend
- Ensure backend is running
- Check `REACT_APP_BACKEND_URL` in `.env.local`
- Check CORS settings in backend

### License verification fails
- Verify `GUMROAD_PRODUCT_ID` is correct
- Check internet connection
- Check backend logs for errors

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Test API endpoints directly
4. Check environment variables

---

**Last Updated:** 2026-01-15
**Version:** 2.0.0 (Security Refactored)
