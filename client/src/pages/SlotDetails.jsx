import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { MapPin, User, Car, Clock, CheckCircle2 } from 'lucide-react';

const SlotDetails = () => {
  const { id } = useParams();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [durationAmount, setDurationAmount] = useState(2);
  const [durationUnit, setDurationUnit] = useState('hours');
  
  // Format current time for datetime-local input (YYYY-MM-DDThh:mm)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const [startTime, setStartTime] = useState(now.toISOString().slice(0, 16));

  useEffect(() => {
    const fetchSlot = async () => {
      try {
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

  // Calculate dynamic price based on user selection
  const calculateTotalHours = () => {
    const amount = Number(durationAmount);
    if (durationUnit === 'hours') return amount;
    if (durationUnit === 'days') return amount * 24;
    if (durationUnit === 'weeks') return amount * 24 * 7;
    return 0;
  };

  const totalHours = calculateTotalHours();
  const estimatedPrice = slot ? (totalHours * slot.pricePerHour).toFixed(2) : 0;

  const handleBook = async () => {
    try {
      if (totalHours <= 0) {
        setBookingError('Please enter a valid duration.');
        return;
      }

      setBookingLoading(true);
      setBookingError('');
      setBookingSuccess(false);
      
      const start = new Date(startTime);
      const endTime = new Date(start.getTime() + totalHours * 60 * 60 * 1000);

      await api.post('/bookings', {
        slotId: id,
        startTime: start,
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
                    <div className="space-y-4 mb-6 text-sm">
                      <div>
                        <label className="block text-gray-400 mb-1 font-medium">Start Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none focus:border-gray-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">Duration</label>
                          <input 
                            type="number" 
                            min="1"
                            value={durationAmount}
                            onChange={(e) => setDurationAmount(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none focus:border-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">Unit</label>
                          <select 
                            value={durationUnit}
                            onChange={(e) => setDurationUnit(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none focus:border-gray-500"
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-t border-gray-800">
                        <span className="text-gray-400">Total Price ({totalHours} hrs)</span>
                        <span className="text-xl font-bold text-white">${estimatedPrice}</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleBook}
                      disabled={bookingLoading}
                      className="w-full bg-white text-black py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition mb-4 disabled:opacity-50"
                    >
                      {bookingLoading ? 'Requesting...' : 'Request Booking'}
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
