# HabitOS - Electron Desktop Application

## 🚀 Building the Desktop App

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Development Mode

1. **Install Dependencies**
```bash
npm install
```

2. **Run in Development Mode**
```bash
npm run electron:dev
```

This will start both the React dev server and Electron app.

### Building for Production

#### Build for Windows
```bash
npm run electron:build:win
```

Output: `dist/HabitOS Setup.exe` (installer) and `dist/HabitOS.exe` (portable)

#### Build for macOS
```bash
npm run electron:build:mac
```

Output: `dist/HabitOS.dmg`

#### Build for Linux
```bash
npm run electron:build:linux
```

Output: `dist/HabitOS.AppImage` and `dist/HabitOS.deb`

#### Build for All Platforms
```bash
npm run electron:build
```

## 📦 Distribution

### Windows
- **Installer**: `HabitOS Setup.exe` - Full installer with desktop shortcut
- **Portable**: `HabitOS.exe` - Run without installation

### macOS
- **DMG**: `HabitOS.dmg` - Drag and drop installer

### Linux
- **AppImage**: `HabitOS.AppImage` - Universal Linux package
- **DEB**: `HabitOS.deb` - Debian/Ubuntu package

## 🔧 Configuration

### App ID
The app ID is set to `com.habitos.app` in `package.json`

### Icons
Place your app icons in the `public` folder:
- `logo512.png` - Used for all platforms

### Auto-Updates (Optional)
To enable auto-updates, uncomment the auto-updater code in `public/electron.js`

## 🎯 Features

- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Offline-first architecture
- ✅ Local data storage
- ✅ 10-day trial system
- ✅ License activation
- ✅ Payment integration (Razorpay & Gumroad)

## 📝 Notes

- The first build may take 5-10 minutes
- Subsequent builds are faster (2-3 minutes)
- Build output is in the `dist` folder
- Builds are platform-specific (build on Windows for Windows, etc.)

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist build
npm install
npm run electron:build:win
```

### App Won't Start
- Check if port 3000 is available
- Ensure all dependencies are installed
- Check console for errors

## 📚 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [React Documentation](https://react.dev/)
