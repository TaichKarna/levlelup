import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { currentUser, updateProfile, updatePassword, error, loading } : any= useAuth();
  
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || '',
    profilePicture: currentUser?.profilePicture || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileChange = (e : any) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e : any) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e : any) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    
    try {
      await updateProfile(profileData);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err : any) {
      setProfileError(err.response?.data?.message || 'Profile update failed');
    }
  };

  const validatePasswordForm = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    
    return true;
  };

  const handlePasswordSubmit = async (e : any) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (!validatePasswordForm()) return;
    
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err : any) {
      setPasswordError(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>
      
      <div className="profile-section">
        <h2>Profile Information</h2>
        {profileError && <div className="error-message">{profileError}</div>}
        {profileSuccess && <div className="success-message">Profile updated successfully!</div>}
        
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleProfileChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture URL</label>
            <input
              type="text"
              id="profilePicture"
              name="profilePicture"
              value={profileData.profilePicture}
              onChange={handleProfileChange}
            />
          </div>
          
          <button type="submit" className="profile-button" disabled={loading}>
            Update Profile
          </button>
        </form>
      </div>
      
      <div className="profile-section">
        <h2>Account Information</h2>
        <div className="account-info">
          <div className="info-item">
            <strong>Email:</strong> {currentUser?.email}
          </div>
          <div className="info-item">
            <strong>Account Type:</strong> {currentUser?.provider === 'local' ? 'Email/Password' : currentUser?.provider.charAt(0).toUpperCase() + currentUser?.provider.slice(1)}
          </div>
          <div className="info-item">
            <strong>Account Created:</strong> {new Date(currentUser?.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {(currentUser?.provider === 'local' || currentUser?.password) && (
        <div className="profile-section">
          <h2>Change Password</h2>
          {passwordError && <div className="error-message">{passwordError}</div>}
          {passwordSuccess && <div className="success-message">Password updated successfully!</div>}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required={currentUser?.password}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button type="submit" className="profile-button" disabled={loading}>
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;