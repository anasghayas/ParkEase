import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-black py-12">
      <div className="bg-[#111] border border-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create Account</h2>
        {error && <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" name="name" onChange={handleChange} required
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" name="email" onChange={handleChange} required
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" name="password" onChange={handleChange} required
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <input 
              type="tel" name="phone" onChange={handleChange}
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">I am a...</label>
            <select 
              name="role" onChange={handleChange}
              className="w-full px-4 py-2 bg-black border border-gray-700 text-white rounded-md focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="customer">Driver (Looking for parking)</option>
              <option value="owner">Parking Owner (Renting out space)</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-white text-black py-2 rounded-md hover:bg-gray-200 transition font-medium mt-6">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-white hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
