'use client'
import React, { useState } from 'react';
import { Pizza, Utensils, Coffee, ChevronRight, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos del formulario
    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-orange-500 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Registro de Cliente</h2>
          <Utensils className="text-white animate-spin-slow" size={32} />
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
              <Mail size={18} className="mr-2" /> Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
              <Lock size={18} className="mr-2" /> Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center"
          >
            Registrarse <ChevronRight size={18} className="ml-2" />
          </button>
        </form>
        <div className="p-4 bg-orange-100 flex justify-around">
          <Pizza className="text-orange-500 animate-bounce" size={24} />
          <Coffee className="text-orange-500 animate-pulse" size={24} />
          <Utensils className="text-orange-500 animate-spin-slow" size={24} />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

