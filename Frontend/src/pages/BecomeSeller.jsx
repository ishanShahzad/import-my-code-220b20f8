import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Upload, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function BecomeSeller() {
  const navigate = useNavigate();
  const { currentUser, fetchAndUpdateCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    logo: null,
    banner: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, [type]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result);
        } else {
          setBannerPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.storeName.trim()) {
      toast.error('Store name is required');
      return;
    }

    if (formData.storeName.length < 3) {
      toast.error('Store name must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('jwtToken');
      const submitData = new FormData();
      
      submitData.append('storeName', formData.storeName);
      submitData.append('description', formData.description);
      
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }
      if (formData.banner) {
        submitData.append('banner', formData.banner);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}api/user/become-seller`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('🎉 Congratulations! You are now a seller!');
      
      // Refresh user data to update role
      await fetchAndUpdateCurrentUser();
      
      // Redirect to seller dashboard
      setTimeout(() => {
        navigate('/seller-dashboard/store-overview');
      }, 1500);
      
    } catch (error) {
      console.error('Error becoming seller:', error);
      toast.error(error.response?.data?.message || 'Failed to create seller account');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already a seller or admin
  if (currentUser?.role === 'seller' || currentUser?.role === 'admin') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
              <Store size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Become a Seller
          </h1>
          <p className="text-gray-600 text-lg">
            Start your journey and reach millions of customers
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-500" size={24} />
            Why Sell With Us?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Reach millions of customers',
              'Easy store management',
              'Secure payment processing',
              'Marketing support',
              'Analytics dashboard',
              '24/7 seller support'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Store Information</h2>

          {/* Store Name */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="Enter your store name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
              minLength={3}
              maxLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.storeName.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Store Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell customers about your store..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Store Logo
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-500 transition-colors text-center">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload logo
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Store Banner
            </label>
            <div className="space-y-4">
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-40 rounded-lg object-cover border-2 border-gray-200"
                />
              )}
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 transition-colors text-center">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload banner
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB (Recommended: 1200x400px)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'banner')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Your Store...
              </span>
            ) : (
              'Create My Store'
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
