import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from './contexts/AuthContext';
import './LandingPage.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Removed useAuth hook
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await loginUser(email, password);
            navigate('/app');
        } catch (err) {
            setError('Failed to sign in. ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container fade-in">
                <h1>Welcome Back</h1>
                <p className="subtitle">Sign in to continue your streak.</p>
                {error && <div className="error-alert" style={{ color: '#ff4444', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
                    </div>
                    <button disabled={loading} className="btn-primary full-width" type="submit">
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div className="footer-link">
                    <p>
                        Need an account? <Link to="/signup" className="text-btn">Sign Up</Link>
                    </p>
                    <p>
                        <Link to="/" className="text-btn" style={{ fontSize: '0.8rem' }}>Back to Home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
