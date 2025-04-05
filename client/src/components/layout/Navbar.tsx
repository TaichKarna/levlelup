import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Auth App</Link>
      </div>
      
      <div className="navbar-links">
        {currentUser ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;