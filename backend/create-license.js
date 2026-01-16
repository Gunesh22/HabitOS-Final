require('dotenv').config();
const licenseService = require('./licenseService-firebase');

async function createTestLicense() {
    try {
        console.log('🔑 Generating test license...');
        console.log('Salt being used:', process.env.LICENSE_SALT || 'default (WARNING: mismatch risk)');

        const result = await licenseService.createLicense({
            email: 'test@example.com',
            productId: 'habitos-lifetime',
            paymentId: 'manual-' + Date.now(),
            paymentProvider: 'manual-test',
            amount: 10,
            currency: 'USD',
            maxDevices: 3
        });

        console.log('\n✅ License Created Successfully!');
        console.log('------------------------------------------------');
        console.log('License Key:', result.licenseKey);
        console.log('------------------------------------------------');
        console.log('Copy this key and try again in the app.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestLicense();
