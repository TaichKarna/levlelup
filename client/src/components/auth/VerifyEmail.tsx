import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const { token } = useParams();
  const { verifyEmail, error } = useAuth();

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token!);
        setStatus('success');
      } catch (err) {
        setStatus('failed');
      }
    };

    verify();
  }, [token, verifyEmail]);

  if (status === 'verifying') {
    return (
      <div className="auth-form-container">
        <h2>Email Verification</h2>
        <p>Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-success">
        <h2>Email Verified Successfully!</h2>
        <p>Your email has been verified. You can now log in to your account.</p>
        <Link to="/login" className="auth-button">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2>Email Verification Failed</h2>
      <p>Sorry, we couldn't verify your email. The verification link may be invalid or expired.</p>
      <p className="error-message">{error}</p>
      <Link to="/login" className="auth-button">Back to Login</Link>
    </div>
  );
};

export default VerifyEmail;