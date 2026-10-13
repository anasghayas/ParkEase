import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Clock3, Trash2, Search, ArrowRight, ShieldCheck, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [featuredSlots, setFeaturedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, slotsRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/slots')
      ]);
      setBookings(bookingsRes.data);
      // Grab up to 6 featured slots
      setFeaturedSlots(slotsRes.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch customer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="text-emerald-400" size={18} />;
      case 'rejected': return <XCircle className="text-red-400" size={18} />;
      default: return <Clock3 className="text-amber-400" size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your dashboard & parking slots...</p>
      </div>
    );
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;

  return (
    <div className="space-y-10">
      {/* Top Action Banner / Book Slot CTA */}
      <div className="bg-gradient-to-r from-gray-900 via-neutral-900 to-black border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 text-xs px-3 py-1 rounded-full text-gray-300 font-medium">
            <ShieldCheck size={14} className="text-emerald-400" /> Pan-India Verified Parking Network
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Find & Book a Parking Slot</h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Search 100+ secure parking locations across major Indian cities by State, City, and Area/Locality.
          </p>
        </div>
        <Link
          to="/"
          className="bg-white text-black hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold text-base transition flex items-center gap-2 shadow-lg shrink-0"
        >
          <Search size={18} />
          Explore Available Slots
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Booking Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-gray-800 p-4 rounded-xl">
          <p className="text-gray-400 text-xs font-medium">Total Bookings</p>
          <p className="text-2xl font-bold text-white mt-1">{bookings.length}</p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-4 rounded-xl">
          <p className="text-gray-400 text-xs font-medium">Approved / Active</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-4 rounded-xl">
          <p className="text-gray-400 text-xs font-medium">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-[#111] border border-gray-800 p-4 rounded-xl">
          <p className="text-gray-400 text-xs font-medium">Available Network</p>
          <p className="text-2xl font-bold text-white mt-1">100+ Slots</p>
        </div>
      </div>

      {/* My Bookings Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
            <p className="text-gray-400 text-xs mt-0.5">Track and manage your parking reservations.</p>
          </div>
          <Link to="/" className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition">
            Book Another Slot <ArrowRight size={14} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-10 text-center space-y-4">
            <Car size={40} className="mx-auto text-gray-600" />
            <div>
              <p className="text-gray-300 font-semibold text-lg">No Active Bookings Yet</p>
              <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                You haven't requested any parking slots yet. Search our Pan-India network to reserve a slot.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition"
            >
              <Search size={16} /> Find Parking Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map(booking => (
              <div 
                key={booking._id} 
                className="bg-[#111] border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-700 transition"
              >
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className="h-20 w-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                    {booking.slotId?.image ? (
                      <img src={booking.slotId.image} alt="Slot" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{booking.slotId?.address || 'Slot Details'}</h3>
                    <div className="flex items-center text-gray-400 mb-1.5 gap-1.5 text-xs">
                      <MapPin size={13} className="text-red-400 shrink-0" />
                      {booking.slotId?.area ? `${booking.slotId.area}, ` : ''}{booking.slotId?.city || 'Unknown'}{booking.slotId?.state ? `, ${booking.slotId.state}` : ''}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={13}/> {new Date(booking.startTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13}/> {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-center md:items-end gap-2 border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                  <div className="text-2xl font-bold text-white">₹{booking.totalPrice}</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-black border border-gray-800 rounded-full capitalize text-xs font-medium">
                    {getStatusIcon(booking.status)}
                    <span className={
                      booking.status === 'approved' ? 'text-emerald-400' :
                      booking.status === 'rejected' ? 'text-red-400' : 'text-amber-400'
                    }>
                      {booking.status === 'pending' ? 'Pending Approval' : booking.status}
                    </span>
                  </div>
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition mt-1"
                    >
                      <Trash2 size={12} /> Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured / Available Parking Slots Right in Dashboard */}
      <div className="space-y-4 pt-4 border-t border-gray-800/80">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white">Available Parking Slots Across India</h2>
            <p className="text-gray-400 text-xs mt-0.5">Quickly select and book a verified slot in your city.</p>
          </div>
          <Link to="/" className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition">
            View All ({featuredSlots.length}+) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSlots.map(slot => (
            <div key={slot._id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition flex flex-col justify-between group">
              <div>
                <div className="h-40 bg-gray-900 relative overflow-hidden">
                  {slot.image ? (
                    <img src={slot.image} alt="Slot" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white text-black px-2.5 py-1 rounded-full text-xs font-bold shadow">
                    ₹{slot.pricePerHour}/hr
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-base truncate mb-1">{slot.address}</h3>
                  <div className="flex items-center text-gray-400 text-xs gap-1 mb-2">
                    <MapPin size={12} className="text-red-400 shrink-0" />
                    {slot.area}, {slot.city} ({slot.state})
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="bg-gray-900 text-gray-400 text-[11px] px-2 py-0.5 rounded border border-gray-800 capitalize">
                      {slot.slotSize} Size
                    </span>
                    {slot.vehicleCompatibility?.map(v => (
                      <span key={v} className="bg-gray-900 text-gray-400 text-[11px] px-2 py-0.5 rounded border border-gray-800 capitalize">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  to={`/slot/${slot._id}`}
                  className="block w-full text-center bg-white text-black py-2 rounded-lg font-bold text-xs hover:bg-gray-200 transition"
                >
                  Book This Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;