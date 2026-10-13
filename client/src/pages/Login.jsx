import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-black p-4">
      <div className="bg-[#111] border border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Log in to your ParkEase account</p>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:border-gray-500" 
              placeholder="e.g. d@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:border-gray-500" 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-bold text-sm shadow">
            Login
          </button>
        </form>

        {/* Quick Demo Login Helpers */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider font-semibold">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('d@example.com', '123456')}
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white p-2 rounded border border-gray-700 text-center transition"
            >
              🚗 Driver Demo<br/><span className="text-[10px] text-gray-500">d@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('p@example.com', '123456')}
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white p-2 rounded border border-gray-700 text-center transition"
            >
              🏢 Owner Demo<br/><span className="text-[10px] text-gray-500">p@example.com</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-white hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;