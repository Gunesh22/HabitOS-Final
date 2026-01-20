const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    // We expect the private key to be a string in the environment variable.
    // Ideally, pass the entire JSON content of service-account.json into FIREBASE_SERVICE_ACCOUNT
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const RAZORPAY_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const signature = req.headers['x-razorpay-signature'];
        // Vercel parses body automatically. For signature verification, we might need raw body.
        // However, usually JSON.stringify(req.body) works if the order hasn't changed.
        // A safer way in Vercel is to rely on req.body if it's already parsed.
        const body = JSON.stringify(req.body);

        if (!signature) {
            return res.status(400).send('Missing signature');
        }

        if (!RAZORPAY_SECRET) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not set in environment variables');
            return res.status(500).send('Server Configuration Error');
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
                    plan: 'LIFETIME',
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
};
