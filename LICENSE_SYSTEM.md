# 🔐 License Management System Documentation

## Overview

HabitOS now includes a complete license management system with PostgreSQL database storage, secure key generation, device tracking, and payment webhook integration.

---

## 🏗️ Architecture

```
Payment Gateway (Gumroad/Razorpay)
    ↓ Webhook
Backend Server
    ↓ Generates License
PostgreSQL Database
    ├── licenses table
    ├── devices table
    └── license_history table
```

---

## 📊 Database Schema

### **licenses** table
```sql
- id (SERIAL PRIMARY KEY)
- license_key (VARCHAR 255, UNIQUE) - Plain text for email delivery
- license_key_hash (VARCHAR 255, UNIQUE) - SHA-256 hash for verification
- email (VARCHAR 255)
- product_id (VARCHAR 255)
- status (VARCHAR 50) - 'active', 'revoked', 'expired'
- max_devices (INTEGER) - Default: 3
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP) - NULL for lifetime licenses
- payment_id (VARCHAR 255)
- payment_provider (VARCHAR 50) - 'gumroad', 'razorpay'
- amount (DECIMAL)
- currency (VARCHAR 10)
```

### **devices** table
```sql
- id (SERIAL PRIMARY KEY)
- license_id (INTEGER, FOREIGN KEY)
- device_id (VARCHAR 255) - Unique device identifier
- device_name (VARCHAR 255) - User-friendly name
- device_fingerprint (TEXT) - Hashed hardware fingerprint
- activated_at (TIMESTAMP)
- last_seen (TIMESTAMP)
- status (VARCHAR 50) - 'active', 'deactivated'
```

### **license_history** table
```sql
- id (SERIAL PRIMARY KEY)
- license_id (INTEGER, FOREIGN KEY)
- action (VARCHAR 100) - 'created', 'device_activated', 'revoked', etc.
- details (TEXT) - JSON details
- ip_address (VARCHAR 45)
- created_at (TIMESTAMP)
```

---

## 🔑 License Key Format

**Format:** `XXXX-XXXX-XXXX-XXXX`

**Example:** `A3F2-B8C1-D4E9-F7A6`

- 16 characters (4 segments of 4)
- Hexadecimal (0-9, A-F)
- Cryptographically secure random generation
- SHA-256 hashed for storage

---

## 🔒 Security Features

### 1. **Secure Hashing**
```javascript
// License keys are hashed with a salt before storage
hash = SHA256(licenseKey + LICENSE_SALT)
```

### 2. **Device Fingerprinting**
```javascript
// Device fingerprints are hashed
fingerprint = SHA256(hardwareInfo)
```

### 3. **Device Limits**
- Default: 3 devices per license
- Configurable per license
- Prevents unlimited sharing

### 4. **Audit Trail**
- All actions logged in `license_history`
- IP addresses recorded
- Timestamps for all events

---

## 📡 API Endpoints

### **1. Create License**
```http
POST /api/license/create
Content-Type: application/json

{
  "email": "user@example.com",
  "productId": "habitos-lifetime",
  "paymentId": "pay_123456",
  "paymentProvider": "gumroad",
  "amount": 2.99,
  "currency": "USD",
  "maxDevices": 3
}

Response:
{
  "success": true,
  "licenseKey": "A3F2-B8C1-D4E9-F7A6",
  "licenseId": 1,
  "email": "user@example.com",
  "createdAt": "2026-01-15T14:00:00Z"
}
```

### **2. Verify License**
```http
POST /api/license/verify
Content-Type: application/json

{
  "licenseKey": "A3F2-B8C1-D4E9-F7A6"
}

Response:
{
  "valid": true,
  "license": {
    "id": 1,
    "email": "user@example.com",
    "status": "active",
    "maxDevices": 3,
    "activeDevices": 1,
    "createdAt": "2026-01-15T14:00:00Z"
  }
}
```

### **3. Activate Device**
```http
POST /api/license/activate
Content-Type: application/json

{
  "licenseKey": "A3F2-B8C1-D4E9-F7A6",
  "deviceId": "device-uuid-12345",
  "deviceName": "John's Laptop",
  "deviceFingerprint": "cpu:intel-i7|ram:16gb|..."
}

Response:
{
  "success": true,
  "license": {
    "email": "user@example.com",
    "status": "active",
    "devicesUsed": 1,
    "maxDevices": 3
  }
}
```

### **4. Deactivate Device**
```http
POST /api/license/deactivate
Content-Type: application/json

{
  "licenseKey": "A3F2-B8C1-D4E9-F7A6",
  "deviceId": "device-uuid-12345"
}

Response:
{
  "success": true,
  "message": "Device deactivated successfully"
}
```

### **5. Get License Details**
```http
POST /api/license/details
Content-Type: application/json

{
  "licenseKey": "A3F2-B8C1-D4E9-F7A6"
}

Response:
{
  "success": true,
  "license": {
    "id": 1,
    "email": "user@example.com",
    "status": "active",
    "maxDevices": 3,
    "activeDevices": 2,
    "devices": [
      {
        "device_id": "device-uuid-12345",
        "device_name": "John's Laptop",
        "activated_at": "2026-01-15T14:00:00Z",
        "last_seen": "2026-01-15T15:30:00Z",
        "status": "active"
      }
    ]
  }
}
```

---

## 🔗 Payment Webhook Integration

### **Gumroad Webhook**
```http
POST /api/webhook/gumroad

Payload from Gumroad:
{
  "sale_id": "abc123",
  "product_id": "EYXhUT8BoJz695qU3cJoDQ==",
  "product_name": "HabitOS Lifetime",
  "email": "user@example.com",
  "price": 299,
  "currency": "usd",
  "license_key": "gumroad-generated-key"
}

Action:
1. Receives payment notification
2. Generates new license key
3. Stores in database
4. Sends email to customer
```

### **Razorpay Webhook**
```http
POST /api/webhook/razorpay

Payload from Razorpay:
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "payment_id": "pay_123456",
        "amount": 24900,
        "currency": "INR",
        "email": "user@example.com"
      }
    }
  }
}

Action:
1. Receives payment notification
2. Generates new license key
3. Stores in database
4. Sends email to customer
```

---

## 🚀 Setup Instructions

### **1. Install PostgreSQL**

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### **2. Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE habitos;

# Exit
\q
```

### **3. Configure Environment Variables**
```bash
# Edit backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/habitos
LICENSE_SALT=your_random_salt_here_never_change_this
```

### **4. Install Dependencies**
```bash
cd backend
npm install
```

### **5. Start Server**
```bash
npm start
```

The server will automatically:
- Connect to PostgreSQL
- Create all required tables
- Initialize indexes

---

## 🧪 Testing

### **1. Test Database Connection**
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T14:00:00Z",
  "database": "connected"
}
```

### **2. Create Test License**
```bash
curl -X POST http://localhost:3001/api/license/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "productId": "test-product",
    "paymentId": "test-payment-123",
    "paymentProvider": "test",
    "amount": 2.99,
    "currency": "USD"
  }'
```

### **3. Verify License**
```bash
curl -X POST http://localhost:3001/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "XXXX-XXXX-XXXX-XXXX"}'
```

---

## 📝 Production Deployment

### **1. Database Setup**

**Render.com:**
1. Create PostgreSQL database
2. Copy `DATABASE_URL` from dashboard
3. Add to environment variables

**Railway.app:**
1. Add PostgreSQL plugin
2. `DATABASE_URL` automatically set

**Heroku:**
1. Add Heroku Postgres addon
2. `DATABASE_URL` automatically set

### **2. Environment Variables**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
LICENSE_SALT=production_salt_never_change
JWT_SECRET=production_jwt_secret
GUMROAD_PRODUCT_ID=your_product_id
```

### **3. Deploy**
```bash
git push origin master
```

---

## 🔧 Maintenance

### **View All Licenses**
```sql
SELECT 
  email, 
  status, 
  created_at,
  (SELECT COUNT(*) FROM devices WHERE license_id = licenses.id) as device_count
FROM licenses
ORDER BY created_at DESC;
```

### **View Active Devices**
```sql
SELECT 
  l.email,
  d.device_name,
  d.activated_at,
  d.last_seen
FROM devices d
JOIN licenses l ON d.license_id = l.id
WHERE d.status = 'active'
ORDER BY d.last_seen DESC;
```

### **Revoke License**
```bash
curl -X POST http://localhost:3001/api/admin/license/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "XXXX-XXXX-XXXX-XXXX",
    "reason": "Refund requested"
  }'
```

---

## ⚠️ Important Notes

1. **NEVER change `LICENSE_SALT`** after creating licenses - it will invalidate all existing licenses
2. **Backup database regularly** - contains all license data
3. **Monitor webhook endpoints** - ensure payment notifications are received
4. **Set up email service** - to send license keys to customers
5. **Implement admin authentication** - protect admin endpoints

---

## 📧 Email Integration (TODO)

Add email service to send license keys:

```javascript
// Example with SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendLicenseEmail(email, licenseKey) {
  const msg = {
    to: email,
    from: 'noreply@habitos.com',
    subject: 'Your HabitOS License Key',
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>Your license key: <strong>${licenseKey}</strong></p>
    `
  };
  await sgMail.send(msg);
}
```

---

**Version:** 2.0.0  
**Last Updated:** 2026-01-15  
**Database:** PostgreSQL
