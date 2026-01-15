/**
 * HabitOS Backend Server
 * Handles all sensitive operations including license verification
 * 
 * Security Rules:
 * - All API keys stored in environment variables
 * - JWT authentication for user-specific operations
 * - Payment verification happens server-side only
 * - No direct database access from client
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limit for license verification
const licenseVerifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: 'Too many license verification attempts, please try again later.'
});

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// License verification endpoint
app.post('/api/license/verify', licenseVerifyLimiter, async (req, res) => {
    try {
        const { licenseKey, incrementUses = false } = req.body;

        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        // Verify with Gumroad API (server-side only)
        const result = await verifyLicenseWithGumroad(licenseKey, incrementUses);

        res.json(result);
    } catch (error) {
        console.error('License verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during license verification'
        });
    }
});

// License validation endpoint (for periodic checks)
app.post('/api/license/validate', async (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await verifyLicenseWithGumroad(licenseKey, false);

        // Check if license is still valid (not refunded, etc.)
        if (result.success && result.valid) {
            const stillValid = isLicenseStillValid(result.purchase);

            if (!stillValid) {
                return res.json({
                    success: false,
                    valid: false,
                    error: 'License is no longer valid (refunded, disputed, or subscription ended)'
                });
            }
        }

        res.json(result);
    } catch (error) {
        console.error('License validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during license validation'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Verify license key with Gumroad API
 * This function contains the sensitive API call that should NEVER be exposed to the client
 */
async function verifyLicenseWithGumroad(licenseKey, incrementUses = false) {
    const GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify';
    const PRODUCT_ID = process.env.GUMROAD_PRODUCT_ID;

    if (!PRODUCT_ID) {
        throw new Error('GUMROAD_PRODUCT_ID not configured in environment variables');
    }

    // Master key bypass for testing (only in development)
    if (process.env.NODE_ENV === 'development' &&
        (licenseKey.toUpperCase().includes('TEST') || licenseKey.toUpperCase().includes('SKIP'))) {
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
        formData.append('product_id', PRODUCT_ID);
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
        console.error('Gumroad API error:', error);
        return {
            success: false,
            valid: false,
            error: 'Failed to verify license with Gumroad API',
        };
    }
}

/**
 * Check if a license is still valid (not refunded, disputed, or subscription ended)
 */
function isLicenseStillValid(purchaseData) {
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

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 HabitOS Backend Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS enabled for: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
});
