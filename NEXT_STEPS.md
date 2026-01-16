# 🚀 Next Steps: Running HabitOS with Firebase

Your backend is now successfully migrated to **Firebase**. Here is how to verify and run everything.

## 1. Start the Backend

(If it's not already running)
```bash
cd backend
node server.js
```
*You should see:* `🔥 Database: Firebase Firestore connected`

## 2. Start the Frontend

Open a new terminal:
```bash
npm start
```
*This will launch the application at `http://localhost:3000`.*

## 3. Verify the "Unlock" Flow

1.  Go to the **Unlock/Pricing** section of your app.
2.  Click **"I have a License Key"**.
3.  Enter a test key (or create one using the instructions below).
4.  It should verify successfully!

### 🧪 Generating a Test License
**Do NOT use one-line commands.** They might skip loading environment variables (like the security salt).

Instead, run the dedicated script I created:
```bash
# In backend folder
node create-license.js
```
*Copy the `License Key` it outputs and try it in the app.*
