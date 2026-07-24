import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, User, Check, X, Car } from 'lucide-react';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, slotsRes] = await Promise.all([
        api.get('/bookings/requests'),
        api.get('/slots/my-slots')
      ]);
      setRequests(reqRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error('Failed to fetch owner data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchData(); // Refresh the list
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-20">Loading dashboard...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastBookings = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-white">
            ${pastBookings.filter(r => r.status === 'completed' || r.status === 'approved').reduce((acc, curr) => acc + curr.totalPrice, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-white">{pendingRequests.length}</p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Active Slots</h3>
          <p className="text-3xl font-bold text-white">{slots.length}</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No new booking requests.</p>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{req.slotId?.address}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><User size={14}/> {req.customerId?.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(req.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="text-indigo-400 font-bold">${req.totalPrice}</div>
                </div>
                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button onClick={() => updateStatus(req._id, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-900/30 text-green-500 hover:bg-green-900/50 border border-green-900 px-4 py-2 rounded-lg transition font-medium">
                    <Check size={18} /> Approve
                  </button>
                  <button onClick={() => updateStatus(req._id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-red-900 px-4 py-2 rounded-lg transition font-medium">
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Parking Slots */}
      <div>
        <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-2">
          <h2 className="text-2xl font-bold text-white">My Parking Slots</h2>
          <button onClick={() => navigate('/add-slot')} className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2">
            <Car size={16}/> Add New Slot
          </button>
        </div>
        {slots.length === 0 ? (
          <p className="text-gray-500">You haven't listed any parking slots yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(slot => (
              <div key={slot._id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                <div className="h-32 bg-gray-900">
                  {slot.image && <img src={slot.image} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition" />}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white mb-1 truncate">{slot.address}</h3>
                  <p className="text-gray-400 text-sm mb-3">{slot.city}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-white">${slot.pricePerHour}/hr</span>
                    <span className={`px-2 py-1 rounded text-xs ${slot.isApproved ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                      {slot.isApproved ? 'Active' : 'Pending Admin Approval'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default OwnerDashboard;
