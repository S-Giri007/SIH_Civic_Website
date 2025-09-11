import { useState } from 'react';
import { Camera, Send, AlertTriangle, X, Upload } from 'lucide-react';
import { Issue } from '../types';
import SimpleLocationPicker from './SimpleLocationPicker';
import SimpleHeader from './SimpleHeader';

const PublicIssueForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road' as Issue['category'],
    priority: 'medium' as Issue['priority'],
    location: '',
    citizenName: '',
    citizenContact: '',
  });
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'road', label: 'Road & Transportation', icon: '🛣️', description: 'Potholes, traffic signals, road damage' },
    { value: 'water', label: 'Water & Sanitation', icon: '💧', description: 'Water leaks, drainage, sewage issues' },
    { value: 'electricity', label: 'Electricity', icon: '⚡', description: 'Street lights, power outages' },
    { value: 'garbage', label: 'Waste Management', icon: '🗑️', description: 'Garbage collection, littering' },
    { value: 'park', label: 'Parks & Recreation', icon: '🌳', description: 'Park maintenance, playground issues' },
    { value: 'other', label: 'Other', icon: '📋', description: 'General civic concerns' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600', description: 'Minor issue, not urgent' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', description: 'Moderate concern' },
    { value: 'high', label: 'High', color: 'text-red-600', description: 'Urgent attention needed' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLocationSelect = (location: { 
    lat: number; 
    lng: number; 
    address: string;
  }) => {
    setLocationData(location);
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrls: string[] = [];
      
      // Upload images if any
      if (selectedImages.length > 0) {
        try {
          const { uploadMultipleImages } = await import('../services/imgbb');
          imageUrls = await uploadMultipleImages(selectedImages);
        } catch (imgError) {
          console.warn('Image upload failed, proceeding without images:', imgError);
          // Continue without images rather than failing completely
        }
      }

      const issueData: Omit<Issue, '_id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        images: imageUrls,
        citizenId: '', // Will be set by backend if user is authenticated
        status: 'pending',
        // Add location coordinates if available
        ...(locationData && {
          locationCoordinates: {
            lat: locationData.lat,
            lng: locationData.lng
          }
        })
      };

      const { createIssue } = await import('../services/mongodb');
      await createIssue(issueData);
      
      setSuccess(true);
      
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'road',
      priority: 'medium',
      location: '',
      citizenName: '',
      citizenContact: '',
    });
    setSelectedImages([]);
    setImagePreview([]);
    setLocationData(null);
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Complaint Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for reporting this civic issue. Your complaint has been received and will be reviewed by our municipal officers.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800 font-medium">What happens next?</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Your complaint will be assigned to an officer</li>
              <li>• You'll receive updates via your contact information</li>
              <li>• Expected response time: 2-5 business days</li>
            </ul>
          </div>
          <button
            onClick={resetForm}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 page-transition">
      <SimpleHeader />

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Submit a Complaint</h2>
              <p className="text-blue-100 mt-2">Help us address civic issues in your area</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="citizenName"
                      value={formData.citizenName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information *
                    </label>
                    <input
                      type="text"
                      name="citizenContact"
                      value={formData.citizenContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email or phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <SimpleLocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={locationData ? { lat: locationData.lat, lng: locationData.lng } : undefined}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {categories.map((cat) => (
                        <label
                          key={cat.value}
                          className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.category === cat.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={formData.category === cat.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <span className="text-2xl mr-3">{cat.icon}</span>
                          <div>
                            <span className="font-medium text-gray-900">{cat.label}</span>
                            <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Priority Level
                    </label>
                    <div className="space-y-2">
                      {priorities.map((priority) => (
                        <label
                          key={priority.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.priority === priority.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="priority"
                            value={priority.value}
                            checked={formData.priority === priority.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <span className={`font-medium ${priority.color}`}>{priority.label}</span>
                            <p className="text-sm text-gray-600">{priority.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Full Width Sections */}
              <div className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide detailed information about the issue, including when it started, how it affects you, and any other relevant details..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (Optional - Max 5)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 mb-2">Add photos to help us understand the issue</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                    </label>
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center text-lg"
                >
                  {loading ? (
                    <>
                      <Upload className="w-5 h-5 mr-2 animate-fade" />
                      Submitting Complaint...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Complaint
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  By submitting this complaint, you agree to be contacted regarding this issue.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicIssueForm;