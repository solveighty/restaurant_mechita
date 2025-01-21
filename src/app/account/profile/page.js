'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Edit2, Calendar, Shield, Lock } from 'lucide-react'
import { toast } from 'react-toastify'
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
  const [editingField, setEditingField] = useState(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  })
  const [passwordData, setPasswordData] = useState({
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  })

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')

        const { id: userId } = decodeJwt(token)
        const response = await axios.get(
          `http://${url_Backend}:8080/usuarios/obtenerusuario/${userId}`,
          { headers: getAuthHeaders() }
        )

        setUserProfile(response.data)
        setFormData(prev => ({
          ...prev,
          nombre: response.data.nombre || '',
          email: response.data.email || '',
          telefono: response.data.telefono || '',
          direccion: response.data.direccion || '',
        }))
      } catch (err) {
        setError(err.message)
        toast.error('Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdatePassword = async () => {
    try {
      if (!passwordData.contrasenaActual) {
        throw new Error('Debe ingresar su contraseña actual')
      }
      if (passwordData.nuevaContrasena !== passwordData.confirmarContrasena) {
        throw new Error('Las contraseñas nuevas no coinciden')
      }
      if (passwordData.nuevaContrasena.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      const response = await axios.put(
        `http://${url_Backend}:8080/usuarios/editarusuario/${userProfile.id}`,
        {
          ...userProfile,
          contrasenaActual: passwordData.contrasenaActual,
          contrasena: passwordData.nuevaContrasena
        },
        { headers: getAuthHeaders() }
      )

      setIsChangingPassword(false)
      setPasswordData({
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
      })
      toast.success('Contraseña actualizada correctamente')
    } catch (error) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    }
  }

  const handleUpdate = async (field) => {
    try {
      const response = await axios.put(
        `http://${url_Backend}:8080/usuarios/editarusuario/${userProfile.id}`,
        {
          ...userProfile,
          [field]: formData[field]
        },
        { headers: getAuthHeaders() }
      )

      setUserProfile(prev => ({
        ...prev,
        [field]: formData[field]
      }))
      setEditingField(null)
      toast.success('Datos actualizados correctamente')
    } catch (error) {
      toast.error(error.message || 'Error al actualizar los datos')
    }
  }

  const EditableField = ({ icon: Icon, title, field, value, type = 'text' }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <Icon className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">{title}</p>
            {editingField === field ? (
              <div className="mt-2">
                <input
                  type={type}
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(field)}
                    className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 font-medium text-sm sm:text-base">
                {value || 'No especificado'}
              </p>
            )}
          </div>
        </div>
        {editingField !== field && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setEditingField(field)
              setFormData(prev => ({
                ...prev,
                [field]: userProfile[field] || ''
              }))
            }}
            className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
          >
            <Edit2 size={16} className="sm:w-5 sm:h-5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )

  const PasswordSection = () => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <Lock className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cambiar Contraseña</p>
            <p className="text-gray-800 font-medium text-sm sm:text-base">
              ••••••••
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsChangingPassword(!isChangingPassword)}
          className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
        >
          <Edit2 size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {isChangingPassword && (
        <div className="space-y-3 mt-4">
          <input
            type="password"
            value={passwordData.contrasenaActual}
            onChange={(e) => handlePasswordChange('contrasenaActual', e.target.value)}
            placeholder="Contraseña actual"
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            value={passwordData.nuevaContrasena}
            onChange={(e) => handlePasswordChange('nuevaContrasena', e.target.value)}
            placeholder="Nueva contraseña"
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            value={passwordData.confirmarContrasena}
            onChange={(e) => handlePasswordChange('confirmarContrasena', e.target.value)}
            placeholder="Confirmar nueva contraseña"
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(false)
                setPasswordData({
                  contrasenaActual: '',
                  nuevaContrasena: '',
                  confirmarContrasena: ''
                })
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpdatePassword}
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Actualizar Contraseña
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )

  if (loading) return <div className="text-center mt-10">Cargando perfil...</div>
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>

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
              <span>
                Miembro desde{" "}
                {userProfile.miembroDesde
                  ? new Date(userProfile.miembroDesde).toLocaleString()
                  : "Fecha no disponible"}
              </span>

            </div>
            <div className="flex items-center">
              <Shield size={16} className="mr-2" />
              <span>Cuenta Verificada</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Información del perfil */}
        <motion.div variants={containerVariants} className="space-y-4">
          <EditableField
            icon={User}
            title="Nombre Completo"
            field="nombre"
            value={userProfile.nombre}
          />
          <EditableField
            icon={Mail}
            title="Correo Electrónico"
            field="email"
            value={userProfile.email}
            type="email"
          />
          <EditableField
            icon={Phone}
            title="Teléfono"
            field="telefono"
            value={userProfile.telefono}
            type="tel"
          />
          <EditableField
            icon={MapPin}
            title="Dirección"
            field="direccion"
            value={userProfile.direccion}
          />
          <PasswordSection />
        </motion.div>
      </motion.div>
    </div>
  )
}
