'use client'

import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Edit2, Calendar, Shield } from 'lucide-react'

export default function ProfilePage() {
  // Datos de ejemplo - estos vendrían de tu backend
  const userProfile = {
    fullName: "Juan Pérez",
    username: "juanito123",
    email: "juan@ejemplo.com",
    phone: "+34 123 456 789",
    address: "Calle Example 123, Ciudad",
    memberSince: "Enero 2024"
  }

  const ProfileCard = ({ icon: Icon, title, value }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4"
    >
      <div className="bg-orange-100 p-3 rounded-full">
        <Icon className="text-orange-500 w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="text-gray-400 hover:text-orange-500"
      >
        <Edit2 size={16} />
      </motion.button>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto"
      >
        {/* Encabezado del perfil */}
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center"
            >
              <User size={40} className="text-orange-500" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">{userProfile.fullName}</h1>
              <p className="text-orange-100">@{userProfile.username}</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>Miembro desde {userProfile.memberSince}</span>
            </div>
            <div className="flex items-center">
              <Shield size={16} className="mr-2" />
              <span>Cuenta Verificada</span>
            </div>
          </div>
        </motion.div>

        {/* Información del perfil */}
        <div className="space-y-4">
          <ProfileCard
            icon={User}
            title="Nombre Completo"
            value={userProfile.fullName}
          />
          <ProfileCard
            icon={Mail}
            title="Correo Electrónico"
            value={userProfile.email}
          />
          <ProfileCard
            icon={Phone}
            title="Teléfono"
            value={userProfile.phone}
          />
          <ProfileCard
            icon={MapPin}
            title="Dirección"
            value={userProfile.address}
          />
        </div>

        {/* Botón de actualizar perfil */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 w-full bg-gradient-to-r from-orange-400 to-red-500 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center space-x-2"
        >
          <Edit2 size={18} />
          <span>Actualizar Perfil</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
