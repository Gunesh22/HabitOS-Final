# 🔥 Firebase Setup Guide

To switch HabitOS to Firebase (Firestore), we need a **Service Account Key**. This allows your backend to securely read/write to your database.

## 1. Create a Firebase Project (if you haven't)

1.  Go to [console.firebase.google.com](https://console.firebase.google.com).
2.  Click **Add project** -> Name it "HabitOS" (or select existing).
3.  Disable Analytics (optional) -> Create Project.

## 2. Set up Firestore

1.  In the Firebase Console sidebar, click **Build** -> **Firestore Database**.
2.  Click **Create database**.
3.  Choose a Location (e.g., `asia-south1` for Mumbai).
4.  Standard Mode: **Production Mode** (locked by default).
    *   *Don't worry about rules for now, the backend bypasses them.*

## 3. Get Service Account Key (The Important Part)

1.  Click the **Gear Icon** (Project Settings) at the top of the sidebar.
2.  Go to the **Service accounts** tab.
3.  Scroll down and click **Generate new private key**.
4.  Click **Generate key**.
5.  **A file will download** (e.g., `habitos-firebase-adminsdk-xxxxx.json`).

## 4. Add the Key to Your Project

1.  **Rename** the downloaded file to `service-account.json`.
2.  **Move** this file into your `backend/` folder.
    *   Path: `backend/service-account.json`

## ✅ Done?

Once you have placed `service-account.json` in the `backend/` folder, let me know!
I will then configure the server to use it.
