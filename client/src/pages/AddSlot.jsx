import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AddSlot = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
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
      data.append('city', formData.city);
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-[#111] border border-gray-800 p-8 rounded-xl shadow-lg mt-10">
        <h1 className="text-3xl font-bold mb-6 border-b border-gray-800 pb-4">Add New Parking Slot</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:border-gray-500 text-white" 
              placeholder="123 Main St, Appt 4"
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:border-gray-500 text-white" 
                placeholder="e.g. New York"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price Per Hour ($)</label>
              <input 
                type="number" 
                step="0.01"
                name="pricePerHour" 
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:border-gray-500 text-white" 
                placeholder="2.50"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Slot Size</label>
              <select 
                name="slotSize" 
                value={formData.slotSize}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md focus:border-gray-500 text-white"
              >
                <option value="small">Small (Compact Cars)</option>
                <option value="medium">Medium (Sedans)</option>
                <option value="large">Large (SUVs, Trucks)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Vehicle Compatibility</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="2-wheeler" checked={vehicles['2-wheeler']} onChange={handleCheckboxChange} className="accent-white w-4 h-4" />
                  2-Wheeler
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="4-wheeler" checked={vehicles['4-wheeler']} onChange={handleCheckboxChange} className="accent-white w-4 h-4" />
                  4-Wheeler
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Slot Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700" 
              required
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-900 border border-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'List Parking Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSlot;
