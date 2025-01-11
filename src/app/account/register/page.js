'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Phone, Star, Gift, Clock } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const InputField = ({ icon: Icon, label, name, type = "text", placeholder, showPasswordToggle = false, isPassword = false }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <motion.div
        className="relative"
        whileFocus={{ scale: 1.02 }}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          required
          value={formData[name]}
          onChange={handleChange}
          className="block w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="flex min-h-screen">
        {/* Sección de Publicidad/Presentación */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-red-600 p-12 text-white"
        >
          <div className="relative z-10 max-w-xl mx-auto flex flex-col justify-center h-full space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold">
                ¡Únete a nuestra familia!
              </h1>
              <p className="text-xl text-orange-100">
                Disfruta de beneficios exclusivos al registrarte
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              {/* Beneficios para nuevos usuarios */}
              <div className="space-y-6">
                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="bg-orange-400/20 p-3 rounded-lg">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Bono de Bienvenida</h3>
                    <p className="text-orange-100">20% de descuento en tu primer pedido</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="bg-orange-400/20 p-3 rounded-lg">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Programa de Puntos</h3>
                    <p className="text-orange-100">Acumula puntos en cada compra y canjéalos por premios</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-4"
                  whileHover={{ x: 10 }}
                >
                  <div className="bg-orange-400/20 p-3 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Delivery Prioritario</h3>
                    <p className="text-orange-100">Entregas express para miembros registrados</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-white/10 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">1000+</p>
                  <p className="text-sm text-orange-100">Clientes Felices</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">4.8★</p>
                  <p className="text-sm text-orange-100">Calificación</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">30min</p>
                  <p className="text-sm text-orange-100">Entrega Promedio</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </motion.div>

        {/* Sección del Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-xl"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                Crear Cuenta
              </motion.h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Únete a nosotros y disfruta de nuestros servicios
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={itemVariants}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <InputField
                icon={User}
                label="Nombre Completo"
                name="fullName"
                placeholder="Juan Pérez"
              />

              <InputField
                icon={Mail}
                label="Correo Electrónico"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
              />

              <InputField
                icon={Phone}
                label="Teléfono"
                name="phone"
                type="tel"
                placeholder="+34 123 456 789"
              />

              <InputField
                icon={Lock}
                label="Contraseña"
                name="password"
                placeholder="••••••••"
                showPasswordToggle
                isPassword
              />

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Registrarse
              </motion.button>

              {/* Login Link */}
              <motion.div
                variants={itemVariants}
                className="text-center text-sm sm:text-base"
              >
                <span className="text-gray-600">¿Ya tienes una cuenta? </span>
                <Link
                  href="/account/login"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Inicia sesión aquí
                </Link>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
