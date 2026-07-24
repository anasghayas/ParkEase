import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-black">
      <div className="bg-[#111] border border-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back</h2>
        {error && <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-white text-black py-2 rounded-md hover:bg-gray-200 transition font-medium">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Don't have an account? <Link to="/register" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
