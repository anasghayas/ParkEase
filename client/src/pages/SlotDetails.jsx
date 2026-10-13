import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Car, User, Clock, CheckCircle2, ShieldCheck, LogIn, ArrowRight } from 'lucide-react';

const SlotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d.toISOString().slice(0, 16);
  });
  const [durationAmount, setDurationAmount] = useState('2');
  const [durationUnit, setDurationUnit] = useState('hours');
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

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
    if (!amount || amount <= 0) return 0;
    if (durationUnit === 'hours') return amount;
    if (durationUnit === 'days') return amount * 24;
    if (durationUnit === 'weeks') return amount * 24 * 7;
    return 0;
  };

  const totalHours = calculateTotalHours();
  const estimatedPrice = slot ? (totalHours * slot.pricePerHour).toFixed(0) : 0;

  const handleBook = async () => {
    if (!user) {
      navigate(`/login?redirect=/slot/${id}`);
      return;
    }

    if (user.role !== 'customer') {
      setBookingError('Only customers/drivers can book parking slots. Please login as a customer.');
      return;
    }

    if (totalHours <= 0) {
      setBookingError('Please enter a valid duration greater than 0.');
      return;
    }

    try {
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

  if (loading) return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading parking slot details...</p>
      </div>
    </div>
  );

  if (!slot) return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Slot not found</h2>
      <Link to="/" className="text-gray-400 hover:text-white underline">&larr; Return to search</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2 transition text-sm">
          &larr; Back to all parking slots
        </Link>
        
        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-[360px] md:h-[420px] bg-gray-900 w-full relative">
            {slot.image ? (
              <img src={slot.image} alt="Parking Slot" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 text-xl">No Image provided by owner</div>
            )}
            <div className="absolute top-4 right-4 bg-white text-black px-4 py-1.5 rounded-full text-base font-bold shadow-lg flex items-center gap-1">
              ₹{slot.pricePerHour} <span className="text-xs font-medium text-gray-700">/ hr</span>
            </div>
          </div>
          
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Left Column: Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{slot.address}</h1>
              <div className="flex items-center text-gray-400 mb-6 gap-2 text-base md:text-lg">
                <MapPin size={20} className="text-red-400 shrink-0" />
                <span>{slot.area}, {slot.city}, {slot.state}</span>
              </div>
              
              <div className="space-y-6 border-t border-gray-800 pt-6">
                <div>
                  <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                    <Car size={16} className="text-gray-400"/> Specifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-900 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 capitalize text-sm">
                      {slot.slotSize} Size Slot
                    </span>
                    {slot.vehicleCompatibility && slot.vehicleCompatibility.map(v => (
                      <span key={v} className="bg-gray-900 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 capitalize text-sm">
                        Compatible with {v}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                    <User size={16} className="text-gray-400"/> Slot Owner Information
                  </h3>
                  <p className="text-gray-300 text-base font-medium">{slot.ownerId?.name || 'Verified Slot Owner'}</p>
                  <p className="text-gray-500 text-xs mt-1">Listed under ParkEase Pan-India Network</p>
                </div>

                <div className="bg-gray-950 border border-gray-800/80 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-200">Verified Parking Slot:</span> Approved by ParkEase admin. Safe and designated parking spot.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Booking Box */}
            <div className="w-full md:w-88">
              <div className="bg-black border border-gray-800 p-6 rounded-2xl sticky top-24 shadow-xl">
                <div className="mb-6 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-white">₹{slot.pricePerHour}</span>
                    <span className="text-gray-400 text-sm"> / hour</span>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full font-medium">
                    Available Now
                  </span>
                </div>
                
                {bookingError && (
                  <div className="bg-red-900/40 border border-red-800 text-red-200 p-3 rounded-lg mb-4 text-xs leading-relaxed">
                    {bookingError}
                  </div>
                )}
                
                {bookingSuccess ? (
                  <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-200 p-6 rounded-xl text-center space-y-4">
                    <CheckCircle2 className="mx-auto text-emerald-400" size={40} />
                    <div>
                      <p className="font-bold text-lg text-white">Booking Requested!</p>
                      <p className="text-xs text-gray-300 mt-1">Your reservation request has been sent to the parking owner for approval.</p>
                    </div>
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-white text-black py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
                      >
                        View My Bookings <ArrowRight size={16} />
                      </button>
                      <Link
                        to="/"
                        className="block w-full py-2 text-xs text-gray-400 hover:text-white transition text-center"
                      >
                        Explore More Slots
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 text-sm">
                      <div>
                        <label className="block text-gray-400 mb-1.5 font-medium text-xs">Start Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-gray-500 text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-400 mb-1.5 font-medium text-xs">Duration</label>
                          <input 
                            type="number" 
                            min="1"
                            value={durationAmount}
                            onChange={(e) => setDurationAmount(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-gray-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1.5 font-medium text-xs">Unit</label>
                          <select 
                            value={durationUnit}
                            onChange={(e) => setDurationUnit(e.target.value)}
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-gray-500 text-sm"
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-t border-gray-800 text-sm">
                        <span className="text-gray-400">Total Duration:</span>
                        <span className="font-semibold text-gray-200">{totalHours} {totalHours === 1 ? 'hour' : 'hours'}</span>
                      </div>

                      <div className="flex justify-between items-center py-3 border-t border-gray-800">
                        <span className="text-gray-400 font-medium">Estimated Total:</span>
                        <span className="text-2xl font-bold text-white">₹{estimatedPrice}</span>
                      </div>
                    </div>

                    {/* Authentication-Aware Action Button */}
                    {!user ? (
                      <div className="space-y-3">
                        <button 
                          onClick={() => navigate(`/login?redirect=/slot/${id}`)}
                          className="w-full bg-white text-black py-3.5 rounded-lg font-bold text-base hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                          <LogIn size={18} />
                          Login to Book Slot
                        </button>
                        <p className="text-center text-gray-400 text-xs">
                          Don't have an account?{' '}
                          <Link to="/register" className="text-white hover:underline font-semibold">
                            Sign up here
                          </Link>
                        </p>
                      </div>
                    ) : user.role === 'customer' ? (
                      <button 
                        onClick={handleBook}
                        disabled={bookingLoading}
                        className="w-full bg-white text-black py-3.5 rounded-lg font-bold text-base hover:bg-gray-200 transition mb-3 disabled:opacity-50"
                      >
                        {bookingLoading ? 'Submitting Request...' : 'Request Booking'}
                      </button>
                    ) : (
                      <div className="p-3 bg-yellow-950/40 border border-yellow-800/60 rounded-lg text-xs text-yellow-300 text-center">
                        You are logged in as an <strong>{user.role}</strong>. Please sign in as a customer (e.g. <code className="bg-black px-1 py-0.5 rounded">d@example.com</code>) to book.
                      </div>
                    )}

                    <p className="text-center text-gray-500 text-xs flex items-center justify-center gap-1.5 mt-3">
                      <Clock size={13}/> Pay after confirmation &bull; No advance fee
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