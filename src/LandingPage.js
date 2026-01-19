import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // Import your firebase instance
import './LandingPage.css';

import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const [config, setConfig] = useState({
        trialDays: 110,
        priceInr: 449, // Lifetime
        priceUsd: 5
    });

    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleComingSoon = () => {
        showToast("Payments Disabled: Launching Soon. Enjoy the Free Tier!");
    };



    const { currentUser } = useAuth();

    const handlePaymentSuccess = async (paymentId) => {
        alert(`Payment Successful! ID: ${paymentId}. Welcome to HabitOS Lifetime.`);

        if (currentUser) {
            try {
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    isPaid: true,
                    paymentId: paymentId,
                    plan: 'LIFETIME'
                });
                console.log('User status upgraded to PAID');
            } catch (error) {
                console.error('Error upgrading user:', error);
                alert('Payment recorded, but sync failed. Please contact support.');
            }
        } else {
            console.warn("User not logged in during payment?");
        }

        navigate('/app');
    };

    const handleRazorpayPayment = () => {
        if (!window.Razorpay) {
            alert('Razorpay SDK not loaded. Please check your internet connection.');
            return;
        }

        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
            amount: config.priceInr * 100,
            currency: 'INR',
            name: 'HabitOS',
            description: 'Lifetime Access',
            image: '/logo512.png',
            handler: function (response) {
                handlePaymentSuccess(response.razorpay_payment_id);
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
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
                    <a href="#" className="logo">HabitOS</a>
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
                            <span className="badge">v2.0 Now Available</span>
                            <h1 className="hero-title">Rewire Your <span className="text-gradient">Digital Life</span></h1>
                            <p className="hero-subtitle">The seamless operating system for your habits. Minimalist, powerful, and designed for focus. <br /> Track what matters, stay consistent, and grow—one day at a time.</p>
                            <div className="hero-btns">
                                <button onClick={goToApp} className="btn btn-primary">Launch Web App</button>
                                <a href="#features" className="btn btn-secondary">Explore Features</a>
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
                                            <span className="label">Flow State</span>
                                            <span className="value">Active</span>
                                        </div>
                                        <div className="pulsing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="glow-effect"></div>
                </section>

                <section id="features" className="features">
                    <div className="container">
                        <div className="section-header">
                            <h2>Designed for <span className="text-gradient">Flow</span></h2>
                            <p>Every interaction is crafted to keep you in the zone.</p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="icon-box">⚡</div>
                                <h3>Lightning Fast</h3>
                                <p>Zero latency interactions. Built for speed so you never lose your train of thought.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box">🌑</div>
                                <h3>True Dark Mode</h3>
                                <p>Easy on the eyes, perfect for late-night planning sessions.</p>
                            </div>
                            <div className="feature-card">
                                <div className="icon-box">🔄</div>
                                <h3>Streaks & Goals</h3>
                                <p>Track every habit daily, maintain streaks and leap towards your goals.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="stories" className="stories">
                    <div className="container">
                        <div className="section-header">
                            <h2>Success <span className="text-gradient">Stories</span></h2>
                            <p>See how HabitOS changes lives.</p>
                        </div>
                        <div className="stories-marquee">
                            <div className="marquee-track">
                                {/* Set 1 */}
                                <div className="story-card">
                                    <p className="quote">"I finally managed to build a consistent meditation habit. The interface just gets out of the way."</p>
                                    <div className="author">
                                        <span className="name">Sarah J.</span>
                                        <span className="role">Designer</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <p className="quote">"Productivity apps usually stress me out. HabitOS actually helps me focus."</p>
                                    <div className="author">
                                        <span className="name">Mike T.</span>
                                        <span className="role">Developer</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <p className="quote">"Simple, beautiful, and effective. The best habit tracker I've used."</p>
                                    <div className="author">
                                        <span className="name">Elena R.</span>
                                        <span className="role">Writer</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <p className="quote">"The dark mode is stunning. I use it every night for my journaling routine."</p>
                                    <div className="author">
                                        <span className="name">David K.</span>
                                        <span className="role">Artist</span>
                                    </div>
                                </div>
                                {/* Set 2 (Duplicate for infinite scroll) */}
                                <div className="story-card">
                                    <p className="quote">"I finally managed to build a consistent meditation habit. The interface just gets out of the way."</p>
                                    <div className="author">
                                        <span className="name">Sarah J.</span>
                                        <span className="role">Designer</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <p className="quote">"Productivity apps usually stress me out. HabitOS actually helps me focus."</p>
                                    <div className="author">
                                        <span className="name">Mike T.</span>
                                        <span className="role">Developer</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <p className="quote">"Simple, beautiful, and effective. The best habit tracker I've used."</p>
                                    <div className="author">
                                        <span className="name">Elena R.</span>
                                        <span className="role">Writer</span>
                                    </div>
                                </div>
                                <div className="story-card">
                                    <p className="quote">"The dark mode is stunning. I use it every night for my journaling routine."</p>
                                    <div className="author">
                                        <span className="name">David K.</span>
                                        <span className="role">Artist</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="pricing">
                    <div className="container">
                        <div className="section-header">
                            <h2>Simple <span className="text-gradient">Pricing</span></h2>
                            <p>Invest in your productivity.</p>
                        </div>
                        <div className="pricing-grid">
                            <div className="pricing-card">
                                <div className="pricing-card-inner">
                                    <div className="pricing-front">
                                        <h3>Free</h3>
                                        <div className="price">$0<span>/mo</span></div>
                                        <p>For essential habit tracking.</p>
                                        <ul className="pricing-features">
                                            <li>3 Habits</li>
                                            <li>Basic Stats</li>
                                            <li>Local Storage</li>
                                        </ul>
                                        <button onClick={goToApp} className="btn btn-secondary">Launch Free</button>
                                    </div>
                                    <div className="pricing-back">
                                        <h3>Free</h3>
                                        <div className="price">₹0<span>/mo</span></div>
                                        <p>For essential habit tracking.</p>
                                        <ul className="pricing-features">
                                            <li>3 Habits</li>
                                            <li>Basic Stats</li>
                                            <li>Local Storage</li>
                                        </ul>
                                        <button onClick={goToApp} className="btn btn-secondary">Launch Free</button>
                                    </div>
                                </div>
                            </div>
                            <div className="pricing-card featured">
                                <div className="pricing-card-inner">
                                    <div className="pricing-front">
                                        <div className="popular-tag">Most Popular</div>
                                        <h3>Pro</h3>
                                        <div className="price">$1<span>/life</span></div>
                                        <p>For power users.</p>
                                        <ul className="pricing-features">
                                            <li>Unlimited Habits</li>
                                            <li>Advanced Analytics</li>
                                            <li>Cloud Sync (3 Devices)</li>
                                            <li>110 Days Free Trial</li>
                                        </ul>
                                        <button onClick={handleComingSoon} className="btn btn-primary">Start Free Trial</button>
                                    </div>
                                    <div className="pricing-back">
                                        <div className="popular-tag">Most Popular</div>
                                        <h3>Pro</h3>
                                        <div className="price">₹85<span>/life</span></div>
                                        <p>For power users.</p>
                                        <ul className="pricing-features">
                                            <li>Unlimited Habits</li>
                                            <li>Advanced Analytics</li>
                                            <li>Cloud Sync (3 Devices)</li>
                                            <li>110 Days Free Trial</li>
                                        </ul>
                                        <button onClick={handleComingSoon} className="btn btn-primary">Start Free Trial</button>
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
                                        <button onClick={handleComingSoon} className="btn btn-secondary">Buy Lifetime</button>
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
                                        <button onClick={handleComingSoon} className="btn btn-secondary">Buy Lifetime</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="pricing-note">* Hover on the card to reveal price in Rupee</p>
                    </div>
                </section>

                {toast && (
                    <div style={{
                        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                        background: '#000', border: '1px solid #00ffcc', color: '#00ffcc',
                        padding: '12px 24px', borderRadius: '50px', zIndex: 1000, fontSize: '14px'
                    }}>
                        {toast}
                    </div>
                )}

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
                        <a href="#" className="logo">HabitOS</a>
                        <p>Copyright © 2026 HabitOS Inc.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <a href="#">Features</a>
                        <a href="#pricing">Pricing</a>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="#">About</a>
                        <a href="#">Blog</a>
                    </div>
                    <div className="footer-col">
                        <h4>Social</h4>
                        <a href="#">Twitter</a>
                        <a href="#">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
