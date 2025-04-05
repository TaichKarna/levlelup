import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, error } = useAuth();
  // const navigate = useNavigate();

  const handleChange = (e : any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords don't match");
      return false;
    }
    
    if (formData.password.length < 8) {
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
      const { username, email, password } = formData;
      await register({ username, email, password });
      setSuccess(true);
    } catch (err : any) {
      setFormError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="auth-success">
        <h2>Registration Successful!</h2>
        <p>Please check your email to verify your account.</p>
        <Link to="/login" className="auth-button">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2>Create an Account</h2>
      
      {(formError || error) && (
        <div className="error-message">{formError || error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="auth-button">Register</button>
        
        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
      
      <div className="oauth-container">
        <p>Or register with:</p>
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
  );
};

export default RegisterForm;