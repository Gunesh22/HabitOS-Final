# HabitOS - Human Optimization Interface

> A secure, privacy-focused habit tracking application with lifetime license support.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Security](https://img.shields.io/badge/security-hardened-green)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## 🚀 Quick Start

### For Users
1. Download HabitOS from the official website
2. Install and run the application
3. Start your 10-day free trial or enter your license key
4. Begin tracking your habits!

### For Developers

**⚠️ IMPORTANT: This app requires a backend server for license verification**

```bash
# 1. Start Backend (Terminal 1)
cd backend
npm install
cp .env.example .env
# Edit .env and add your GUMROAD_PRODUCT_ID
npm run dev

# 2. Start Frontend (Terminal 2)
cd ..
npm install
cp .env.example .env.local
npm start
```

📖 **Full Setup Guide:** [QUICKSTART.md](./QUICKSTART.md)

---

## 🔒 Security Features

This application follows industry best practices for security:

- ✅ **No API keys in frontend** - All sensitive data on backend
- ✅ **Secure license verification** - Server-side validation only
- ✅ **Rate limiting** - Prevents abuse (10 attempts/hour)
- ✅ **CORS protection** - Configured for specific origins
- ✅ **Environment variables** - No hardcoded secrets
- ✅ **Separate payment processing** - Handled on landing page

📖 **Security Documentation:** [README_SECURITY.md](./README_SECURITY.md)

---

## 📁 Project Structure

```
HabitOS/
├── backend/              # Secure API server (Node.js/Express)
│   ├── server.js        # License verification endpoints
│   ├── package.json     # Backend dependencies
│   └── .env.example     # Environment template
│
├── src/                 # Frontend (React)
│   ├── App.js          # Main application
│   ├── Onboarding.js   # User onboarding flow
│   └── licenseManager.js # License management
│
├── public/             # Static assets
└── build/              # Production build
```

---

## 🎯 Features

- **Habit Tracking** - Track unlimited habits with visual calendar
- **Streak Counting** - Automatic streak calculation
- **Notes/Ideation** - Rich text editor for notes
- **Data Export/Import** - Backup and restore your data
- **10-Day Free Trial** - Full access, no credit card required
- **Lifetime License** - One-time payment, lifetime updates

---

## 🛠️ Tech Stack

### Frontend
- React 19
- React Quill (Rich text editor)
- DnD Kit (Drag and drop)
- Local Storage (Data persistence)

### Backend
- Node.js
- Express.js
- Helmet.js (Security)
- Express Rate Limit
- CORS

---

## 📝 Available Scripts

### Frontend

```bash
npm start          # Start development server (port 3000)
npm run build      # Build for production
npm test           # Run tests
```

### Backend

```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
```

---

## 🌐 Deployment

### Backend (Render/Railway/Heroku)
1. Push backend code to GitHub
2. Connect to hosting platform
3. Set environment variables (see `.env.example`)
4. Deploy!

### Frontend (Netlify/Vercel)
1. Update `.env.production` with backend URL
2. Run `npm run build`
3. Deploy `build/` folder

📖 **Deployment Guide:** [README_SECURITY.md#deployment](./README_SECURITY.md#deployment)

---

## 🔐 Environment Variables

### Backend (.env)
```env
GUMROAD_PRODUCT_ID=your_product_id
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.com
JWT_SECRET=random_secure_string
```

### Frontend (.env.local)
```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_LANDING_PAGE_URL=https://your-landing-page.com
```

---

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[README_SECURITY.md](./README_SECURITY.md)** - Complete security guide
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - What changed in v2.0
- **[DEPRECATED_PAYMENT_DOCS.md](./DEPRECATED_PAYMENT_DOCS.md)** - Old docs (don't use)

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists with correct values
- Run `npm install` in backend directory

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check `REACT_APP_BACKEND_URL` in `.env.local`
- Verify CORS settings in backend

### License verification fails
- Check `GUMROAD_PRODUCT_ID` is correct
- Verify internet connection
- Check backend logs for errors

📖 **More Help:** [README_SECURITY.md#troubleshooting](./README_SECURITY.md#troubleshooting)

---

## 🔄 Version History

### v2.0.0 (2026-01-15) - Security Hardened
- ✅ Complete security refactoring
- ✅ Backend server for license verification
- ✅ Removed payment integrations from frontend
- ✅ Environment variable configuration
- ✅ Rate limiting and CORS protection

### v1.0.0 (Previous)
- Initial release with embedded payments (deprecated)

---

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain secrets
2. **Use HTTPS in production** - Required for security
3. **Set up rate limiting** - Prevents abuse
4. **Monitor backend logs** - Track errors and usage
5. **Keep dependencies updated** - Security patches

---

## 📞 Support

For issues or questions:
1. Check documentation in this repository
2. Review backend logs for errors
3. Test API endpoints directly
4. Verify environment variables

---

## 📄 License

Proprietary software. License required for use.

Purchase a license at: [Your Landing Page URL]

---

## 🙏 Credits

Built with ❤️ using React, Node.js, and modern web technologies.

---

**Last Updated:** 2026-01-15  
**Version:** 2.0.0 (Security Hardened)
