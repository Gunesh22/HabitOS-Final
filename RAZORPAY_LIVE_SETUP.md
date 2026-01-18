# 🔐 Razorpay Live API Configuration

## Frontend (Website) - ✅ DONE
The live Razorpay key has been updated in `payment.js`:
```javascript
RAZORPAY_KEY: 'rzp_live_S4eel0vxm9fxDk'
```

## Backend (Render) - ⚠️ ACTION REQUIRED

You need to add the Razorpay secret key to Render's environment variables:

### Steps:
1. Go to https://dashboard.render.com
2. Select your **habitos-final** service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key:** `RAZORPAY_KEY_SECRET`
   - **Value:** `5s1T4J31jkK2oEhH3OeJz3SZ`
6. Click **Save Changes**
7. Render will automatically redeploy

### Why This is Needed:
The backend uses the secret key to verify Razorpay webhook signatures. Without it, payment webhooks will fail and licenses won't be auto-generated.

## Security Note
⚠️ **NEVER commit the secret key to Git!** It's stored as an environment variable on Render for security.

## Testing
After adding the environment variable:
1. Make a test payment on your website
2. Check if the license is generated in Firebase
3. Verify you receive the license key email

## Current Status
- ✅ Frontend: Using live key
- ⏳ Backend: Waiting for secret key to be added to Render
- ⏳ Webhooks: Will work after backend is configured
