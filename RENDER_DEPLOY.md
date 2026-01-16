# 🚀 Deploying HabitOS Backend to Render

Follow these exact steps to get your backend live on Render.

## 1. Prepare Your Code
1.  **Commit & Push** your latest code to GitHub:
    ```bash
    git add .
    git commit -m "Prepare for Render deployment"
    git push origin main
    ```

## 2. Generate Your Secret Key String
Render needs your `service-account.json` but can't read files from your computer. We must convert it to a string.

**Run this command in valid PowerShell:**
```powershell
# Navigate to backend
cd backend

# Convert file to one long base64 string
$bytes = [System.IO.File]::ReadAllBytes("service-account.json")
[System.Convert]::ToBase64String($bytes) | Set-Clipboard
```
✅ **The string is now copied to your clipboard!** (It looks like `ewAiAHQAeQBw...`)

## 3. Create Service on Render
1.  Go to [dashboard.render.com](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Select **Build and deploy from a Git repository**.
4.  Connect your **HabitOS** repository.

## 4. Konfigure the Service
*   **Name**: `habitos-backend` (or similar)
*   **Region**: Singapore (or closest to you)
*   **Branch**: `main`
*   **Root Directory**: `backend`  (⚠️ Important!)
*   **Runtime**: Node
*   **Build Command**: `npm install`
*   **Start Command**: `node server.js`
*   **Instance Type**: Free

## 5. Add Environment Variables (The Secret Sauce)
Scroll down to **Environment Variables**. Add these:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `LICENSE_SALT` | *(Copy from your local .env)* |
| `JWT_SECRET` | *(Copy from your local .env)* |
| `GUMROAD_PRODUCT_ID`| *(Copy from your local .env)* |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | **Paste the long string from your clipboard here** |

## 6. Finish
Click **Create Web Service**.

Render will start building. Watch the logs.
When it says `Live`, it will give you a URL like: `https://habitos-backend.onrender.com`.

**Copy that URL.** You will need it for your Frontend!
