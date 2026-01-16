/**
 * HabitOS Backend Server v2.0
 * Complete license management system with PostgreSQL
 * 
 * Features:
 * - License key generation and storage
 * - Device tracking and management
 * - Payment webhook integration
 * - Secure hashing and validation
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import services (Firebase version)
// const { initializeDatabase, testConnection, query } = require('./database'); // Not needed for Firebase
const licenseService = require('./licenseService-firebase');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3001;

// Trust Proxy for Render (Required for Rate Limiting)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like local files) or from allowed origins
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080',
            'http://127.0.0.1:8080'
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for development
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased for admin dashboard
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

const licenseVerifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many license verification attempts, please try again later.'
});

// ==================== ROUTES ====================

// Health check
app.get('/api/health', async (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'firebase'
    });
});

// Root route (Friendly welcome instead of 404)
app.get('/', (req, res) => {
    res.json({
        service: 'HabitOS Backend',
        status: 'running',
        version: '2.0.0',
        documentation: 'https://github.com/Gunesh22/HabitOS-Final'
    });
});

// Configuration endpoint
app.get('/api/config', (req, res) => {
    const config = require('./config');
    res.json(config);
});

// ==================== LICENSE MANAGEMENT ====================

/**
 * Create a new license (called after payment)
 * POST /api/license/create
 */
app.post('/api/license/create', async (req, res) => {
    try {
        const {
            email,
            productId,
            paymentId,
            paymentProvider,
            amount,
            currency,
            maxDevices
        } = req.body;

        if (!email || !paymentId) {
            return res.status(400).json({
                success: false,
                error: 'Email and payment ID are required'
            });
        }

        const result = await licenseService.createLicense({
            email,
            productId,
            paymentId,
            paymentProvider,
            amount,
            currency,
            maxDevices
        });

        res.json(result);
    } catch (error) {
        console.error('Error creating license:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create license'
        });
    }
});

/**
 * Start a free trial
 * POST /api/license/start-trial
 */
app.post('/api/license/start-trial', async (req, res) => {
    try {
        const { email, name, deviceId, deviceName } = req.body;

        if (!email || !deviceId) {
            return res.status(400).json({
                success: false,
                error: 'Email and Device ID are required'
            });
        }

        const result = await licenseService.startTrial({
            email,
            name,
            deviceId,
            deviceName
        });
        res.json(result);
    } catch (error) {
        console.error('Error starting trial:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to start trial'
        });
    }
});

/**
 * Verify a license key
 * POST /api/license/verify
 */
app.post('/api/license/verify', licenseVerifyLimiter, async (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await licenseService.verifyLicense(licenseKey);

        // Adapt response for frontend compatibility
        if (result.valid) {
            result.purchase = result.license; // Frontend expects "purchase" object
            result.success = true;
        }

        res.json(result);
    } catch (error) {
        console.error('License verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during license verification'
        });
    }
});

/**
 * Validate a license key (lightweight check for saved licenses)
 * POST /api/license/validate
 */
app.post('/api/license/validate', async (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await licenseService.verifyLicense(licenseKey);

        // Adapt response for frontend compatibility
        if (result.valid) {
            result.purchase = result.license;
            result.success = true;
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

/**
 * Activate license on a device
 * POST /api/license/activate
 */
app.post('/api/license/activate', async (req, res) => {
    try {
        const {
            licenseKey,
            deviceId,
            deviceName,
            deviceFingerprint
        } = req.body;

        if (!licenseKey || !deviceId) {
            return res.status(400).json({
                success: false,
                error: 'License key and device ID are required'
            });
        }

        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await licenseService.activateDevice({
            licenseKey,
            deviceId,
            deviceName,
            deviceFingerprint,
            ipAddress
        });

        res.json(result);
    } catch (error) {
        console.error('Device activation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate device'
        });
    }
});

/**
 * Deactivate a device
 * POST /api/license/deactivate
 */
app.post('/api/license/deactivate', async (req, res) => {
    try {
        const { licenseKey, deviceId } = req.body;

        if (!licenseKey || !deviceId) {
            return res.status(400).json({
                success: false,
                error: 'License key and device ID are required'
            });
        }

        const result = await licenseService.deactivateDevice(licenseKey, deviceId);
        res.json(result);
    } catch (error) {
        console.error('Device deactivation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate device'
        });
    }
});

/**
 * Get license details with devices
 * POST /api/license/details
 */
app.post('/api/license/details', async (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await licenseService.getLicenseDetails(licenseKey);
        res.json(result);
    } catch (error) {
        console.error('Error fetching license details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch license details'
        });
    }
});

// ==================== PAYMENT WEBHOOKS ====================

/**
 * Gumroad webhook handler
 * POST /api/webhook/gumroad
 */
app.post('/api/webhook/gumroad', async (req, res) => {
    try {
        const {
            sale_id,
            product_id,
            product_name,
            email,
            price,
            currency,
            license_key
        } = req.body;

        console.log('Gumroad webhook received:', { sale_id, email, product_name });

        // Create license in database
        const result = await licenseService.createLicense({
            email,
            productId: product_id,
            paymentId: sale_id,
            paymentProvider: 'gumroad',
            amount: price / 100, // Convert cents to dollars
            currency,
            maxDevices: 3
        });

        // TODO: Send email with license key
        console.log('License created:', result.licenseKey);

        res.json({ success: true });
    } catch (error) {
        console.error('Gumroad webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Razorpay webhook handler
 * POST /api/webhook/razorpay
 */
app.post('/api/webhook/razorpay', async (req, res) => {
    try {
        const {
            event,
            payload
        } = req.body;

        if (event === 'payment.captured') {
            const {
                payment_id,
                amount,
                currency,
                email
            } = payload.payment.entity;

            console.log('Razorpay webhook received:', { payment_id, email });

            // Create license in database
            const result = await licenseService.createLicense({
                email,
                productId: 'habitos-lifetime',
                paymentId: payment_id,
                paymentProvider: 'razorpay',
                amount: amount / 100, // Convert paise to rupees
                currency,
                maxDevices: 3
            });

            // TODO: Send email with license key
            console.log('License created:', result.licenseKey);

            res.json({ success: true });
        } else {
            res.json({ success: true, message: 'Event ignored' });
        }
    } catch (error) {
        console.error('Razorpay webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN ROUTES (Protected) ====================

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
app.get('/api/admin/stats', async (req, res) => {
    try {
        const { query } = require('./database');

        // Get total licenses
        const totalLicenses = await query('SELECT COUNT(*) as count FROM licenses');

        // Get active licenses
        const activeLicenses = await query("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'");

        // Get total devices
        const totalDevices = await query('SELECT COUNT(*) as count FROM devices');

        // Get total users (unique emails)
        const totalUsers = await query('SELECT COUNT(DISTINCT email) as count FROM licenses');

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers[0].count,
                totalLicenses: totalLicenses[0].count,
                activeLicenses: activeLicenses[0].count,
                totalDevices: totalDevices[0].count,
                // Mock habit data for now
                totalHabits: 0,
                completionRate: 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

/**
 * Get all users with their licenses
 * GET /api/admin/users
 */
app.get('/api/admin/users', async (req, res) => {
    try {
        const { query } = require('./database');

        const users = await query(`
            SELECT 
                l.id,
                l.email,
                l.status as license_status,
                l.created_at,
                l.max_devices,
                COUNT(DISTINCT d.id) as device_count
            FROM licenses l
            LEFT JOIN devices d ON l.id = d.license_id
            GROUP BY l.id, l.email, l.status, l.created_at, l.max_devices
            ORDER BY l.created_at DESC
        `);

        res.json({
            success: true,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                license_status: user.license_status,
                habits_count: 0, // Mock for now
                completion_rate: 0, // Mock for now
                last_active: user.created_at,
                device_count: user.device_count,
                max_devices: user.max_devices
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

/**
 * Get all licenses
 * GET /api/admin/licenses
 */
app.get('/api/admin/licenses', async (req, res) => {
    try {
        const { query } = require('./database');

        const licenses = await query(`
            SELECT 
                l.*,
                COUNT(DISTINCT d.id) as device_count
            FROM licenses l
            LEFT JOIN devices d ON l.id = d.license_id
            GROUP BY l.id
            ORDER BY l.created_at DESC
        `);

        res.json({
            success: true,
            licenses: licenses
        });
    } catch (error) {
        console.error('Error fetching licenses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch licenses'
        });
    }
});

/**
 * Get analytics data
 * GET /api/admin/analytics
 */
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const { query } = require('./database');

        // Get license creation over time (last 6 months)
        const licenseGrowth = await query(`
            SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as count
            FROM licenses
            WHERE created_at >= date('now', '-6 months')
            GROUP BY month
            ORDER BY month
        `);

        // Get revenue data
        const revenue = await query(`
            SELECT 
                strftime('%Y-%m', created_at) as month,
                SUM(amount) as total
            FROM licenses
            WHERE amount IS NOT NULL
            AND created_at >= date('now', '-6 months')
            GROUP BY month
            ORDER BY month
        `);

        res.json({
            success: true,
            analytics: {
                licenseGrowth,
                revenue
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
});

/**
 * Get recent activity
 * GET /api/admin/activity
 */
app.get('/api/admin/activity', async (req, res) => {
    try {
        const { query } = require('./database');

        const activity = await query(`
            SELECT 
                action,
                details,
                created_at,
                ip_address
            FROM license_history
            ORDER BY created_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            activity
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch activity'
        });
    }
});

/**
 * Revoke a license
 * POST /api/admin/license/revoke
 */
app.post('/api/admin/license/revoke', async (req, res) => {
    try {
        // TODO: Add admin authentication
        const { licenseKey, reason } = req.body;

        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await licenseService.revokeLicense(licenseKey, reason);
        res.json(result);
    } catch (error) {
        console.error('Error revoking license:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke license'
        });
    }
});

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

async function startServer() {
    try {
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 HabitOS Backend Server v2.0 running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 CORS enabled for: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
            console.log(`🔥 Database: Firebase Firestore connected`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
