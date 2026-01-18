# 📦 How to Upload New App Versions

## When You Build a New Version

After running `npm run electron:build:win` in the HabitOS project, you'll have a new `.exe` file.

### Step 1: Create a GitHub Release

1. Go to https://github.com/Gunesh22/HabitOS-Final/releases
2. Click **Draft a new release**
3. **Tag version:** `v0.1.1` (increment the version)
4. **Release title:** `HabitOS v0.1.1`
5. **Description:** Write what changed (e.g., "Fixed trial signup bug")
6. **Attach files:** Drag and drop:
   - `HabitOS Setup 0.1.0.exe` (from `d:\image to text using gemini website\HabitOS\dist\`)
   - Rename it to: `HabitOS-Setup.exe` (remove version number for consistency)
7. Click **Publish release**

### Step 2: Done!

The website automatically uses the **latest** release, so users will get the new version immediately.

## Important Notes

### File Naming
Always rename the file to `HabitOS-Setup.exe` (without version number) so the download URL stays consistent:
```
https://github.com/Gunesh22/HabitOS-Final/releases/latest/download/HabitOS-Setup.exe
```

### Version Numbers
- Update `package.json` version before building
- Use semantic versioning: `v0.1.0`, `v0.1.1`, `v0.2.0`, etc.
- Match the tag version with the app version

### Auto-Deploy Workflow

```
1. Make changes to HabitOS app
2. Build: npm run electron:build:win
3. Create GitHub Release
4. Upload HabitOS-Setup.exe
5. Users automatically get new version!
```

No need to update the website - it always points to `/latest/download/`!

## Quick Commands

```bash
# Build new version
cd "d:\image to text using gemini website\HabitOS"
npm run electron:build:win

# The file will be at:
# d:\image to text using gemini website\HabitOS\dist\HabitOS Setup 0.1.0.exe

# Then upload to GitHub Releases manually
```
