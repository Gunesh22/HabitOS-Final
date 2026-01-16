/**
 * Firebase Configuration
 * Connects to Firestore using the Service Account Key
 * Supports both local file (dev) and Environment Variable (production/Render)
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

try {
    // 1. Try to load from Environment Variable (Render/Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        console.log('Using FIREBASE_SERVICE_ACCOUNT_BASE64 from environment');
        const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
        serviceAccount = JSON.parse(buffer.toString('utf-8'));
    }
    // 2. Try to load from Local File (Development)
    else {
        const serviceAccountPath = path.join(__dirname, 'service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
            console.log('Using local service-account.json');
            serviceAccount = require(serviceAccountPath);
        } else {
            throw new Error('No service account found (Env Var or File missing)');
        }
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    console.log('✅ Firebase Admin initialized successfully');

    module.exports = {
        admin,
        db
    };
} catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        console.error('👉 Tip: For local dev, ensure backend/service-account.json exists.');
        console.error('👉 Tip: For Render, set FIREBASE_SERVICE_ACCOUNT_BASE64 env var.');
    }
    process.exit(1);
}
