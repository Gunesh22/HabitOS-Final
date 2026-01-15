# 🚀 Quick Start Guide - Secure HabitOS

## For Development

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GUMROAD_PRODUCT_ID
npm run dev
```

### 2. Start Frontend (Terminal 2)
```bash
cd ..
npm install
cp .env.example .env.local
# Edit .env.local if needed (defaults should work)
npm start
```

### 3. Test the App
- Open http://localhost:3000
- Go through onboarding
- Try the free trial or enter a license key

---

## For Production

### Backend (Deploy to Render/Railway/Heroku)
1. Push `backend/` folder to GitHub
2. Connect to your hosting platform
3. Set environment variables:
   - `NODE_ENV=production`
   - `GUMROAD_PRODUCT_ID=your_product_id`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.com`
   - `JWT_SECRET=random_secure_string`
4. Deploy!

### Frontend (Deploy to Netlify/Vercel)
1. Update `.env.production`:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   REACT_APP_LANDING_PAGE_URL=https://your-landing-page.com
   ```
2. Run `npm run build`
3. Deploy `build/` folder

---

## Environment Variables

### Backend (.env)
```env
GUMROAD_PRODUCT_ID=your_product_id_here
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_LANDING_PAGE_URL=https://your-landing-page.com/purchase
```

---

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use different secrets for dev/production
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Monitor rate limiting logs
- [ ] Keep dependencies updated

---

**Need help?** See [README_SECURITY.md](./README_SECURITY.md) for detailed documentation.
