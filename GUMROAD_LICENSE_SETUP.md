# HabitOS - Gumroad License Integration

## Setup Instructions

### 1. Get Your Gumroad Product ID

1. Go to your Gumroad dashboard
2. Create or select your HabitOS product
3. Navigate to the product's content page
4. Click on the three-dot menu and select "License key"
5. Enable "Generate a unique license key per sale"
6. Expand the License key module - you'll see your **Product ID** displayed there

### 2. Configure the Product ID

Open `src/licenseManager.js` and replace `YOUR_PRODUCT_ID_HERE` with your actual Gumroad product ID:

```javascript
const DEFAULT_PRODUCT_ID = 'YOUR_ACTUAL_PRODUCT_ID'; // Example: 'SDGgCnivv6gTTHfVRfUBxQ=='
```

### 3. Update Purchase Link

Open `src/LicenseActivation.js` and update the purchase link (around line 163):

```javascript
const handlePurchase = () => {
  // Replace with your actual Gumroad product URL
  window.open('https://YOUR_USERNAME.gumroad.com/l/YOUR_PRODUCT', '_blank');
};
```

## How It Works

### License Verification Flow

1. **On App Launch**: The app checks for a saved license key in localStorage
2. **Offline Check**: First performs a quick offline check to allow immediate access
3. **Online Verification**: Verifies the license with Gumroad API in the background
4. **Periodic Checks**: Re-verifies the license every 24 hours
5. **Status Monitoring**: Checks for refunds, disputes, chargebacks, and subscription status

### License States

- **Valid**: User has an active, verified license
- **Invalid**: No license found or license verification failed
- **Refunded/Disputed**: Purchase was refunded or disputed
- **Subscription Ended**: For subscription products, the subscription has ended

### API Integration

The app uses Gumroad's License Verification API:

```
POST https://api.gumroad.com/v2/licenses/verify
```

Parameters:
- `product_id`: Your Gumroad product ID
- `license_key`: The customer's license key
- `increment_uses_count`: Whether to increment the usage counter (default: false for checks)

### Features

✅ **Automatic License Validation**: Verifies on startup and periodically
✅ **Offline Support**: Works offline after initial verification
✅ **Refund Detection**: Automatically detects refunded purchases
✅ **Subscription Support**: Handles subscription-based licenses
✅ **Multi-seat Licenses**: Compatible with Gumroad's multi-seat feature
✅ **Beautiful UI**: Premium license activation screen
✅ **Auto-formatting**: License key input with automatic formatting

## Testing

### Test Mode (Development)

For testing without a real license, you can temporarily modify the license check:

In `src/App.js`, comment out the license check:

```javascript
// Temporary: Skip license check for development
useEffect(() => {
  setIsLicenseValid(true);
  setShowLicenseScreen(false);
}, []);
```

**Remember to remove this before building for production!**

### Test with Real License

1. Purchase your own product on Gumroad
2. Copy the license key from your email
3. Enter it in the app
4. Verify it works correctly

## Building for Production

When building the executable:

```bash
npm run build
npm run electron:pack
```

The license system will be fully functional in the packaged app.

## Security Notes

⚠️ **Important**: 
- License verification happens client-side
- Determined users can bypass this protection
- This is suitable for honest customers, not hardcore DRM
- For additional security, consider server-side validation
- Never expose sensitive API keys in client-side code

## Customer Support

If customers lose their license key:
1. They can find it in their purchase email from Gumroad
2. They can access it from their Gumroad Library
3. You can look it up in your Gumroad dashboard under Sales

## Gumroad Resources

- [License Keys Documentation](https://help.gumroad.com/article/76-license-keys)
- [API Documentation](https://app.gumroad.com/api)
- [Gumroad Dashboard](https://app.gumroad.com/)

## Troubleshooting

### "Invalid license key" error
- Verify the product ID is correct
- Check that license keys are enabled for your product
- Ensure the customer copied the full license key

### License not persisting
- Check browser/app localStorage permissions
- Verify the app has write access to localStorage

### API errors
- Check internet connection
- Verify Gumroad API is accessible
- Check browser console for detailed error messages

---

**Need Help?** Contact Gumroad support or check their help center.
