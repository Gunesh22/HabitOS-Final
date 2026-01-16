import React, { useState } from 'react';
import './Onboarding.css';
import { saveUserProfile, startTrial } from './licenseManager';
import { COUNTRIES } from './currencyUtils';

/**
 * Onboarding Component - Simplified and Secure
 * 
 * ✅ SECURITY IMPROVEMENTS:
 * - Removed all payment gateway integrations (Razorpay, Gumroad)
 * - No API keys or sensitive data in frontend
 * - Payments handled on separate landing page
 * - User can only start trial or enter existing license key
 */

// Landing page URL where payments are handled
const LANDING_PAGE_URL = process.env.REACT_APP_LANDING_PAGE_URL || 'file:///d:/HabitOS%20website/index.html';

function Onboarding({ onComplete, onLicenseActivation }) {
    const [step, setStep] = useState('profile'); // 'profile' | 'offer'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        country: 'US' // Default
    });
    const [loading, setLoading] = useState(false);

    // Profile Handlers
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            saveUserProfile(formData.name, formData.email, formData.country);
            setStep('offer');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Offer Handlers
    const handleStartTrial = () => {
        setLoading(true);
        setTimeout(() => {
            startTrial();
            onComplete();
        }, 800);
    };

    const handleKeyLink = () => {
        if (onLicenseActivation) onLicenseActivation();
    };

    /**
     * Redirect to landing page for purchase
     * All payment processing happens on the landing page
     */
    const handlePurchase = () => {
        // Build URL with pre-filled user data
        const params = new URLSearchParams({
            email: formData.email,
            name: formData.name,
            country: formData.country
        });

        // Open landing page in new tab
        window.open(`${LANDING_PAGE_URL}?${params.toString()}`, '_blank');

        // Show message to user
        alert('Opening purchase page...\n\nAfter completing your purchase, you will receive a license key via email.\n\nClick "Already have a key?" below to activate your license.');
    };

    // --- RENDER STEP 1: PROFILE ---
    if (step === 'profile') {
        return (
            <div className="onboarding-overlay">
                <div className="onboarding-container fade-in">
                    <h1>Welcome to HabitOS</h1>
                    <p className="subtitle">Let's get to know you better first.</p>

                    <form onSubmit={handleProfileSubmit}>
                        <div className="input-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Country</label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                            >
                                {COUNTRIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn-primary full-width" type="submit">
                            Continue
                        </button>
                    </form>

                    <div className="footer-link">
                        <button className="text-btn" onClick={handleKeyLink}>
                            Already purchased? Enter License Key
                        </button>
                        <button className="text-btn" onClick={() => window.open(LANDING_PAGE_URL, '_blank')} style={{ marginTop: '10px', display: 'block', margin: '10px auto' }}>
                            Visit Website
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER STEP 2: OFFER ---
    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container wide fade-in">
                <h1>Choose Your Path</h1>
                <p className="subtitle">Start building better habits today.</p>

                <div className="offer-grid">
                    {/* Free Trial Card */}
                    <div className="offer-card trial">
                        <div className="badge">Best for testing</div>
                        <h2>Free Trial</h2>
                        <div className="price">10 Days</div>
                        <ul className="features">
                            <li>✅ All Features Unlocked</li>
                            <li>✅ No Credit Card Required</li>
                            <li>✅ Full Access</li>
                        </ul>
                        <button
                            className="btn-secondary full-width"
                            onClick={handleStartTrial}
                            disabled={loading}
                        >
                            {loading ? 'Starting...' : 'Start Free Trial'}
                        </button>
                    </div>

                    {/* Lifetime Access Card */}
                    <div className="offer-card premium">
                        <div className="badge highlight">Most Popular</div>
                        <h2>Lifetime Access</h2>
                        <div className="price">
                            One-time Payment
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
                                Pricing varies by region
                            </div>
                        </div>
                        <ul className="features">
                            <li>✨ One-time payment</li>
                            <li>✨ Lifetime Updates</li>
                            <li>✨ Priority Support</li>
                            <li>✨ Support the Developer</li>
                        </ul>

                        <button
                            className="btn-primary full-width"
                            onClick={handlePurchase}
                            disabled={loading}
                        >
                            View Purchase Options
                        </button>

                        <div className="restore-link">
                            <button className="text-btn-small" onClick={handleKeyLink}>
                                Already have a key?
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '30px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    opacity: 0.6
                }}>
                    <p>
                        🔒 Secure payment processing on our official website
                        <br />
                        💳 Multiple payment methods supported
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Onboarding;
