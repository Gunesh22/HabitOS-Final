# Razorpay Integration Setup Guide

## Overview

HabitOS now supports **dual payment gateways**:
- 🇮🇳 **Razorpay** for Indian users (₹249)
- 🌍 **Gumroad** for International users ($2.99)

The app automatically routes users to the appropriate gateway based on their selected country.

## Razorpay Setup (Required for Indian Payments)

### Step 1: Create Razorpay Account

1. Go to https://dashboard.razorpay.com/signup
2. Sign up with your business details
3. Complete KYC verification (required for live payments)

### Step 2: Get API Keys

1. Login to https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** (for testing)
4. Copy your **Key ID** and **Key Secret**

**Test Keys:**
- Key ID: `rzp_test_XXXXXXXXXXXX`
- Key Secret: `XXXXXXXXXXXXXXXX` (keep this secret!)

**Live Keys** (after KYC approval):
- Key ID: `rzp_live_XXXXXXXXXXXX`
- Key Secret: `XXXXXXXXXXXXXXXX`

### Step 3: Update Your Code

Open `src/Onboarding.js` and replace:

```javascript
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID'; // Replace with your actual Key ID
```

**For Testing:**
```javascript
const RAZORPAY_KEY_ID = 'rzp_test_1A2B3C4D5E6F7G'; // Your test key
```

**For Production:**
```javascript
const RAZORPAY_KEY_ID = 'rzp_live_1A2B3C4D5E6F7G'; // Your live key
```

### Step 4: Adjust Pricing (Optional)

Current price: **₹249** (approximately $2.99 USD)

To change:
```javascript
const RAZORPAY_AMOUNT = 24900; // Amount in paise (₹249 = 24900 paise)
```

Examples:
- ₹99 = 9900 paise
- ₹199 = 19900 paise
- ₹499 = 49900 paise

## Payment Methods Supported

### For Indian Users (Razorpay):
✅ **UPI** - Google Pay, PhonePe, Paytm, BHIM
✅ **Cards** - Debit/Credit (Visa, Mastercard, RuPay, Amex)
✅ **Wallets** - Paytm, PhonePe, Mobikwik, Freecharge
✅ **NetBanking** - All major banks
✅ **EMI** - No-cost EMI options (if enabled)
✅ **Cardless EMI** - ZestMoney, ePayLater

### For International Users (Gumroad):
✅ Credit/Debit Cards
✅ PayPal
✅ Apple Pay
✅ Google Pay

## How It Works

### User Flow:

```
1. User selects country in profile
   ↓
2. If country = India → Shows ₹249 with Razorpay options
   If country ≠ India → Shows $2.99 with Gumroad
   ↓
3. User clicks "Buy Now"
   ↓
4. India: Razorpay checkout opens (all payment methods)
   International: Gumroad overlay opens
   ↓
5. Payment completed
   ↓
6. License key auto-generated and activated
   ↓
7. User gets instant access!
```

### License Key Generation:

**Razorpay purchases:**
- License key is auto-generated (format: `XXXX-XXXX-XXXX-XXXX`)
- Saved locally with payment details
- No email verification needed

**Gumroad purchases:**
- License key provided by Gumroad
- Auto-verified with Gumroad API
- Saved locally after verification

## Testing Razorpay Payments

### Test Cards (Use in Test Mode):

**Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failed Payment:**
- Card: `4000 0000 0000 0002`

**UPI Testing:**
- UPI ID: `success@razorpay`
- Status: Auto-approves

### Test Wallets:
- Select any wallet
- Use OTP: `0000` or `1234`

## Production Checklist

Before going live:

- [ ] Complete Razorpay KYC verification
- [ ] Get Live API keys
- [ ] Update `RAZORPAY_KEY_ID` to live key
- [ ] Test with real payment (₹1 test)
- [ ] Set up webhook for payment notifications (optional)
- [ ] Add your logo URL in Razorpay options
- [ ] Test refund process
- [ ] Enable required payment methods in dashboard

## Razorpay Dashboard

Monitor your payments:
- **Payments**: https://dashboard.razorpay.com/app/payments
- **Settlements**: https://dashboard.razorpay.com/app/settlements
- **Customers**: https://dashboard.razorpay.com/app/customers
- **Reports**: https://dashboard.razorpay.com/app/reports

## Pricing Comparison

| Region        | Gateway   | Price | Currency |
|---------------|-----------|-------|----------|
| India         | Razorpay  | ₹249  | INR      |
| International | Gumroad   | $2.99 | USD      |

**Note:** ₹249 ≈ $2.99 USD (exchange rate may vary)

## Security

- ✅ Razorpay is PCI DSS compliant
- ✅ All payments encrypted (TLS 1.2+)
- ✅ No card data stored in your app
- ✅ License keys generated client-side
- ✅ Payment verification via Razorpay webhooks (optional)

## Troubleshooting

### "Payment system loading..."
- Razorpay script hasn't loaded
- Check internet connection
- Wait 2-3 seconds and try again

### Payment succeeds but app doesn't activate
- Check browser console for errors
- License key is shown in error message
- User can manually enter the key

### Razorpay checkout doesn't open
- Verify API key is correct
- Check if `window.Razorpay` is loaded
- Ensure you're using test key in test mode

## Support

**Razorpay Support:**
- Email: support@razorpay.com
- Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com/

**Gumroad Support:**
- Email: support@gumroad.com
- Dashboard: https://app.gumroad.com/

---

## Quick Start

1. Get Razorpay test key from dashboard
2. Update `RAZORPAY_KEY_ID` in `Onboarding.js`
3. Select "India" as country in app
4. Click "Buy Now"
5. Use test card: `4111 1111 1111 1111`
6. Complete payment
7. App activates instantly! 🎉

**You're all set!** Indian users can now pay with UPI, cards, wallets, and more! 🇮🇳
