import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Car } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-black text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-gray-300">
            <img src="/favicon.png" alt="ParkEase Logo" className="w-8 h-8 object-contain" />
            ParkEase
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition flex items-center gap-1">
                  <User size={18} />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2 border border-gray-700"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md transition font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
