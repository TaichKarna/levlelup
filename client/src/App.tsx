import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPassword';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import VerifyEmail from './components/auth/VerifyEmail';
import OAuthCallback from './components/auth/OAuthCallback';
import Dashboard from './components/dashboard/Dashboard';
import ProfilePage from './components/user/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/ProtectedRoute';
import HomePage from './components/HomePage/HomePage';
// import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              
              {/* Auth Routes - Only accessible when logged out */}
              {/* <Route element={<PublicRoute />}> */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
              {/* </Route> */}
              
              {/* Verification Routes - Accessible to all */}
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              
              {/* Protected Routes - Only accessible when logged in */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
