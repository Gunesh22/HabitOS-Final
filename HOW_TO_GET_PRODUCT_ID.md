# 🔑 How to Get Your Gumroad Product ID

## Step-by-Step Guide

### Step 1: Login to Gumroad
1. Go to **https://app.gumroad.com/login**
2. Enter your email and password
3. Click "Login"

### Step 2: Navigate to Your Product
1. Once logged in, you'll see your dashboard
2. Click on **"Products"** in the left sidebar
3. Find and click on **"Consistency Tracker"** (your product)

### Step 3: Go to the Content Tab
1. At the top of your product page, you'll see tabs: **Overview**, **Content**, **Audience**, etc.
2. Click on the **"Content"** tab

### Step 4: Add License Key Module (if not already added)
1. On the Content page, look for the toolbar with various content modules
2. Click the **three-dot menu (⋮)** or **"+"** button
3. Select **"License key"** from the dropdown menu
4. The License key module will be added to your content page

### Step 5: Find Your Product ID
1. Once the License key module is added, you'll see a section that says:
   
   ```
   Use your product ID to verify licenses through the API.
   ```

2. Below that text, there will be a text box containing your **Product ID**
3. It looks something like this: `SDGgCnivv6gTTHfVRfUBxQ==`
4. Click the **"Copy"** button next to it (or select and copy manually)

### Step 6: Paste into Your Code
1. Open `src/licenseManager.js` in your code editor
2. Go to **line 12**
3. Replace `'YOUR_PRODUCT_ID_HERE'` with your actual Product ID:

**Before:**
```javascript
const DEFAULT_PRODUCT_ID = 'YOUR_PRODUCT_ID_HERE';
```

**After:**
```javascript
const DEFAULT_PRODUCT_ID = 'SDGgCnivv6gTTHfVRfUBxQ=='; // Your actual Product ID
```

4. Save the file

## 🎯 Quick Links

- **Your Product Edit Page**: https://app.gumroad.com/products/madcgz/edit
- **Gumroad Dashboard**: https://app.gumroad.com/
- **License Keys Help**: https://help.gumroad.com/article/76-license-keys

## 📸 Visual Reference

The Product ID is located in the License key module on your product's Content page. It's displayed in a text box with a "Copy" button next to it.

Example of what you'll see:
```
┌─────────────────────────────────────────┐
│ License key                              │
├─────────────────────────────────────────┤
│ Use your product ID to verify licenses  │
│ through the API.                         │
│                                          │
│ Product ID:                              │
│ ┌───────────────────────────┬────────┐  │
│ │ SDGgCnivv6gTTHfVRfUBxQ==  │ [Copy] │  │
│ └───────────────────────────┴────────┘  │
└─────────────────────────────────────────┘
```

## ⚠️ Important Notes

1. **Enable License Keys First**: Make sure you've toggled ON "Generate a unique license key per sale" in the License key module
2. **Product ID Format**: It's usually a base64-encoded string ending with `==`
3. **Keep it Secret**: Don't share your Product ID publicly (though it's not a security risk if exposed)
4. **One Product ID per Product**: Each Gumroad product has its own unique Product ID

## 🧪 Testing After Adding Product ID

Once you've added your Product ID:

1. **Restart your dev server** (if it's running):
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm start
   ```

2. **Test the license screen**:
   - The app should show the license activation screen
   - Try clicking "Purchase now" - it should open your Gumroad product page

3. **Test with a real license**:
   - Make a test purchase of your product
   - Copy the license key from the confirmation email
   - Enter it in the app
   - It should verify and activate! ✅

## 🆘 Troubleshooting

**Can't find the License key module?**
- Make sure you're on the **Content** tab, not Overview
- Look for the **⋮ (three dots)** or **+** button in the toolbar
- The option might be called "License key" or "License keys"

**Product ID not showing?**
- Make sure you've enabled "Generate a unique license key per sale"
- Try refreshing the page
- The Product ID appears automatically once license keys are enabled

**Still can't find it?**
- Contact Gumroad support: https://help.gumroad.com/
- Check their license keys documentation: https://help.gumroad.com/article/76-license-keys

## ✅ Next Steps

After adding your Product ID:

1. ✅ Product ID added to `licenseManager.js`
2. ⬜ Restart dev server
3. ⬜ Test license activation
4. ⬜ Make a test purchase
5. ⬜ Verify license works
6. ⬜ Build executable
7. ⬜ Start selling! 🚀

---

**Need more help?** Check the Gumroad help center or their API documentation!
