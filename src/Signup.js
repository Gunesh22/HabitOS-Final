import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from './contexts/AuthContext';
import './LandingPage.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Removed useAuth hook
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signupUser(email, password);
            navigate('/app');
        } catch (err) {
            setError('Failed to create account. ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container fade-in">
                <h1>Create Account</h1>
                <p className="subtitle">Start your journey with HabitOS.</p>
                {error && <div className="error-alert" style={{ color: '#ff4444', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 6 characters" />
                    </div>
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm password" />
                    </div>
                    <button disabled={loading} className="btn-primary full-width" type="submit">
                        {loading ? 'Sign Up' : 'Create Account'}
                    </button>
                </form>

                <div className="footer-link">
                    <p>
                        Already have an account? <Link to="/login" className="text-btn">Log In</Link>
                    </p>
                    <p>
                        <Link to="/" className="text-btn" style={{ fontSize: '0.8rem' }}>Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
