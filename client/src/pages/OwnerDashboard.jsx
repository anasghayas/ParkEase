import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, User, Check, X, Car, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.success(`Booking request ${status}`);
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this parking slot?')) return;
    try {
      await api.delete(`/slots/${id}`);
      fetchData(); // Refresh the list
      toast.success('Slot deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-20">Loading dashboard...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastBookings = requests.filter(r => r.status !== 'pending');
  const totalEarnings = pastBookings.filter(r => r.status === 'completed' || r.status === 'approved').reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="space-y-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-white">
            ₹{totalEarnings.toFixed(0)}
          </p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-amber-400">{pendingRequests.length}</p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Listed Slots</h3>
          <p className="text-3xl font-bold text-white">{slots.length}</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <div className="bg-[#111] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
            No pending booking requests right now.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{req.slotId?.address}</h3>
                  <div className="flex items-center text-gray-400 text-xs mb-2 gap-1">
                    <MapPin size={12} className="text-red-400" />
                    {req.slotId?.area ? `${req.slotId.area}, ` : ''}{req.slotId?.city}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><User size={14}/> {req.customerId?.name || 'Customer'}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(req.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="text-emerald-400 font-bold text-lg">₹{req.totalPrice}</div>
                </div>
                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button onClick={() => updateStatus(req._id, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800 px-5 py-2.5 rounded-lg transition font-medium text-sm">
                    <Check size={18} /> Approve
                  </button>
                  <button onClick={() => updateStatus(req._id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-950/60 text-red-400 hover:bg-red-900/60 border border-red-800 px-5 py-2.5 rounded-lg transition font-medium text-sm">
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
          <div>
            <h2 className="text-2xl font-bold text-white">My Parking Slots</h2>
            <p className="text-gray-400 text-xs mt-1">Manage your active and listed spaces.</p>
          </div>
          <button onClick={() => navigate('/add-slot')} className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2">
            <Car size={16}/> Add New Slot
          </button>
        </div>
        {slots.length === 0 ? (
          <p className="text-gray-500">You haven't listed any parking slots yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(slot => (
              <div key={slot._id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
                <div className="h-36 bg-gray-900 relative">
                  {slot.image && <img src={slot.image} className="w-full h-full object-cover" />}
                  <span className="absolute top-3 right-3 bg-white text-black px-2.5 py-0.5 rounded-full text-xs font-bold shadow">
                    ₹{slot.pricePerHour}/hr
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white mb-1 truncate">{slot.address}</h3>
                  <p className="text-gray-400 text-xs mb-3 flex items-center gap-1">
                    <MapPin size={12} className="text-red-400" />
                    {slot.area ? `${slot.area}, ` : ''}{slot.city}{slot.state ? `, ${slot.state}` : ''}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="capitalize text-gray-400">{slot.slotSize} Size</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${slot.isApproved ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'}`}>
                      {slot.isApproved ? 'Active' : 'Pending Approval'}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteSlot(slot._id)}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 px-3 py-2 rounded-lg transition text-xs font-medium"
                  >
                    <Trash2 size={14} /> Remove Slot
                  </button>
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