import React, { useState } from 'react';
import './QuotePage.css';

const QuotePage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="quote-container min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/Images/Portfolio-1.jpg')" }}>
      <div className="overlay flex items-center justify-center min-h-screen">
        <div className="relative w-full max-w-4xl p-6 bg-white bg-opacity-90 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 p-4">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 animate-pulse">Get a Full Quote</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email id"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                  required
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                  required
                />
                <button
                  type="submit"
                  className="w-full p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-300 animate-bounce"
                >
                  Get a Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;