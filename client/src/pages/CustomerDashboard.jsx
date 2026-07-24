import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Clock3 } from 'lucide-react';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock3 className="text-yellow-500" size={20} />;
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-20">Loading your bookings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">My Bookings</h2>
        <p className="text-gray-400">Track and manage your parking reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[#111] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">You have no booking history yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-gray-700 transition">
              <div className="flex gap-6 items-center w-full md:w-auto">
                <div className="h-24 w-24 bg-gray-900 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                  {booking.slotId?.image ? (
                    <img src={booking.slotId.image} alt="Slot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{booking.slotId?.address || 'Slot Deleted'}</h3>
                  <div className="flex items-center text-gray-400 mb-2 gap-1 text-sm">
                    <MapPin size={14} />
                    {booking.slotId?.city || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(booking.startTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-center md:items-end gap-2 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                <div className="text-2xl font-bold text-white">${booking.totalPrice}</div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-full capitalize text-sm font-medium">
                  {getStatusIcon(booking.status)}
                  <span className={
                    booking.status === 'approved' ? 'text-green-500' :
                    booking.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                  }>{booking.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
