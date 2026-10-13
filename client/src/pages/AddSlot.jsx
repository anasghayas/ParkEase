import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AddSlot = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    state: '',
    city: '',
    area: '',
    slotSize: 'medium',
    pricePerHour: '',
  });
  
  // State for checkboxes
  const [vehicles, setVehicles] = useState({
    '2-wheeler': false,
    '4-wheeler': true,
  });
  
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setVehicles({ ...vehicles, [e.target.name]: e.target.checked });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get array of selected vehicles
    const selectedVehicles = Object.keys(vehicles).filter(k => vehicles[k]);
    if (selectedVehicles.length === 0) {
      toast.error('Please select at least one vehicle compatibility type.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('address', formData.address);
      data.append('state', formData.state);
      data.append('city', formData.city);
      data.append('area', formData.area);
      data.append('slotSize', formData.slotSize);
      data.append('pricePerHour', formData.pricePerHour);
      data.append('vehicleCompatibility', selectedVehicles.join(','));
      
      if (image) {
        data.append('image', image);
      }

      await api.post('/slots', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Parking slot added successfully! Waiting for admin approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-[#111] border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl mt-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">List a New Parking Slot</h1>
        <p className="text-gray-400 text-xs mb-6 border-b border-gray-800 pb-4">
          Add your parking space to the ParkEase Pan-India network.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Address / Landmark</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:border-gray-500 text-white text-sm" 
              placeholder="e.g. Near Metro Station Gate 2, Main Market"
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:border-gray-500 text-white text-sm" 
                placeholder="e.g. Delhi, Maharashtra"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:border-gray-500 text-white text-sm" 
                placeholder="e.g. Mumbai, Bangalore"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Area / Locality</label>
              <input 
                type="text" 
                name="area" 
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:border-gray-500 text-white text-sm" 
                placeholder="e.g. Andheri, Koramangala"
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price Per Hour (₹)</label>
              <input 
                type="number" 
                step="1"
                min="5"
                name="pricePerHour" 
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:border-gray-500 text-white text-sm" 
                placeholder="e.g. 50"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Slot Size</label>
              <select 
                name="slotSize" 
                value={formData.slotSize}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:border-gray-500 text-white text-sm"
              >
                <option value="small">Small (Compact Cars / Bikes)</option>
                <option value="medium">Medium (Sedans / Hatchbacks)</option>
                <option value="large">Large (SUVs / Vans)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Compatibility</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" name="2-wheeler" checked={vehicles['2-wheeler']} onChange={handleCheckboxChange} className="accent-white w-4 h-4" />
                2-Wheeler (Motorcycles / Scooters)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" name="4-wheeler" checked={vehicles['4-wheeler']} onChange={handleCheckboxChange} className="accent-white w-4 h-4" />
                4-Wheeler (Cars / SUVs)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Slot Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700" 
              required
            />
            <p className="text-gray-500 text-xs mt-1">Upload a clear photo of your parking space</p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-900 border border-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Submitting...' : 'List Parking Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSlot;