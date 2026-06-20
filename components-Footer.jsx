import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              🏠 RealEstate
            </h3>
            <p className="text-gray-400">
              Your trusted platform for buying, selling, and renting properties in Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-white transition">Properties</Link></li>
              <li><Link to="/auth/register" className="hover:text-white transition">Register</Link></li>
              <li><Link to="/auth/login" className="hover:text-white transition">Login</Link></li>
            </ul>
          </div>

          {/* For Agents */}
          <div>
            <h4 className="text-lg font-bold mb-4">For Agents</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Become an Agent</a></li>
              <li><a href="#" className="hover:text-white transition">Agent Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Features</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 support@realestate.pk</li>
              <li>📞 +92 300 1234567</li>
              <li>📍 Rawalpindi, Punjab, Pakistan</li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="text-blue-400 hover:text-white">Facebook</a>
                <a href="#" className="text-blue-400 hover:text-white">Twitter</a>
                <a href="#" className="text-blue-400 hover:text-white">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400 text-sm">
            <p>&copy; 2024 RealEstate Platform. All rights reserved.</p>
            <div className="flex gap-6 justify-center">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookies</a>
            </div>
            <p className="text-right">Made with ❤️ for FYP Project</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
