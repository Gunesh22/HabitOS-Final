import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
// For this stage, we use environment variables. 
// User must create a .env file with these values.
// For development/demo purposes without keys, we use placeholders to prevent crash.
// Real auth/sync will fail until keys are added to .env
// Hardcoded keys to ensure immediate connectivity
const firebaseConfig = {
    apiKey: "AIzaSyCUJY_MSuuTZCijpFdTKFd2xGnKAylsWQY",
    authDomain: "habitos-951ab.firebaseapp.com",
    projectId: "habitos-951ab",
    storageBucket: "habitos-951ab.firebasestorage.app",
    messagingSenderId: "1035865064572",
    appId: "1:1035865064572:web:95dddbdf1abd58e89835f9",
    measurementId: "G-VLH8WV00FC"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        // console.warn('Persistence not supported by browser');
    }
});

export { auth, db };
