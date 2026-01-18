# 🎛️ HabitOS Configuration Guide

## How to Change Prices and Trial Period

**There is ONE file that controls everything:**

📁 `backend/config.js`

```javascript
const config = {
    // ⏳ Trial Settings
    TRIAL_DAYS: 10,  // ← Change this to update trial period everywhere

    // 💰 Pricing
    PRICE_USD: 10.00,  // ← Change this for USD price
    PRICE_INR: 850.00, // ← Change this for INR price

    // 🔧 App Details
    APP_NAME: "HabitOS",
    VERSION: "2.0.0"
};
```

## What Happens When You Change These Values?

### 1. Backend (Automatic)
- Trial expiration dates use `TRIAL_DAYS`
- License validation uses these prices

### 2. Website (Automatic)
- Payment amounts update automatically
- Trial period text updates on page load
- Fetches config from `/api/config` endpoint

### 3. Desktop App (Automatic)
- Trial duration is enforced by backend
- No rebuild needed!

## How to Deploy Changes

1. **Edit** `backend/config.js`
2. **Commit** and **Push** to GitHub:
   ```bash
   git add backend/config.js
   git commit -m "Update pricing/trial period"
   git push origin main:master
   ```
3. **Wait** 2-3 minutes for Render to deploy
4. **Done!** All systems updated

## Important Notes

⚠️ **Razorpay/Gumroad:** You must manually update your payment provider dashboard to match the new prices. The config file only controls what your backend expects.

✅ **No App Rebuild:** Users don't need to download a new version. The backend controls everything.

## Testing

After deploying, verify:
- Visit `https://habitos-final.onrender.com/api/config`
- Should show your new values
- Website should load the new prices automatically
