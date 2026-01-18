# ✅ CENTRALIZED CONFIG - COMPLETE

## What Was Done

I've created a **single source of truth** for all pricing and trial settings.

### 📁 The Master Config File

**Location:** `backend/config.js`

```javascript
const config = {
    TRIAL_DAYS: 10,      // ← Change trial period here
    PRICE_USD: 10.00,    // ← Change USD price here  
    PRICE_INR: 850.00,   // ← Change INR price here
    APP_NAME: "HabitOS",
    VERSION: "2.0.0"
};
```

## 🔄 What Updates Automatically

When you change values in `backend/config.js` and deploy:

### ✅ Backend
- Trial expiration dates (`TRIAL_DAYS`)
- License validation
- API responses

### ✅ Website  
- Razorpay payment amount (₹850 → ₹85,000 paise)
- Trial period text ("10 Days")
- Price display ("₹850")
- All updates happen on page load via `/api/config`

### ✅ Desktop App
- Trial duration (enforced server-side)
- No rebuild needed!

## 📝 How to Change Settings

### Step 1: Edit Config
```bash
# Open backend/config.js
# Change TRIAL_DAYS, PRICE_INR, or PRICE_USD
```

### Step 2: Deploy
```bash
git add backend/config.js
git commit -m "Update pricing to ₹999"
git push origin main:master
```

### Step 3: Wait
- Render deploys in 2-3 minutes
- Website auto-updates on next page load
- Apps get new settings immediately

## ⚠️ Important Notes

### Payment Providers
You must **manually update** your payment provider dashboards:
- **Razorpay:** Update product price in dashboard
- **Gumroad:** Update product price in settings

The config file controls what your **backend expects**, not what the payment gateway charges.

### Testing
After deploying, verify:
```bash
curl https://habitos-final.onrender.com/api/config
```

Should return:
```json
{
  "TRIAL_DAYS": 10,
  "PRICE_USD": 10,
  "PRICE_INR": 850,
  "APP_NAME": "HabitOS",
  "VERSION": "2.0.0"
}
```

## 📂 Files Modified

1. **backend/config.js** - Master config (already existed)
2. **backend/server.js** - Added `/api/config` endpoint
3. **website/payment.js** - Fetches config, updates UI, uses dynamic prices
4. **website/index.html** - Added CSS classes for dynamic updates
5. **backend/licenseService-firebase.js** - Uses `config.TRIAL_DAYS`

## 🎯 Example: Changing Trial to 7 Days

1. Edit `backend/config.js`:
   ```javascript
   TRIAL_DAYS: 7,  // Changed from 10
   ```

2. Deploy:
   ```bash
   git add backend/config.js
   git commit -m "Reduce trial to 7 days"
   git push origin main:master
   ```

3. Result:
   - Website shows "7 Days" instead of "10 Days"
   - New trials expire after 7 days
   - Existing trials keep their original expiration
   - No app rebuild needed!

## 🚀 You're Done!

Everything is now centralized. Just edit one file and deploy.
