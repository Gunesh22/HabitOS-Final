/**
 * License Manager for HabitOS
 * Client-side license management - All sensitive operations happen on the backend
 * 
 * ✅ SECURITY BEST PRACTICES:
 * - No API keys in frontend code
 * - All verification happens server-side
 * - Client only stores license key and cached purchase data
 * - Backend validates all license operations
 */

// Backend API URL - configure based on environment
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'https://habitos-final.onrender.com';
const LICENSE_STORAGE_KEY = 'habitos_license';



/**
 * Start the 10-day free trial (Server-Side)
 * @param {string} email
 * @param {string} deviceId
 */
export async function startTrial(email, deviceId) {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/license/start-trial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, deviceId })
        });

        const data = await response.json();

        if (data.success) {
            // Save the server-issued Trial Key as if it were a real license
            saveLicense(data.licenseKey, {
                email,
                product_name: 'HabitOS Trial',
                trial: true,
                expiresAt: data.expiresAt
            });

            // Also keep local marker for UI
            const trialData = {
                startDate: new Date().toISOString(),
                isActive: true,
                serverKey: data.licenseKey
            };
            localStorage.setItem(TRIAL_DATA_KEY, JSON.stringify(trialData));

            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    } catch (e) {
        console.error("Trial start error", e);
        return { success: false, error: "Connection failed" };
    }
}

/**
 * Verify a license key via backend API
 * @param {string} licenseKey - The license key to verify
 * @param {string} productId - Deprecated, kept for compatibility
 * @param {boolean} incrementUses - Whether to increment the usage count
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyLicenseKey(licenseKey, productId = null, incrementUses = false) {
    try {
        // Call backend API instead of Gumroad directly
        const response = await fetch(`${BACKEND_API_URL}/api/license/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                licenseKey: licenseKey.trim(),
                incrementUses
            }),
        });

        const data = await response.json();

        if (data.success && data.valid) {
            return {
                success: true,
                valid: true,
                data: data.data,
                purchase: data.purchase,
                uses: data.uses,
            };
        } else {
            return {
                success: false,
                valid: false,
                error: data.error || 'Invalid license key',
            };
        }
    } catch (error) {
        console.error('License verification error:', error);
        return {
            success: false,
            valid: false,
            error: 'Failed to verify license. Please check your internet connection and ensure the backend server is running.',
        };
    }
}
/**
 * @deprecated This function is now handled by the backend
 * Check if a license is still valid (not refunded, disputed, or subscription ended)
 * @param {Object} purchaseData - Purchase data from backend
 * @returns {boolean} - Whether the license is still valid
 */
export function isLicenseStillValid(purchaseData) {
    // This is now validated by the backend
    // Kept for backward compatibility
    if (!purchaseData) return false;

    // Basic client-side check (backend does the real validation)
    if (purchaseData.refunded || purchaseData.disputed || purchaseData.chargebacked) {
        return false;
    }

    return true;
}

/**
 * Save license data to local storage
 * @param {string} licenseKey - The license key
 * @param {Object} purchaseData - Purchase data from Gumroad
 */
export function saveLicense(licenseKey, purchaseData) {
    const licenseData = {
        key: licenseKey,
        purchase: purchaseData,
        verifiedAt: new Date().toISOString(),
        email: purchaseData.email,
        productName: purchaseData.product_name,
    };

    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
}

/**
 * Get saved license data from local storage
 * @returns {Object|null} - Saved license data or null
 */
export function getSavedLicense() {
    try {
        const data = localStorage.getItem(LICENSE_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading saved license:', error);
        return null;
    }
}

/**
 * Remove saved license from local storage
 */
export function removeLicense() {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
}

/**
 * @deprecated Product ID is now managed securely on the backend
 * Kept for backward compatibility
 */
export function setProductId(productId) {
    console.warn('setProductId is deprecated - product ID is now managed on the backend');
}

/**
 * @deprecated Product ID is now managed securely on the backend
 * Kept for backward compatibility
 */
export function getProductId() {
    console.warn('getProductId is deprecated - product ID is now managed on the backend');
    return null;
}

/**
 * Verify the saved license via backend API (for periodic checks)
 * @param {boolean} incrementUses - Whether to increment usage count
 * @returns {Promise<Object>} - Verification result
 */
export async function verifySavedLicense(incrementUses = false) {
    const savedLicense = getSavedLicense();

    if (!savedLicense) {
        return {
            success: false,
            valid: false,
            error: 'No license found',
        };
    }

    try {
        // Use backend validation endpoint
        const response = await fetch(`${BACKEND_API_URL}/api/license/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                licenseKey: savedLicense.key
            }),
        });

        const result = await response.json();

        if (result.success && result.valid) {
            // Update saved license data with latest info
            saveLicense(savedLicense.key, result.purchase);

            return {
                success: true,
                valid: true,
                data: result.data,
                purchase: result.purchase,
            };
        } else {
            // License is no longer valid, remove it
            removeLicense();
            return result;
        }
    } catch (error) {
        console.error('License validation error:', error);
        // On network error, don't remove license - allow offline usage
        return {
            success: false,
            valid: false,
            error: 'Failed to validate license. Please check your internet connection.',
            offline: true
        };
    }
}

/**
 * Check if user has a valid license
 * @param {boolean} verifyOnline - Whether to verify online (default: false for offline check)
 * @returns {Promise<boolean>} - Whether user has valid license
 */
export async function hasValidLicense(verifyOnline = false) {
    const savedLicense = getSavedLicense();

    if (!savedLicense) {
        return false;
    }

    if (!verifyOnline) {
        // Quick offline check
        return true;
    }

    // Online verification
    const result = await verifySavedLicense(false);
    return result.valid;
}

/**
 * Format license key for display (e.g., XXXX-XXXX-XXXX-XXXX)
 * @param {string} key - License key
 * @returns {string} - Formatted key
 */
export function formatLicenseKey(key) {
    if (!key) return '';
    return key.replace(/(.{4})/g, '$1-').slice(0, -1);
}

/**
 * Validate license key format (basic client-side validation)
 * @param {string} key - License key
 * @returns {boolean} - Whether format is valid
 */
export function isValidLicenseKeyFormat(key) {
    if (!key) return false;

    // Remove hyphens and spaces
    const cleanKey = key.replace(/[-\s]/g, '');

    // Gumroad license keys are typically 32 characters (hex)
    // Format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
    return /^[A-F0-9]{32}$/i.test(cleanKey);
}

// --- USER PROFILE & TRIAL LOGIC ---

const USER_PROFILE_KEY = 'habitos_user_profile';
const TRIAL_DATA_KEY = 'habitos_trial_data';
const TRIAL_DURATION_DAYS = 10;

/**
 * Save user profile details
 * @param {string} name 
 * @param {string} email 
 * @param {string} country 
 */
export function saveUserProfile(name, email, country) {
    const profile = { name, email, country, joinedAt: new Date().toISOString() };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Get user profile
 */
export function getUserProfile() {
    try {
        return JSON.parse(localStorage.getItem(USER_PROFILE_KEY));
    } catch (e) { return null; }
}



/**
 * Check if the user is currently in a valid trial period
 * @returns {object} { isValid: boolean, expired: boolean, daysLeft: number }
 */
export function getTrialStatus() {
    try {
        const data = JSON.parse(localStorage.getItem(TRIAL_DATA_KEY));
        if (!data || !data.startDate) {
            return { isValid: false, expired: false, daysLeft: 0, hasStarted: false };
        }

        const start = new Date(data.startDate);
        const now = new Date();
        // Calculate difference in milliseconds
        const diffTime = now - start;
        // Convert to days
        const exactDays = diffTime / (1000 * 60 * 60 * 24);

        if (exactDays > TRIAL_DURATION_DAYS) {
            return { isValid: false, expired: true, daysLeft: 0, hasStarted: true };
        }

        return {
            isValid: true,
            expired: false,
            daysLeft: Math.ceil(TRIAL_DURATION_DAYS - exactDays),
            hasStarted: true
        };
    } catch (e) {
        return { isValid: false, expired: false, daysLeft: 0, hasStarted: false };
    }
}
