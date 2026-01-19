# HabitOS SaaS Architecture & Implementation Plan

## 1. Executive Summary
**Goal**: Transition HabitOS to a web-only SaaS for the first 1000 users using Firebase Free Tier.
**Core Philosophy**: "Offline-First, Cloud-Sync Second". The application runs primarily on local state (`localStorage`) and uses Firebase strictly as an identity provider and an immutable event log for synchronization between devices.
**Constraints**: 
- Max 3 devices per user.
- No real-time listeners (`onSnapshot`) to save reads.
- Event-based synchronization (Pull + Push).

---

## 2. Infrastructure & Hosting
- **Frontend**: Netlify (React Single Page App).
- **Backend**: Netlify Functions (Serverless).
- **Database**: Firebase Firestore (NoSQL).
- **Authentication**: Firebase Auth (Email/Password only).

---

## 3. Data Model (Firestore Schema)

We use a **Minimal Document Strategy** to keep read/write counts extremely low.

### Collection: `users`
**Document ID**: `{uid}` (Matches Auth UID)
**Purpose**: Stores user status, subscription info, and the "Daily Snapshot" to prevent event log infinite growth.
```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "createdAt": "ISO_TIMESTAMP",
  "plan": "free", // 'free' | 'lifetime'
  "deviceIds": ["dev_A", "dev_B"], // Max 3
  "lastSnapshot": {
    "timestamp": 1705680000000, // Time of snapshot
    "habits": [...], // Compressed JSON string or minimal array of habit objects
    "notes": [...]   // Compressed JSON string
  }
}
```

### Collection: `sync_events`
**Document ID**: `{uid}` (Matches Auth UID)
**Purpose**: A single "Inbox" document for all recent changes. This avoids creating thousands of small documents.
```json
{
  "lastUpdated": 1705680100000,
  "events": [
    // Append-only array of patches
    {
      "id": "evt_001",
      "type": "HABIT_TOGGLE",
      "ts": 1705680050000,
      "deviceId": "dev_A",
      "payload": { "habitId": "h1", "date": "2026-01-20", "value": true }
    },
    {
      "id": "evt_002",
      "type": "NOTE_EDIT",
      "ts": 1705680060000,
      "deviceId": "dev_A",
      "payload": { "noteId": "n1", "diff": "..." }
    }
  ]
}
```

---

## 4. Synchronization Logic (The "Sync Engine")

We do NOT use real-time listeners. We use a **State-Replication-Machine** approach.

### Event Format
Every action in the UI (Toggle Habit, Edit Note, Add Item) generates an **Event Object**:
```javascript
{
  id: uuid(),
  type: string, ('HABIT_CREATE' | 'HABIT_TOGGLE' | 'NOTE_UPDATE' | ...)
  payload: object,
  timestamp: Date.now(),
  deviceId: localStorage.getItem('deviceId')
}
```

### Sync Flow
**1. Local Action (Latency Compensation)**
- User toggles habit.
- App updates UI immediately (Optimistic UI).
- Event is appended to `localStorage.pendingEvents`.

**2. Push (Buffered Write)**
- **Trigger**: Every 30 seconds OR if `pendingEvents.length > 5` OR `window.onBeforeUnload`.
- **Action**: 
  - Read `localStorage.pendingEvents`.
  - Call Netlify Function (or direct Firestore write if rules allow append) to add these events to `sync_events/{uid}.events`.
  - **Firestore Operation**: `arrayUnion` ensures atomic adds without overwriting other device data.
  - Clear local pending queue on success.

**3. Pull (Lazy Read)**
- **Trigger**: App Launch, Window Focus (throttled to 5 mins), or Manual "Sync Now" button.
- **Action**:
  - Fetch `sync_events/{uid}`.
  - Filter events where `timestamp > localStorage.lastSyncTime`.
  - **Merge Logic**:
    - Sort by timestamp.
    - Replay events against local state. 
    - *Conflict Resolution*: Last-Write-Wins (LWW) based on timestamp. Simpler and sufficient for a single-user habit tracker.

**4. Snapshotting (The "Garbage Collector")**
- **Trigger**: Once per day (e.g., first sync of the day).
- **Action**:
  - Client looks at `sync_events/{uid}`. If size > 100 events:
  - Client takes current full state (Habits + Notes).
  - Writes to `users/{uid}.lastSnapshot`.
  - Deletes processed events from `sync_events/{uid}` (or overwrites with empty array).
  - **Safety**: Only happen if `lastSnapshot` timestamp is > 24 hours old.

---

## 5. Security Rules (`firestore.rules`)

These rules strictly enforce the free-tier limits and data privacy.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // reusable function to check auth
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // reusable function to check storage limits
    function isWithinLimits(data) {
       // Example: Ensure huge payloads aren't uploaded
       return request.resource.data.size() < 100000; // 100kb limit per doc write
    }

    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    match /sync_events/{userId} {
      // Users can only read/write their own sync buffer
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

---

## 6. Payment Architecture (International Only)

**Status**: **Disabled**. (Code will be present but unreachable).

**Flow (Future State)**:
1. **Frontend**: User clicks "Upgrade".
2. **Frontend**: Calls Netlify Function `create-checkout-session` (Stripe/Razorpay Int).
3. **Backend**: 
   - Generates session with metadata (`uid`).
   - Returns Checkout URL.
4. **Platform**: User pays on Stripe/Razorpay hosted page.
5. **Webhook**: Stripe/Razorpay calls Netlify Function `webhook-handler`.
6. **Backend**: 
   - Verifies signature (using Secret Key).
   - Updates `users/{uid}` -> set `plan: 'lifetime'`.
   
**Security**: 
- `stripe_secret_key` / `razorpay_secret_key` ONLY in Netlify Env Vars.
- Frontend NEVER sees these keys.

---

## 7. Firebase Free Tier Justification

| Resource | Free Tier Limit | Our Usage per 1000 Users |
| :--- | :--- | :--- |
| **Reads** | 50,000 / day | ~5,000 / day (Assuming 5 syncs/day/user) |
| **Writes** | 20,000 / day | ~10,000 / day (Buffered writes, 10 changes = 1 write) |
| **Storage** | 1 GiB | ~0.5 GiB (snapshots are text-only JSON, 1000 users * 50kb = 50MB) |
| **Connections** | 50,000 concurrent | N/A (We use REST/SDK, no realtime sockets) |

**Why we stay safe**:
1. **No Listeners**: We don't hold open connections.
2. **Batching**: We don't write to DB on every checkbox click. We queue and write approx once per session or minute.
3. **Single Document Sync**: We don't pull 100 documents for habits. We pull 1 document (`sync_events`).
