import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e : any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setFormError('');
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err : any) {
      setFormError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
    <div>hello</div>
    <div className="auth-form-container">
      <h2>Login to Your Account</h2>
      
      {(formError || error) && (
        <div className="error-message">{formError || error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
         </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="auth-button">Login</button>
        
        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </form>
      
      <div className="oauth-container">
        <p>Or login with:</p>
        <div className="oauth-buttons">
          <a href={`http://localhost:5000/api/auth/google`} className="oauth-button google">
            <i className="fab fa-google"></i> Google
          </a>
          <a href={`http://localhost:5000/api/auth/github`} className="oauth-button github">
            <i className="fab fa-github"></i> GitHub
          </a>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginForm;