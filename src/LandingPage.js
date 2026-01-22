import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
// import { doc, updateDoc } from 'firebase/firestore';
// import { db } from './firebase'; // Import your firebase instance
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const config = {
        trialDays: 110,
        priceInr: 449, // Lifetime
        priceUsd: 5
    };

    const handlePaymentSuccess = async (paymentId) => {
        // UI Feedback ONLY. The actual verification happens via Webhook on the backend.
        // We do typically wait for the backend, but for UX we just say success.
        alert(`Payment Initiated! ID: ${paymentId}. Your account will be upgraded momentarily.`);
        navigate('/app');
    };

    const handleRazorpayPayment = () => {
        if (!currentUser) {
            alert("Please log in or sign up first to attach the license to your account.");
            navigate('/app'); // Redirect to Signup/Login
            return;
        }

        if (!window.Razorpay) {
            alert('Razorpay SDK not loaded. Please check your internet connection.');
            return;
        }

        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag", // Ensure this ENV is set in Vercel
            amount: config.priceInr * 100,
            currency: 'INR',
            name: 'HabitOS',
            description: 'Lifetime Access License',
            image: '/logo512.png',
            order_id: "", // For simple integration we rely on auto-capture. Ideally create order on backend.
            handler: function (response) {
                handlePaymentSuccess(response.razorpay_payment_id);
            },
            prefill: {
                name: currentUser.displayName || '',
                email: currentUser.email || '',
                contact: ''
            },
            notes: {
                userId: currentUser.uid // CRITICAL: This allows the backend to verify who paid
            },
            theme: { color: '#00ffcc' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    useEffect(() => {
        // Smooth scrolling for anchor links
        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        // Simple fade-in on scroll observer
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const fadeElements = document.querySelectorAll('.feature-card, .cta-card');
        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            observer.disconnect();
        };
    }, []);

    const goToApp = () => {
        navigate('/app');
    };

    return (
        <div className="landing-page">
            <header className="header">
                <div className="container nav-container">
                    <a href="/" className="logo">HabitOS</a>
                    <nav className="nav">
                        <ul className="nav-list">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#stories">Stories</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                    </nav>
                    <button onClick={goToApp} className="btn btn-primary">Launch Web App</button>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="container hero-content">
                        <div className="hero-text-wrapper">
                            <span className="badge">Voluntary Seriousness</span>
                            <h1 className="hero-title">The Integrity System for the <span className="text-gradient">Self-Governed</span></h1>
                            <p className="hero-subtitle">
                                For those with no boss, no grades, and no deadlines.<br />
                                A voluntary self-binding system for people who choose difficult paths.
                            </p>
                            <div className="hero-btns">
                                <button onClick={goToApp} className="btn btn-primary">Enter Protocol</button>
                                <a href="#manifesto" className="btn btn-secondary">Read the Manifesto</a>
                            </div>
                        </div>
                        {/* Hero Visual */}
                        <div className="hero-visual">
                            <div className="flow-orb-container">
                                <div className="orb-layer layer-1"></div>
                                <div className="orb-layer layer-2"></div>
                                <div className="orb-layer layer-3"></div>
                                <div className="orb-core">
                                    <div className="glass-panel">
                                        <div className="stat-row">
                                            <span className="label">Integrity State</span>
                                            <span className="value">Locked</span>
                                        </div>
                                        <div className="pulsing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="glow-effect"></div>
                </section>

                <section id="manifesto" className="features">
                    <div className="container">
                        <div className="section-header">
                            <h2>Who This Is <span className="text-gradient">For</span></h2>
                            <p>This product is not for everyone. That is a feature, not a flaw.</p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="icon-box">🏹</div>
                                <h3>The Archetype</h3>
                                <p>Solo founders, Indie hackers, Athletes training alone, and spiritual practitioners. People who fail silently and late.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box">⚖️</div>
                                <h3>Why You Pay</h3>
                                <p>Not for software. You pay because you respect systems that demand honesty. Consistency is your livelihood and identity.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box">🧱</div>
                                <h3>Structure, Not Motivation</h3>
                                <p>You don't need a cheerleader. You need a framework that respects your seriousness.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="principles" className="stories">
                    <div className="container">
                        <div className="section-header">
                            <h2>Non-Negotiable <span className="text-gradient">Rules</span></h2>
                            <p>We reject gamification. We embrace friction.</p>
                        </div>

                        <div className="features-grid" style={{ marginTop: '40px' }}>
                            <div className="pricing-card" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <div className="pricing-card-inner">
                                    <div className="pricing-front" style={{ textAlign: 'left', padding: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Friction to Quit</h3>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Instant quitting encourages impulse escape. We force you to pause, reflect, and confirm. Conscious disengagement respects your autonomy.</p>
                                    </div>
                                    {/* Back intentionally same for effect if hovered */}
                                    <div className="pricing-back" style={{ textAlign: 'left', padding: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Friction to Quit</h3>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Instant quitting encourages impulse escape. We force you to pause, reflect, and confirm. Conscious disengagement respects your autonomy.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pricing-card" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <div className="pricing-card-inner">
                                    <div className="pricing-front" style={{ textAlign: 'left', padding: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Chosen Witnesses</h3>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Fully private leads to self-deception. Fully public leads to performance. We offer opt-in visibility for 1-3 trusted witnesses.</p>
                                    </div>
                                    <div className="pricing-back" style={{ textAlign: 'left', padding: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Chosen Witnesses</h3>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Fully private leads to self-deception. Fully public leads to performance. We offer opt-in visibility for 1-3 trusted witnesses.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pricing-card" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <div className="pricing-card-inner">
                                    <div className="pricing-front" style={{ textAlign: 'left', padding: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Integrity Drift</h3>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>We don't predict "dropouts." We detect weakening commitment to help you reset. The system protects you from yourself, not against you.</p>
                                    </div>
                                    <div className="pricing-back" style={{ textAlign: 'left', padding: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Integrity Drift</h3>
                                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>We don't predict "dropouts." We detect weakening commitment to help you reset. The system protects you from yourself, not against you.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="pricing">
                    <div className="container">
                        <div className="section-header">
                            <h2>Commitment <span className="text-gradient">Pricing</span></h2>
                            <p>Invest in your word.</p>
                        </div>
                        <div className="pricing-grid">
                            <div className="pricing-card">
                                <div className="pricing-card-inner">
                                    <div className="pricing-front">
                                        <h3>Visitor</h3>
                                        <div className="price">$0<span>/mo</span></div>
                                        <p>To understand the philosophy.</p>
                                        <ul className="pricing-features">
                                            <li>3 Protocols</li>
                                            <li>Local Storage</li>
                                            <li>Manual Integrity Checks</li>
                                        </ul>
                                        <button onClick={goToApp} className="btn btn-secondary">Enter</button>
                                    </div>
                                    <div className="pricing-back">
                                        <h3>Visitor</h3>
                                        <div className="price">₹0<span>/mo</span></div>
                                        <p>To understand the philosophy.</p>
                                        <ul className="pricing-features">
                                            <li>3 Protocols</li>
                                            <li>Local Storage</li>
                                            <li>Manual Integrity Checks</li>
                                        </ul>
                                        <button onClick={goToApp} className="btn btn-secondary">Enter</button>
                                    </div>
                                </div>
                            </div>
                            <div className="pricing-card featured">
                                <div className="pricing-card-inner">
                                    <div className="pricing-front">
                                        <div className="popular-tag">Recommended</div>
                                        <h3>Practitioner</h3>
                                        <div className="price">$1<span>/mo</span></div>
                                        <p>For sustainable growth.</p>
                                        <ul className="pricing-features">
                                            <li>Unlimited Protocols</li>
                                            <li>Integrity Drift Analytics</li>
                                            <li>Cloud Sync (3 Devices)</li>
                                            <li>110 Days Free Trial</li>
                                        </ul>
                                        <button onClick={goToApp} className="btn btn-primary">Start Trial</button>
                                    </div>
                                    <div className="pricing-back">
                                        <div className="popular-tag">Recommended</div>
                                        <h3>Practitioner</h3>
                                        <div className="price">₹85<span>/mo</span></div>
                                        <p>For power users.</p>
                                        <ul className="pricing-features">
                                            <li>Unlimited Habits</li>
                                            <li>Advanced Analytics</li>
                                            <li>Cloud Sync (3 Devices)</li>
                                            <li>110 Days Free Trial</li>
                                        </ul>
                                        <button onClick={goToApp} className="btn btn-primary">Start Free Trial</button>
                                    </div>
                                </div>
                            </div>
                            <div className="pricing-card">
                                <div className="pricing-card-inner">
                                    <div className="pricing-front">
                                        <h3>Lifetime</h3>
                                        <div className="price">$5<span>/once</span></div>
                                        <p>Pay once, own it forever.</p>
                                        <ul className="pricing-features">
                                            <li>All Pro Features</li>
                                            <li>Early Access</li>
                                            <li>Priority Support</li>
                                        </ul>
                                        <button onClick={handleRazorpayPayment} className="btn btn-secondary">Buy Lifetime</button>
                                    </div>
                                    <div className="pricing-back">
                                        <h3>Lifetime</h3>
                                        <div className="price">₹449<span>/once</span></div>
                                        <p>Pay once, own it forever.</p>
                                        <ul className="pricing-features">
                                            <li>All Pro Features</li>
                                            <li>Early Access</li>
                                            <li>Priority Support</li>
                                        </ul>
                                        <button onClick={handleRazorpayPayment} className="btn btn-secondary">Buy Lifetime</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="pricing-note">* Hover on the card to reveal price in Rupee</p>
                    </div>
                </section>



                <section id="cta" className="cta-section">
                    <div className="container">
                        <div className="cta-card">
                            <h2>Ready to upgrade your routine?</h2>
                            <p>Join 10,000+ users building better habits today.</p>
                            <button onClick={goToApp} className="btn btn-primary large">Start HabitOS</button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-col">
                        <a href="/" className="logo">HabitOS</a>
                        <p>Copyright © 2026 HabitOS Inc.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <a href="/">Features</a>
                        <a href="#pricing">Pricing</a>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="/">About</a>
                        <a href="/">Blog</a>
                    </div>
                    <div className="footer-col">
                        <h4>Social</h4>
                        <a href="/">Twitter</a>
                        <a href="/">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
