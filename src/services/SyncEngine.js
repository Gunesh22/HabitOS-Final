import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

/**
 * SyncEngine: The heart of the "Offline-First" architecture.
 * 
 * Responsibilities:
 * 1. Maintain local state in localStorage (Source of Truth for UI).
 * 2. Queue actions as "Events" in localStorage.
 * 3. Push events to Firestore in batches (Safe Writes).
 * 4. Pull events from Firestore and merge (Lazy Reads).
 */

const SYNC_KEY = 'habitos_sync_events';
const LAST_SYNC_TIME_KEY = 'habitos_last_sync_time';
const DEVICE_ID_KEY = 'habitos_device_id';
const PENDING_EVENTS_KEY = 'habitos_pending_events_queue';

// Generate or retrieve persistent Device ID
const getDeviceId = () => {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
};

// Queue an event locally
export const logEvent = (type, payload) => {
    const event = {
        id: crypto.randomUUID(),
        type,
        payload,
        ts: Date.now(),
        deviceId: getDeviceId()
    };

    const pending = JSON.parse(localStorage.getItem(PENDING_EVENTS_KEY) || '[]');
    pending.push(event);
    localStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(pending));

    return event;
};

// PUSH: Send pending events to Firestore
export const pushEvents = async (userId) => {
    if (!userId) return;

    const pending = JSON.parse(localStorage.getItem(PENDING_EVENTS_KEY) || '[]');
    if (pending.length === 0) return;

    try {
        const userSyncRef = doc(db, 'sync_events', userId);

        await updateDoc(userSyncRef, {
            lastUpdated: Timestamp.now(),
            events: arrayUnion(...pending)
        }).catch(async (err) => {
            if (err.code === 'not-found') {
                await setDoc(userSyncRef, {
                    lastUpdated: Timestamp.now(),
                    events: pending
                });
            } else {
                throw err;
            }
        });

        localStorage.setItem(PENDING_EVENTS_KEY, '[]');

    } catch (error) {
        // Silent fail - will retry next time
    }
};

// PULL: Get remote events and merge
export const pullEvents = async (userId, currentHabits, currentNotes) => {
    if (!userId) return null;

    const lastSync = parseInt(localStorage.getItem(LAST_SYNC_TIME_KEY) || '0');

    try {
        const userSyncRef = doc(db, 'sync_events', userId);
        const docSnap = await getDoc(userSyncRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        const remoteEvents = data.events || [];

        const newEvents = remoteEvents.filter(e => e.ts > lastSync);

        if (newEvents.length === 0) return null;

        let newHabits = [...currentHabits];
        let newNotes = [...currentNotes];

        newEvents.sort((a, b) => a.ts - b.ts);

        newEvents.forEach(e => {
            if (e.type === 'HABIT_ADD') {
                if (!newHabits.find(h => h.id === e.payload.id)) {
                    newHabits.push(e.payload);
                }
            } else if (e.type === 'HABIT_DELETE') {
                newHabits = newHabits.filter(h => h.id !== e.payload.id);
            } else if (e.type === 'HABIT_TOGGLE') {
                const { id, dayIndex, value } = e.payload;
                newHabits = newHabits.map(h => {
                    if (h.id === id) {
                        const updatedHistory = [...h.history];
                        updatedHistory[dayIndex] = value;
                        return { ...h, history: updatedHistory };
                    }
                    return h;
                });
            }
            else if (e.type === 'NOTE_ADD') {
                if (!newNotes.find(n => n.id === e.payload.id)) {
                    newNotes.unshift(e.payload);
                }
            } else if (e.type === 'NOTE_UPDATE') {
                const { id, content, title } = e.payload;
                newNotes = newNotes.map(n =>
                    n.id === id ? { ...n, ...(content !== undefined && { content }), ...(title !== undefined && { title }) } : n
                );
            } else if (e.type === 'NOTE_DELETE') {
                newNotes = newNotes.filter(n => n.id !== e.payload.id);
            }
        });

        const latestTs = newEvents[newEvents.length - 1].ts;
        localStorage.setItem(LAST_SYNC_TIME_KEY, latestTs.toString());

        return { habits: newHabits, notes: newNotes };

    } catch (error) {
        return null;
    }
};

// SNAPSHOT: The Garage Collector
export const performSnapshot = async (userId, habits, notes) => {
    const lastSnapshotTime = parseInt(localStorage.getItem('habitos_last_snapshot') || '0');
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (Date.now() - lastSnapshotTime < ONE_DAY) return;

    try {
        const userRef = doc(db, 'users', userId);
        const syncRef = doc(db, 'sync_events', userId);

        await updateDoc(userRef, {
            lastSnapshot: {
                timestamp: Timestamp.now(),
                habits: JSON.stringify(habits),
                notes: JSON.stringify(notes)
            }
        });

        await setDoc(syncRef, {
            lastUpdated: Timestamp.now(),
            events: []
        });

        localStorage.setItem('habitos_last_snapshot', Date.now().toString());

    } catch (e) {
        // Silent fail
    }
};
