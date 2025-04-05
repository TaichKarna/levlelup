import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';


const Dashboard = () => {
  const { currentUser } : any = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Welcome, {currentUser?.username}!</h1>
      
      <div className="dashboard-card">
        <div className="user-info">
          {currentUser?.profilePicture && (
            <img 
              src={currentUser.profilePicture} 
              alt="Profile" 
              className="profile-image"
            />
          )}
          <div className="user-details">
            <h2>{currentUser?.username}</h2>
            <p>{currentUser?.email}</p>
          </div>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Account Type</h3>
            <p>{currentUser?.provider === 'local' ? 'Email/Password' : currentUser?.provider.charAt(0).toUpperCase() + currentUser?.provider.slice(1)}</p>
          </div>
          
          <div className="stat-card">
            <h3>Member Since</h3>
            <p>{new Date(currentUser?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="action-card">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/profile" className="action-button">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;