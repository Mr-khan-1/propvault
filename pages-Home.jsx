import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../utils/api';

function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    type: '',
    purpose: 'sale',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await propertyAPI.getAllProperties({ limit: 6 });
      setFeaturedProperties(response.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center py-20">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Dream Home</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover thousands of properties in Pakistan. Buy, sell, or rent with confidence.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* City */}
              <input
                type="text"
                name="city"
                placeholder="Enter city..."
                value={searchFilters.city}
                onChange={handleSearchChange}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              />

              {/* Property Type */}
              <select
                name="type"
                value={searchFilters.type}
                onChange={handleSearchChange}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>

              {/* Purpose */}
              <select
                name="purpose"
                value={searchFilters.purpose}
                onChange={handleSearchChange}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>

              {/* Search Button */}
              <Link
                to={`/properties?city=${searchFilters.city}&type=${searchFilters.type}&purpose=${searchFilters.purpose}`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center"
              >
                🔍 Search
              </Link>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={searchFilters.minPrice}
                onChange={handleSearchChange}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={searchFilters.maxPrice}
                onChange={handleSearchChange}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Wide Selection</h3>
              <p className="text-gray-600">Browse thousands of verified properties across Pakistan with detailed information.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Secure & Safe</h3>
              <p className="text-gray-600">All properties and transactions are verified. Your privacy and security are our priority.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Expert Agents</h3>
              <p className="text-gray-600">Connect with professional agents who can guide you through the entire process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4 text-center">Featured Properties</h2>
          <p className="text-gray-600 text-center mb-12 text-lg">Check out our latest and most popular properties</p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <Link
                  key={property._id}
                  to={`/properties/${property._id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105"
                >
                  {/* Property Image */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    {property.images && property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-3xl">🏠</div>
                    )}
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {property.purpose === 'sale' ? 'Sale' : 'Rent'}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{property.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">📍 {property.address?.city}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-gray-800">{property.bedrooms}</p>
                        <p className="text-gray-500">Bedrooms</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-800">{property.bathrooms}</p>
                        <p className="text-gray-500">Bathrooms</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-800">{property.area} sqft</p>
                        <p className="text-gray-500">Area</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-gray-500 text-sm">Price</p>
                        <p className="text-2xl font-bold text-indigo-600">Rs {property.price?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Views</p>
                        <p className="text-lg font-semibold text-gray-800">{property.views || 0}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-bold text-lg inline-block"
            >
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're buying, selling, or renting, we're here to help you find the perfect property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:shadow-lg transition-all font-bold"
            >
              Browse Properties
            </Link>
            <Link
              to="/auth/register"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition-all font-bold"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
