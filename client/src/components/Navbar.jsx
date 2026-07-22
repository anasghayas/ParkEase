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
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-400">
            <Car size={28} />
            ParkEase
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-300 transition flex items-center gap-1">
                  <User size={18} />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-300 transition">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition">
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
