import React, { useState, useEffect } from 'react';
import './LicenseActivation.css';
import {
    verifyLicenseKey,
    saveLicense,
    getSavedLicense,
    removeLicense,
    isValidLicenseKeyFormat,
    getProductId,
} from './licenseManager';

/**
 * License Activation Component
 * Handles license key entry, verification, and display
 */
function LicenseActivation({ onLicenseVerified, allowSkip = false }) {
    const [licenseKey, setLicenseKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [savedLicense, setSavedLicense] = useState(null);

    useEffect(() => {
        // Check for existing license on mount
        const existing = getSavedLicense();
        if (existing) {
            setSavedLicense(existing);
        }
    }, []);

    const handleLicenseKeyChange = (e) => {
        let value = e.target.value;
        // Basic cleanup but allow flexible input for testing
        value = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        setLicenseKey(value);
        setError('');
    };

    const handleVerify = async () => {
        setError('');
        setSuccess('');

        // Use the key exactly as entered (just trim whitespace)
        // Gumroad requires the hyphens!
        const keyToSend = licenseKey.trim();

        // Basic validation - skipped for flexibility
        /* if (!isValidLicenseKeyFormat(keyToSend)) {
            setError('Please enter a valid license key format (32 characters)');
            return;
        } */

        setIsVerifying(true);

        try {
            const result = await verifyLicenseKey(keyToSend, getProductId(), true);

            if (result.success && result.valid) {
                // Save license
                saveLicense(keyToSend, result.purchase);
                setSavedLicense({
                    key: keyToSend,
                    purchase: result.purchase,
                    verifiedAt: new Date().toISOString(),
                });

                setSuccess('License activated successfully! 🎉');

                // Notify parent component
                setTimeout(() => {
                    if (onLicenseVerified) {
                        onLicenseVerified(result.purchase);
                    }
                }, 1500);
            } else {
                setError(result.error || 'Invalid license key. Please check and try again.');
            }
        } catch (err) {
            setError('Failed to verify license. Please check your internet connection.');
            console.error('Verification error:', err);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDeactivate = () => {
        if (window.confirm('Are you sure you want to deactivate this license? You will need to enter it again to use the app.')) {
            removeLicense();
            setSavedLicense(null);
            setLicenseKey('');
            setSuccess('');
            setError('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isVerifying && licenseKey.length > 0) {
            handleVerify();
        }
    };

    const handlePurchase = () => {
        // Redirect to landing page where all payments are handled securely
        const LANDING_PAGE_URL = process.env.REACT_APP_LANDING_PAGE_URL || 'file:///d:/HabitOS%20website/index.html';
        window.open(LANDING_PAGE_URL, '_blank');
    };

    if (savedLicense) {
        return (
            <div className="license-activation-overlay">
                <div className="license-activation-container activated">
                    <div className="license-header">
                        <div className="license-icon success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2>License Activated</h2>
                    </div>

                    <div className="license-info">
                        <div className="info-row">
                            <span className="info-label">Product:</span>
                            <span className="info-value">{savedLicense.purchase?.product_name || 'HabitOS'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{savedLicense.purchase?.email || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">License Key:</span>
                            <span className="info-value license-key-display">
                                {savedLicense.key?.match(/.{1,8}/g)?.join('-') || 'N/A'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Activated:</span>
                            <span className="info-value">
                                {new Date(savedLicense.verifiedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <button className="btn-deactivate" onClick={handleDeactivate}>
                        Deactivate License
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="license-activation-overlay">
            <div className="license-activation-container">
                <div className="license-header">
                    <div className="license-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2>Activate HabitOS</h2>
                    <p className="license-subtitle">
                        Enter your license key to unlock the full version
                    </p>
                </div>

                <div className="license-form">
                    <div className="input-group">
                        <label htmlFor="license-key">License Key</label>
                        <input
                            id="license-key"
                            type="text"
                            className="license-input"
                            placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                            value={licenseKey}
                            onChange={handleLicenseKeyChange}
                            onKeyPress={handleKeyPress}
                            disabled={isVerifying}
                            autoFocus
                        />
                        <div className="input-hint">
                            Format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
                        </div>
                    </div>

                    {error && (
                        <div className="message error-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="message success-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {success}
                        </div>
                    )}

                    <button
                        className="btn-verify"
                        onClick={handleVerify}
                        disabled={isVerifying || licenseKey.length < 5}
                    >
                        {isVerifying ? (
                            <>
                                <span className="spinner"></span>
                                Verifying...
                            </>
                        ) : (
                            'Activate License'
                        )}
                    </button>

                    <div className="license-actions">
                        <button className="btn-link" onClick={handlePurchase}>
                            Don't have a license? Purchase now
                        </button>

                        {allowSkip && (
                            <button className="btn-link" onClick={() => onLicenseVerified && onLicenseVerified(null)}>
                                Continue with trial
                            </button>
                        )}
                    </div>
                </div>

                <div className="license-footer">
                    <p>
                        Your license key was sent to your email after purchase.
                        <br />
                        Can't find it? Check your spam folder or contact support.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LicenseActivation;
