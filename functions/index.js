const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

// IMPORTANT: Set this using: firebase functions:config:set razorpay.secret="YOUR_SECRET"
const RAZORPAY_SECRET = functions.config().razorpay?.secret || "YOUR_TEST_SECRET";

/**
 * Handle Razorpay Webhooks
 * Verifies payment capture and updates user 'isPaid' status secureley.
 */
exports.handleRazorpayWebhook = functions.https.onRequest(async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        if (!signature) {
            return res.status(400).send('Missing signature');
        }

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid Signature');
            return res.status(400).send('Invalid signature');
        }

        // 2. Handle Event
        const event = req.body.event;
        console.log(`Received event: ${event}`);

        if (event === 'payment.captured') {
            const payment = req.body.payload.payment.entity;
            const userId = payment.notes.userId; // Passed from frontend notes

            if (userId) {
                await db.collection('users').doc(userId).update({
                    isPaid: true,
                    paymentId: payment.id,
                    stripeCustomerId: null, // If migrating from Stripe
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`SUCCESS: User ${userId} marked as paid.`);
            } else {
                console.error('Missing userId in payment notes');
            }
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});
