/**
 * License Manager for HabitOS
 * Handles Gumroad license key verification and management
 */

const GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify';
const LICENSE_STORAGE_KEY = 'habitos_license';
const PRODUCT_ID_STORAGE_KEY = 'habitos_product_id';

// Gumroad Product ID (Fallback)
const DEFAULT_PRODUCT_ID = 'EYXhUT8BoJz695qU3cJoDQ==';
// Gumroad Permalink (Primary) - More reliable
const DEFAULT_PRODUCT_PERMALINK = 'madcgz';

/**
 * Verify a license key with Gumroad
 * @param {string} licenseKey - The license key to verify
 * @param {string} productId - Your Gumroad product ID (optional if using permalink)
 * @param {boolean} incrementUses - Whether to increment the usage count
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyLicenseKey(licenseKey, productId = DEFAULT_PRODUCT_ID, incrementUses = false) {
    // 🔓 MASTER KEY BYPASS (For Testing)
    if (licenseKey.toUpperCase().includes('TEST') || licenseKey.toUpperCase().includes('SKIP')) {
        return {
            success: true,
            valid: true,
            uses: 0,
            purchase: {
                email: 'test@habitos.dev',
                product_name: 'HabitOS (Dev Mode)',
                test: true,
                sale_timestamp: new Date().toISOString()
            }
        };
    }

    try {
        const formData = new URLSearchParams();
        // Gumroad explicitly requested product_id for this product
        formData.append('product_id', DEFAULT_PRODUCT_ID);
        formData.append('license_key', licenseKey);
        formData.append('increment_uses_count', incrementUses.toString());

        const response = await fetch(GUMROAD_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                valid: true,
                data: data,
                purchase: data.purchase,
                uses: data.uses,
            };
        } else {
            return {
                success: false,
                valid: false,
                error: data.message || 'Invalid license key',
            };
        }
    } catch (error) {
        console.error('License verification error:', error);
        return {
            success: false,
            valid: false,
            error: 'Failed to verify license. Please check your internet connection.',
        };
    }
}

/**
 * Check if a license is still valid (not refunded, disputed, or subscription ended)
 * @param {Object} purchaseData - Purchase data from Gumroad API
 * @returns {boolean} - Whether the license is still valid
 */
export function isLicenseStillValid(purchaseData) {
    if (!purchaseData) return false;

    // Check if purchase was refunded or disputed
    if (purchaseData.refunded || purchaseData.disputed || purchaseData.chargebacked) {
        return false;
    }

    // Check subscription status if applicable
    if (purchaseData.subscription_id) {
        if (purchaseData.subscription_ended_at ||
            purchaseData.subscription_cancelled_at ||
            purchaseData.subscription_failed_at) {
            return false;
        }
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
 * Set the product ID (useful if you have multiple products)
 * @param {string} productId - Your Gumroad product ID
 */
export function setProductId(productId) {
    localStorage.setItem(PRODUCT_ID_STORAGE_KEY, productId);
}

/**
 * Get the product ID
 * @returns {string} - Product ID
 */
export function getProductId() {
    return localStorage.getItem(PRODUCT_ID_STORAGE_KEY) || DEFAULT_PRODUCT_ID;
}

/**
 * Verify the saved license with Gumroad (for periodic checks)
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

    const result = await verifyLicenseKey(savedLicense.key, getProductId(), incrementUses);

    if (result.success && result.valid) {
        // Check if license is still valid (not refunded, etc.)
        const stillValid = isLicenseStillValid(result.purchase);

        if (!stillValid) {
            removeLicense();
            return {
                success: false,
                valid: false,
                error: 'License is no longer valid (refunded, disputed, or subscription ended)',
            };
        }

        // Update saved license data
        saveLicense(savedLicense.key, result.purchase);

        return {
            success: true,
            valid: true,
            data: result.data,
            purchase: result.purchase,
        };
    } else {
        removeLicense();
        return result;
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
