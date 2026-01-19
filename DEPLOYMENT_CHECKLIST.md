## 🚀 Deployment Checklist

### 1. Build & Optimize
- [ ] Run `npm run build` to generate the production bundle.
- [ ] Verify there are no critical warnings in the console.

### 2. Firebase Security Rules
- [ ] Go to [Firebase Console](https://console.firebase.google.com/) -> Firestore -> Rules.
- [ ] Copy content from `firestore.rules` in your project.
- [ ] Paste into Firebase Console and hit **Publish**.
- [ ] **Critical:** Confirm the "Simulation" shows hacks verify as denied.

### 3. Indexes (Optional but Recommended)
- [ ] If you see "Index not defined" errors in console, click the link provided in the error log to auto-create them.
- [ ] Generally, `sync_events` might need a composite index on `userId` + `ts`.

### 4. Hosting (Netlify / Vercel / Firebase Hosting)
- [ ] **Build Command:** `npm run build`
- [ ] **Publish Directory:** `build`
- [ ] **Rewrites (Single Page App):** Ensure all routes redirect to `index.html`.
  - *Netlify:* `_redirects` file is essentially just `/* /index.html 200`.
  - *Vercel:* Handles this automatically for Create React App.

### 5. Domain & HTTPS
- [ ] Connect your custom domain (habitos.com).
- [ ] Force HTTPS (Standard on most hosts).

### 6. Post-Launch Verification
- [ ] Sign up a fresh user ("Prod Test").
- [ ] Create 1 habit, 1 note.
- [ ] Reload page to verify persistence.
- [ ] Confirm "Trial" status is active (110 days).

### 7. Future: Enable Payments
- [ ] Create a separate repo/folder for `firebase-functions` (Backend).
- [ ] Implement Razorpay Webhook -> Update `isPaid`.
- [ ] Deploy Functions.
