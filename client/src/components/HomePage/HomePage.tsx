import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Secure Authentication System</h1>
        <p>A complete authentication solution with email/password and OAuth options.</p>
        
        {currentUser ? (
          <Link to="/dashboard" className="cta-button">Go to Dashboard</Link>
        ) : (
          <div className="cta-buttons">
            <Link to="/login" className="cta-button">Login</Link>
            <Link to="/register" className="cta-button secondary">Register</Link>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Secure Authentication</h3>
            <p>Email/password authentication with password hashing</p>
          </div>
          
          <div className="feature-card">
            <h3>OAuth Integration</h3>
            <p>Login with Google and GitHub accounts</p>
          </div>
          
          <div className="feature-card">
            <h3>Email Verification</h3>
            <p>Verify your email to activate your account</p>
          </div>
          
          <div className="feature-card">
            <h3>Password Recovery</h3>
            <p>Reset your password if you forgot it</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;