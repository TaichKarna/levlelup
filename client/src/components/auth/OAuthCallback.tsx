import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const { error, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This component just displays loading while the AuthContext handles the OAuth callback
    if (!loading && !error) {
      navigate('/dashboard');
    }
  }, [loading, error, navigate]);

  return (
    <div className="auth-form-container">
      <h2>Processing Authentication</h2>
      {loading ? (
        <p>Completing login, please wait...</p>
      ) : (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
};

export default OAuthCallback;