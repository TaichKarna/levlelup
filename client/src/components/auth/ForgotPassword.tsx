import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const { forgotPassword, error } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Request failed');
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <h2 className="text-2xl font-semibold text-green-600">Password Reset Email Sent</h2>
        <p className="mt-2 text-gray-600">Please check your email for password reset instructions.</p>
        <Link to="/login" className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-700">Forgot Password</h2>
        {(formError || error) && (
          <div className="mt-3 text-sm text-red-600">{formError || error}</div>
        )}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Send Reset Link
          </button>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-500 hover:underline">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;