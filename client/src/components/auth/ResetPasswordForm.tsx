import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const { resetPassword, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return false;
    }
    
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) return;
    
    try {
      await resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err : any) {
      setFormError(err.response?.data?.message || 'Password reset failed');
    }
  };

  if (success) {
    return (
      <div className="auth-success">
        <h2>Password Reset Successful!</h2>
        <p>Your password has been reset. You will be redirected to login...</p>
        <Link to="/login" className="auth-button">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2>Reset Password</h2>
      
      {(formError || error) && (
        <div className="error-message">{formError || error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="auth-button">Reset Password</button>
        
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;