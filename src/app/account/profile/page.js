'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Edit2, Calendar, Shield } from 'lucide-react'
import url_Backend from '@/context/config'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')

        const { id: userId } = decodeJwt(token) 
        const response = await axios.get(`http://${url_Backend}:8080/usuarios/obtenerusuario/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        setUserProfile(response.data) 
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const ProfileCard = ({ icon: Icon, title, value }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
    >
      <div className="bg-orange-100 p-3 rounded-full w-fit">
        <Icon className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-gray-800 font-medium text-sm sm:text-base">{value}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
      >
        <Edit2 size={16} className="sm:w-5 sm:h-5" />
      </motion.button>
    </motion.div>
  )

  if (loading) {
    return <div className="text-center mt-10">Cargando perfil...</div>
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto space-y-6 sm:space-y-8"
      >
        {/* Encabezado del perfil */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
        >
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto sm:mx-0"
            >
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" />
            </motion.div>
            
            <div className="text-center sm:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-bold"
              >
                {userProfile.nombre}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-orange-100"
              >
                @{userProfile.usuario}
              </motion.p>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm"
          >
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>Miembro desde {userProfile.miembroDesde}</span>
            </div>
            <div className="flex items-center">
              <Shield size={16} className="mr-2" />
              <span>Cuenta Verificada</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Información del perfil */}
        <motion.div 
          variants={containerVariants}
          className="space-y-4"
        >
          <ProfileCard
            icon={User}
            title="Nombre Completo"
            value={userProfile.nombre}
          />
          <ProfileCard
            icon={Mail}
            title="Correo Electrónico"
            value={userProfile.email}
          />
          <ProfileCard
            icon={Phone}
            title="Teléfono"
            value={userProfile.telefono}
          />
          <ProfileCard
            icon={MapPin}
            title="Dirección"
            value={userProfile.direccion}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
