import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, ChevronDown, Building2, Map } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const POPULAR_CITIES = [
  { name: 'Delhi', state: 'Delhi' },
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Jamshedpur', state: 'Jharkhand' },
  { name: 'Pune', state: 'Maharashtra' },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Location filter state
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  // Fetch available states on mount
  useEffect(() => {
    fetchStates();
    fetchSlots();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await api.get('/slots/locations');
      setStates(res.data.states || []);
    } catch (err) {
      console.error('Failed to fetch states', err);
    }
  };

  const fetchCities = async (state) => {
    try {
      const res = await api.get(`/slots/locations?state=${state}`);
      setCities(res.data.cities || []);
      setAreas([]);
    } catch (err) {
      console.error('Failed to fetch cities', err);
    }
  };

  const fetchAreas = async (state, city) => {
    try {
      const res = await api.get(`/slots/locations?state=${state}&city=${city}`);
      setAreas(res.data.areas || []);
    } catch (err) {
      console.error('Failed to fetch areas', err);
    }
  };

  const fetchSlots = async (state = '', city = '', area = '') => {
    try {
      setLoading(true);
      let query = '/slots?';
      if (state) query += `state=${encodeURIComponent(state)}&`;
      if (city) query += `city=${encodeURIComponent(city)}&`;
      if (area) query += `area=${encodeURIComponent(area)}&`;
      const res = await api.get(query);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity('');
    setSelectedArea('');
    setCities([]);
    setAreas([]);
    if (state) {
      fetchCities(state);
      fetchSlots(state);
    } else {
      fetchSlots();
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedArea('');
    setAreas([]);
    if (city) {
      fetchAreas(selectedState, city);
      fetchSlots(selectedState, city);
    } else {
      fetchSlots(selectedState);
    }
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    fetchSlots(selectedState, selectedCity, area || '');
  };

  const handlePopularCity = (cityName, stateName) => {
    setSelectedState(stateName);
    setSelectedCity(cityName);
    setSelectedArea('');
    fetchCities(stateName);
    fetchAreas(stateName, cityName);
    fetchSlots(stateName, cityName);
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedArea('');
    setCities([]);
    setAreas([]);
    fetchSlots();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Parking Across India</h1>
          <p className="text-gray-400 text-lg mb-8">Secure, affordable parking slots in your city & locality.</p>

          {/* Cascading Filters */}
          <div className="max-w-4xl mx-auto bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* State */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 text-left font-medium flex items-center gap-1"><Map size={14}/> State</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 appearance-none"
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 text-left font-medium flex items-center gap-1"><Building2 size={14}/> City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedState}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 disabled:opacity-40 appearance-none"
                >
                  <option value="">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 text-left font-medium flex items-center gap-1"><MapPin size={14}/> Area / Locality</label>
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  disabled={!selectedCity}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 disabled:opacity-40 appearance-none"
                >
                  <option value="">All Areas</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {(selectedState || selectedCity || selectedArea) && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  Showing: {selectedState}{selectedCity ? ` > ${selectedCity}` : ''}{selectedArea ? ` > ${selectedArea}` : ''}
                </p>
                <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 transition">Clear Filters</button>
              </div>
            )}
          </div>
        </div>

        {/* Popular Cities Quick Select */}
        {!selectedState && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 text-center">Popular Cities</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {POPULAR_CITIES.map(c => (
                <button
                  key={c.name}
                  onClick={() => handlePopularCity(c.name === 'Delhi' ? 'New Delhi' : c.name, c.state)}
                  className="bg-[#111] border border-gray-800 hover:border-gray-500 text-gray-300 hover:text-white px-5 py-2 rounded-full transition text-sm font-medium flex items-center gap-2"
                >
                  <MapPin size={14}/> {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {loading ? 'Searching...' : `${slots.length} Parking Slot${slots.length !== 1 ? 's' : ''} Available`}
          </h2>
        </div>

        {/* Slot Cards */}
        {loading ? (
          <div className="text-center text-gray-500 mt-20">Loading available parking slots...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {slots.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                <MapPin size={48} className="mx-auto mb-4 opacity-30"/>
                <p className="text-lg">No parking slots found in this area.</p>
                <p className="text-sm mt-2">Try selecting a different city or area.</p>
              </div>
            ) : (
              slots.map(slot => (
                <div key={slot._id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-gray-600 transition group">
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    {slot.image ? (
                      <img src={slot.image} alt="Parking Slot" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      {'\u20B9'}{slot.pricePerHour}/hr
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 truncate">{slot.address}</h3>
                    <div className="flex items-center text-gray-400 mb-1 gap-1 text-sm">
                      <MapPin size={14} />
                      {slot.area}, {slot.city}
                    </div>
                    <div className="text-gray-500 text-xs mb-4">{slot.state}</div>
                    <div className="flex gap-2 mb-6">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 capitalize">{slot.slotSize} Size</span>
                      {slot.vehicleCompatibility.map(v => (
                        <span key={v} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 capitalize">{v}</span>
                      ))}
                    </div>
                    <Link to={`/slot/${slot._id}`} className="block w-full text-center bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                      View Details & Book
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
