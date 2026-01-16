const fetch = require('node-fetch'); // You might need to install node-fetch if not available, or use native fetch in newer node
// If node-fetch isn't available, we'll try native fetch (Node 18+)

async function testVerification() {
    const licenseKey = process.argv[2];
    if (!licenseKey) {
        console.log('Usage: node test-verification.js <LICENSE_KEY>');
        process.exit(1);
    }

    console.log(`Testing verification for key: ${licenseKey}`);
    try {
        const response = await fetch('http://localhost:3001/api/license/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey })
        });

        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (data.valid && !data.success) {
            console.log('\n❌ DIAGNOSIS: Server returning "valid: true" but missing "success: true".');
            console.log('👉 SOLUTION: Restart the backend server so it picks up the latest code changes.');
        } else if (data.success && data.valid) {
            console.log('\n✅ DIAGNOSIS: Server response looks correct.');
        } else {
            console.log('\n❌ DIAGNOSIS: License invalid or other error.');
        }

    } catch (error) {
        console.error('Request failed:', error.message);
    }
}

// Check if fetch is available (Node 18+) otherwise warn
if (typeof fetch === 'undefined') {
    console.log('⚠️ Native fetch not found. This script requires Node 18+ or node-fetch package.');
} else {
    testVerification();
}
