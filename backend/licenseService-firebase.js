/**
 * License Service - Firebase Version
 * Adapted for Firebase Firestore
 */

const crypto = require('crypto');
const { db } = require('./firebase');
const admin = require('firebase-admin');
const config = require('./config');

/**
 * Generate a secure license key
 */
function generateLicenseKey() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
        segments.push(segment);
    }
    return segments.join('-');
}

/**
 * Hash a license key for secure storage
 */
function hashLicenseKey(licenseKey) {
    const salt = process.env.LICENSE_SALT || 'default_salt_change_this';
    return crypto
        .createHash('sha256')
        .update(licenseKey + salt)
        .digest('hex');
}

/**
 * Hash device fingerprint
 */
function hashDeviceFingerprint(fingerprint) {
    return crypto
        .createHash('sha256')
        .update(fingerprint)
        .digest('hex');
}

/**
 * Create a new license
 */
async function createLicense({
    email,
    productId,
    paymentId,
    paymentProvider,
    amount,
    currency,
    maxDevices = 3
}) {
    try {
        // Generate license key
        const licenseKey = generateLicenseKey();
        const licenseKeyHash = hashLicenseKey(licenseKey);

        const now = admin.firestore.FieldValue.serverTimestamp();

        // Check if license already exists (optional check)
        const snapshot = await db.collection('licenses')
            .where('license_key_hash', '==', licenseKeyHash)
            .get();

        if (!snapshot.empty) {
            throw new Error('License key collision');
        }

        const licenseData = {
            license_key_hash: licenseKeyHash,
            email,
            product_id: productId,
            payment_id: paymentId,
            payment_provider: paymentProvider,
            amount,
            currency,
            max_devices: maxDevices,
            status: 'active',
            created_at: now,
            updated_at: now
            // We do NOT store the plain text license key
        };

        const licenseRef = await db.collection('licenses').add(licenseData);

        // Log creation
        await db.collection('license_history').add({
            license_id: licenseRef.id,
            action: 'created',
            details: { email, paymentId, paymentProvider },
            created_at: now
        });

        return {
            success: true,
            licenseKey, // Return to user ONCE
            licenseId: licenseRef.id,
            email,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error creating license:', error);
        throw error;
    }
}

/**
 * Start a 10-day free trial
 */
async function startTrial({ email, name, deviceId, deviceName }) {
    try {
        // Check if this email or device already has a trial
        // Note: checking by deviceID is harder without a separate lookup, 
        // effectively we check by email first.

        const licensesRef = db.collection('licenses');
        const snapshot = await licensesRef
            .where('email', '==', email)
            .where('status', '==', 'trial')
            .get();

        if (!snapshot.empty) {
            // Return existing trial if found
            const doc = snapshot.docs[0];
            const data = doc.data();
            // We can't return the key typically because we hash it, 
            // but for trials maybe we regenerate or just return error "Trial already active"
            throw new Error('Trial already active for this email');
        }

        const licenseKey = `TRIAL-${generateLicenseKey()}`;
        const licenseKeyHash = hashLicenseKey(licenseKey);

        const now = admin.firestore.Timestamp.now();
        const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + (config.TRIAL_DAYS * 24 * 60 * 60 * 1000));

        const licenseData = {
            license_key_hash: licenseKeyHash,
            email,
            name: name || 'Trial User', // Save user name
            product_id: 'habitos-trial',
            payment_id: 'trial',
            payment_provider: 'internal',
            amount: 0,
            currency: 'USD',
            max_devices: 1,
            status: 'trial',
            created_at: now,
            updated_at: now,
            expires_at: expiresAt
        };

        const licenseRef = await db.collection('licenses').add(licenseData);

        // Auto-activate the device
        // We reuse activateDevice logic manually or just create the record
        // Adding device record:
        await db.collection('devices').add({
            license_id: licenseRef.id,
            device_id: deviceId,
            device_name: deviceName || 'Trial Device', // Use provided device name
            status: 'active',
            activated_at: now,
            last_seen: now
        });

        // Log
        await db.collection('license_history').add({
            license_id: licenseRef.id,
            action: 'trial_started',
            details: { email, name, deviceId, deviceName },
            created_at: now
        });

        return {
            success: true,
            licenseKey,
            expiresAt: expiresAt.toDate()
        };

    } catch (error) {
        console.error('Error starting trial:', error);
        throw error;
    }
}

/**
 * Verify a license key
 */
async function verifyLicense(licenseKey) {
    const licenseKeyHash = hashLicenseKey(licenseKey);

    const snapshot = await db.collection('licenses')
        .where('license_key_hash', '==', licenseKeyHash)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return {
            valid: false,
            error: 'Invalid license key'
        };
    }

    const doc = snapshot.docs[0];
    const license = doc.data();

    // Check if license is active
    if (license.status !== 'active') {
        return {
            valid: false,
            error: `License is ${license.status}`
        };
    }

    // Check if expired
    if (license.expires_at) {
        const expiresAt = license.expires_at.toDate();
        if (expiresAt < new Date()) {
            return {
                valid: false,
                error: 'License has expired'
            };
        }
    }

    // Get active devices count
    const devicesSnapshot = await db.collection('devices')
        .where('license_id', '==', doc.id)
        .where('status', '==', 'active')
        .get();

    return {
        valid: true,
        license: {
            id: doc.id,
            email: license.email,
            productId: license.product_id,
            status: license.status,
            maxDevices: license.max_devices,
            activeDevices: devicesSnapshot.size,
            createdAt: license.created_at ? license.created_at.toDate() : null,
            expiresAt: license.expires_at ? license.expires_at.toDate() : null
        }
    };
}

/**
 * Activate license on a device
 */
async function activateDevice({
    licenseKey,
    deviceId,
    deviceName,
    deviceFingerprint,
    ipAddress
}) {
    try {
        // Verify license
        const verification = await verifyLicense(licenseKey);
        if (!verification.valid) {
            return {
                success: false,
                error: verification.error
            };
        }

        const license = verification.license;

        // Check if this specific device is already activated
        const deviceSnapshot = await db.collection('devices')
            .where('license_id', '==', license.id)
            .where('device_id', '==', deviceId)
            .where('status', '==', 'active')
            .limit(1)
            .get();

        if (!deviceSnapshot.empty) {
            // Already active, update last seen
            await db.collection('devices').doc(deviceSnapshot.docs[0].id).update({
                last_seen: admin.firestore.FieldValue.serverTimestamp(),
                device_name: deviceName || deviceSnapshot.docs[0].data().device_name
            });

            return {
                success: true,
                license: {
                    email: license.email,
                    status: license.status,
                    devicesUsed: license.activeDevices,
                    maxDevices: license.maxDevices
                }
            };
        }

        // Check device limit
        if (license.activeDevices >= license.maxDevices) {
            return {
                success: false,
                error: `Device limit reached (${license.maxDevices} devices max)`
            };
        }

        // Hash device fingerprint
        const fingerprintHash = deviceFingerprint ? hashDeviceFingerprint(deviceFingerprint) : null;

        // Add new device
        const now = admin.firestore.FieldValue.serverTimestamp();
        await db.collection('devices').add({
            license_id: license.id,
            device_id: deviceId,
            device_name: deviceName,
            device_fingerprint: fingerprintHash,
            status: 'active',
            activated_at: now,
            last_seen: now
        });

        // Log activation
        await db.collection('license_history').add({
            license_id: license.id,
            action: 'device_activated',
            details: { deviceId, deviceName },
            ip_address: ipAddress,
            created_at: now
        });

        return {
            success: true,
            license: {
                email: license.email,
                status: license.status,
                devicesUsed: license.activeDevices + 1,
                maxDevices: license.maxDevices
            }
        };
    } catch (error) {
        console.error('Error activating device:', error);
        throw error;
    }
}

/**
 * Deactivate a device
 */
async function deactivateDevice(licenseKey, deviceId) {
    try {
        const verification = await verifyLicense(licenseKey);
        if (!verification.valid) {
            return {
                success: false,
                error: verification.error
            };
        }

        const license = verification.license;

        // Find the device
        const deviceSnapshot = await db.collection('devices')
            .where('license_id', '==', license.id)
            .where('device_id', '==', deviceId)
            .limit(1)
            .get();

        if (deviceSnapshot.empty) {
            return {
                success: false,
                error: 'Device not found or not linked to this license'
            };
        }

        const deviceDoc = deviceSnapshot.docs[0];

        // Deactivate
        await db.collection('devices').doc(deviceDoc.id).update({
            status: 'deactivated',
            last_seen: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log deactivation
        await db.collection('license_history').add({
            license_id: license.id,
            action: 'device_deactivated',
            details: { deviceId },
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: 'Device deactivated successfully'
        };
    } catch (error) {
        console.error('Error deactivating device:', error);
        throw error;
    }
}

/**
 * Get license details with devices
 */
async function getLicenseDetails(licenseKey) {
    const verification = await verifyLicense(licenseKey);
    if (!verification.valid) {
        return {
            success: false,
            error: verification.error
        };
    }

    const license = verification.license;

    // Get devices
    const devicesSnapshot = await db.collection('devices')
        .where('license_id', '==', license.id)
        .orderBy('activated_at', 'desc')
        .get();

    const devices = [];
    devicesSnapshot.forEach(doc => {
        const data = doc.data();
        devices.push({
            device_id: data.device_id,
            device_name: data.device_name,
            status: data.status,
            activated_at: data.activated_at ? data.activated_at.toDate() : null,
            last_seen: data.last_seen ? data.last_seen.toDate() : null
        });
    });

    return {
        success: true,
        license: {
            ...license,
            devices
        }
    };
}

/**
 * Revoke a license
 */
async function revokeLicense(licenseKey, reason) {
    try {
        const licenseKeyHash = hashLicenseKey(licenseKey);

        const snapshot = await db.collection('licenses')
            .where('license_key_hash', '==', licenseKeyHash)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return {
                success: false,
                error: 'License not found'
            };
        }

        const doc = snapshot.docs[0];

        // Revoke license
        await db.collection('licenses').doc(doc.id).update({
            status: 'revoked',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Deactivate all devices
        const devicesSnapshot = await db.collection('devices')
            .where('license_id', '==', doc.id)
            .where('status', '==', 'active')
            .get();

        const batch = db.batch();
        devicesSnapshot.forEach(deviceDoc => {
            batch.update(deviceDoc.ref, {
                status: 'deactivated',
                last_seen: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();

        // Log revocation
        await db.collection('license_history').add({
            license_id: doc.id,
            action: 'revoked',
            details: { reason },
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            message: 'License revoked successfully'
        };
    } catch (error) {
        console.error('Error revoking license:', error);
        throw error;
    }
}

module.exports = {
    generateLicenseKey,
    hashLicenseKey,
    createLicense,
    verifyLicense,
    activateDevice,
    deactivateDevice,
    getLicenseDetails,
    revokeLicense,
    startTrial
};
