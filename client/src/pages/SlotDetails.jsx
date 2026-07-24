import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { MapPin, User, Car, Clock } from 'lucide-react';

const SlotDetails = () => {
  const { id } = useParams();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        // We need a specific slot API. For now, since we only have getAllSlots, we can just fetch all and find it, 
        // but it's better to add a GET /api/slots/:id route on the backend.
        // Assuming we will add that backend route next!
        const res = await api.get(`/slots/${id}`);
        setSlot(res.data);
      } catch (err) {
        console.error('Failed to fetch slot details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlot();
  }, [id]);

  const handleBook = async () => {
    try {
      setBookingLoading(true);
      setBookingError('');
      setBookingSuccess(false);
      
      // Default booking for next 2 hours for demonstration
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      await api.post('/bookings', {
        slotId: id,
        startTime,
        endTime
      });
      
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to request booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8 text-center mt-20">Loading slot details...</div>;
  if (!slot) return <div className="min-h-screen bg-black text-white p-8 text-center mt-20">Slot not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-gray-400 hover:text-white mb-6 inline-block transition">&larr; Back to search</Link>
        
        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-[400px] bg-gray-900 w-full">
            {slot.image ? (
              <img src={slot.image} alt="Parking Slot" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 text-xl">No Image provided by owner</div>
            )}
          </div>
          
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{slot.address}</h1>
              <div className="flex items-center text-gray-400 mb-8 gap-2 text-lg">
                <MapPin size={20} />
                {slot.city}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Car size={16}/> Specifications</h3>
                  <div className="flex gap-3">
                    <span className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg border border-gray-700 capitalize">{slot.slotSize} Size</span>
                    {slot.vehicleCompatibility.map(v => (
                      <span key={v} className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg border border-gray-700 capitalize">{v}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><User size={16}/> Owner Info</h3>
                  <p className="text-gray-300 text-lg">{slot.ownerId?.name || 'Private Owner'}</p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-80">
              <div className="bg-black border border-gray-800 p-6 rounded-xl sticky top-24">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${slot.pricePerHour}</span>
                  <span className="text-gray-500"> / hour</span>
                </div>
                
                {bookingError && <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded mb-4 text-sm">{bookingError}</div>}
                
                {bookingSuccess ? (
                  <div className="bg-green-900/50 border border-green-800 text-green-200 p-4 rounded mb-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 text-green-400" size={32} />
                    <p className="font-bold">Booking Requested!</p>
                    <p className="text-sm mt-1">Check your dashboard for updates.</p>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleBook}
                      disabled={bookingLoading}
                      className="w-full bg-white text-black py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition mb-4 disabled:opacity-50"
                    >
                      {bookingLoading ? 'Requesting...' : 'Request Booking (2 hrs)'}
                    </button>
                    <p className="text-center text-gray-500 text-sm flex items-center justify-center gap-1">
                      <Clock size={14}/> You won't be charged yet
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotDetails;
