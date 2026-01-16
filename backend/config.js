/**
 * ⚙️ HabitOS Global Configuration
 * Change values here to update them across the backend.
 * 
 * NOTE: Changing the Price here does NOT change it on Gumroad/Razorpay.
 * You must manually update your payment provider settings to match.
 */
const config = {
    // ⏳ Trial Settings
    TRIAL_DAYS: 10,

    // 💰 Pricing (Used for validation/display)
    PRICE_USD: 10.00,
    PRICE_INR: 85.00,

    // 🔧 App Details
    APP_NAME: "HabitOS",
    VERSION: "2.0.0"
};

module.exports = config;
