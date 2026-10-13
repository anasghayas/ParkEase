import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Search, PlusCircle } from 'lucide-react';

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
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-gray-300">
              <img src="/favicon.png" alt="ParkEase Logo" className="w-8 h-8 object-contain" />
              <span>ParkEase</span>
            </Link>

            {/* Always visible Find Parking link */}
            <Link 
              to="/" 
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-gray-900"
            >
              <Search size={15} />
              Find Parking
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'owner' && (
                  <Link 
                    to="/add-slot" 
                    className="hidden sm:flex items-center gap-1 text-xs bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <PlusCircle size={14} /> Add Slot
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white transition flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-900"
                >
                  <User size={16} />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 border border-gray-800 text-sm"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition text-sm px-3 py-1.5">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-black hover:bg-gray-200 px-4 py-1.5 rounded-lg transition font-medium text-sm shadow"
                >
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