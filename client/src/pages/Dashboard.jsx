import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import OwnerDashboard from './OwnerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="min-h-screen bg-black text-white p-8 text-center">Loading user data...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-400 capitalize">{user.role} Dashboard</p>
        </div>

        {user.role === 'customer' && <CustomerDashboard />}
        {user.role === 'owner' && <OwnerDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
