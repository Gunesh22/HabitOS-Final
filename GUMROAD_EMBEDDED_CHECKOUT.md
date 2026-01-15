# Gumroad Embedded Checkout Integration

## Overview

Your HabitOS app now features **in-app purchases** using Gumroad's Overlay checkout. Users never leave your application, and license keys are automatically activated after purchase.

## How It Works

### 1. User Flow

```
User clicks "Buy Now" 
  ↓
Gumroad Overlay opens (in-app modal)
  ↓
User completes payment (all Gumroad payment methods available)
  ↓
Automatic license verification & activation
  ↓
User immediately gets access to the app
```

### 2. Payment Methods Supported

Gumroad Overlay supports **all** Gumroad payment options:
- ✅ Credit/Debit Cards (Visa, Mastercard, Amex, etc.)
- ✅ PayPal
- ✅ Apple Pay
- ✅ Google Pay
- ✅ International cards
- ✅ Multiple currencies

### 3. Automatic License Activation

After successful purchase:
1. Gumroad returns the `license_key` in the success callback
2. App automatically verifies the key with Gumroad API
3. License is saved to `localStorage`
4. User is immediately granted access
5. **No manual key entry required!**

### 4. Fallback Mechanism

If automatic activation fails (network issues, etc.):
- User sees: "Purchase successful! Please check your email for the license key."
- App automatically redirects to license entry screen after 2 seconds
- User can manually enter the key from their email

## Technical Implementation

### Files Modified

1. **`Onboarding.js`**
   - Loads Gumroad.js script dynamically
   - `handlePurchase()` opens Gumroad Overlay
   - Automatic license verification on success
   - Error handling and fallback logic

2. **`Onboarding.css`**
   - Disabled button styles
   - Error message styling

### Key Code

```javascript
window.Gumroad.open({
    product: 'madcgz',           // Your product permalink
    email: formData.email,        // Pre-filled from profile
    success: async function(sale) {
        // Automatic verification & activation
        const result = await verifyLicenseKey(sale.license_key);
        saveLicense(sale.license_key, result.purchase);
        onComplete(); // Show app immediately
    }
});
```

## Testing

### Test the Purchase Flow

1. **Clear localStorage** (see main README)
2. **Start the app** - you'll see onboarding
3. **Fill profile** with your real email
4. **Click "Buy Now"**
5. **Gumroad Overlay opens** - use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
6. **Complete purchase**
7. **App activates automatically!**

### Test with Real Purchase

1. Use your actual email
2. Complete real purchase
3. License activates instantly
4. Check email for receipt (Gumroad sends automatically)

## Gumroad Dashboard

Monitor your sales at:
- **Product**: https://app.gumroad.com/products/madcgz/edit
- **Sales**: https://app.gumroad.com/sales
- **Customers**: https://app.gumroad.com/customers

## Security

- ✅ License verification happens server-side via Gumroad API
- ✅ Product ID is hardcoded (`EYXhUT8BoJz695qU3cJoDQ==`)
- ✅ No sensitive data stored in code
- ✅ Gumroad handles all payment processing (PCI compliant)

## Customization

### Change Price

Update in Gumroad dashboard:
https://app.gumroad.com/products/madcgz/edit

### Change Product

Update `product` in `Onboarding.js`:
```javascript
window.Gumroad.open({
    product: 'your-new-permalink', // Change this
    // ...
});
```

## Troubleshooting

### "Payment system loading..."
- Gumroad.js script hasn't loaded yet
- Wait 1-2 seconds and try again
- Check internet connection

### Purchase succeeds but license doesn't activate
- Check browser console for errors
- Verify Product ID matches in `licenseManager.js`
- User will be redirected to manual entry screen
- License key is in their email

### Overlay doesn't open
- Check if Gumroad.js loaded: `console.log(window.Gumroad)`
- Check browser console for errors
- Ensure product permalink is correct

## Support

If users have payment issues:
1. Check Gumroad dashboard for the transaction
2. Manually send license key from dashboard
3. User can enter key via "Already have a key?" link

---

**You're all set!** Users can now purchase and activate HabitOS without ever leaving your app. 🎉
