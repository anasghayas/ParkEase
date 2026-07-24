import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin } from 'lucide-react';

const Home = () => {
  const [slots, setSlots] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async (city = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/slots${city ? `?city=${city}` : ''}`);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSlots(searchCity);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Parking Space</h1>
          <p className="text-gray-400 text-lg mb-8">Secure, affordable, and private parking slots in your city.</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 text-gray-500" size={24} />
              <input 
                type="text" 
                placeholder="Search by city (e.g. New York, London)..." 
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-12 pr-32 py-4 bg-[#111] border border-gray-800 rounded-full text-white focus:outline-none focus:border-gray-500 text-lg shadow-lg"
              />
              <button 
                type="submit"
                className="absolute right-2 bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-20">Loading available parking slots...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {slots.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                No parking slots found in this area.
              </div>
            ) : (
              slots.map(slot => (
                <div key={slot._id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-gray-600 transition group">
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    {slot.image ? (
                      <img src={slot.image} alt="Parking Slot" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">No Image provided</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      ${slot.pricePerHour}/hr
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 truncate">{slot.address}</h3>
                    <div className="flex items-center text-gray-400 mb-4 gap-1">
                      <MapPin size={16} />
                      {slot.city}
                    </div>
                    <div className="flex gap-2 mb-6">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 capitalize">{slot.slotSize} Size</span>
                      {slot.vehicleCompatibility.map(v => (
                        <span key={v} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 capitalize">{v}</span>
                      ))}
                    </div>
                    <Link to={`/slot/${slot._id}`} className="block w-full text-center bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
