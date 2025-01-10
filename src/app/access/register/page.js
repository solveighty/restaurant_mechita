'use client'
import React, { useState } from 'react';
import { Pizza, Utensils, Coffee, ChevronRight, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4 md:p-8" style={{backgroundImage: "url('/placeholder.svg?height=1080&width=1920&text=Fondo+de+Comida')"}}> 
      <div className="max-w-4xl w-full bg-white bg-opacity-95 rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Registro de Cliente</h2>
          <Utensils className="text-white animate-spin-slow" size={40} />
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center">
                <User size={18} className="mr-2 text-orange-500" /> Nombre Completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                <Mail size={18} className="mr-2 text-orange-500" /> Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center">
                <User size={18} className="mr-2 text-orange-500" /> Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                <Lock size={18} className="mr-2 text-orange-500" /> Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                <Phone size={18} className="mr-2 text-orange-500" /> Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center">
              <MapPin size={18} className="mr-2 text-orange-500" /> Dirección
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
              required
              rows={3}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-md hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
          >
            Registrarse <ChevronRight size={24} className="ml-2" />
          </button>
        </form>
        <div className="p-6 bg-gradient-to-r from-orange-100 to-red-100 flex justify-around">
          <Pizza className="text-orange-500 animate-bounce" size={32} />
          <Coffee className="text-red-500 animate-pulse" size={32} />
          <Utensils className="text-orange-500 animate-spin-slow" size={32} />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
