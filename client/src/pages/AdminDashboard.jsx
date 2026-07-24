import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Car, CheckSquare, Settings, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, slotsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/slots')
      ]);
      setStats(statsRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApproval = async (id, isApproved) => {
    try {
      await api.patch(`/admin/slots/${id}/approve`, { isApproved });
      fetchData(); // refresh list
    } catch (err) {
      console.error('Failed to update slot approval', err);
    }
  };

  if (loading || !stats) return <div className="text-center text-gray-500 mt-20">Loading admin dashboard...</div>;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-gray-900 rounded-lg text-white"><Users size={24} /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-gray-900 rounded-lg text-white"><Car size={24} /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Slots</h3>
            <p className="text-3xl font-bold text-white">{stats.totalSlots}</p>
          </div>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-gray-900 rounded-lg text-white"><CheckSquare size={24} /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Bookings</h3>
            <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-gray-900 rounded-lg text-white"><Settings size={24} /></div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Revenue</h3>
            <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Manage Parking Slots</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="pb-3 font-medium">Slot Address</th>
                <th className="pb-3 font-medium">City</th>
                <th className="pb-3 font-medium">Owner</th>
                <th className="pb-3 font-medium">Price/hr</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {slots.map(slot => (
                <tr key={slot._id} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition">
                  <td className="py-4 text-white font-medium">{slot.address}</td>
                  <td className="py-4 text-gray-400">{slot.city}</td>
                  <td className="py-4 text-gray-400">{slot.ownerId?.name || 'Unknown'}</td>
                  <td className="py-4 text-gray-400">${slot.pricePerHour}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${slot.isApproved ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                      {slot.isApproved ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 flex justify-end gap-2">
                    {!slot.isApproved ? (
                      <button onClick={() => updateApproval(slot._id, true)} className="p-2 bg-green-900/30 text-green-500 hover:bg-green-900/50 rounded-lg transition" title="Approve">
                        <Check size={16} />
                      </button>
                    ) : (
                      <button onClick={() => updateApproval(slot._id, false)} className="p-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded-lg transition" title="Suspend">
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
