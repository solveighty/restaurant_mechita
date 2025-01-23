'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { User, Mail, Lock, Eye, EyeOff, Phone, Star, Gift, Clock, MapPin, User2 } from 'lucide-react'
import url_Backend from '@/context/config'

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
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    contrasena: '',
  })

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.contrasena.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
      return false
    }
    if (!formData.email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      toast.error('El correo electrónico no es válido', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
      return false
    }
    return true
  }

  const sendVerificationCode = async () => {
    try {
      const params = new URLSearchParams();
  params.append('email', formData.email);

  // Usando toast.promise para manejar los diferentes estados
  await toast.promise(
    axios.post(`http://${url_Backend}:8080/verification/send`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),
    {
      pending: 'Enviando código de verificación...',
      success: {
        render() {
          setVerificationStep(true);
          return 'Código de verificación enviado correctamente';
        },
        autoClose: 2000, // Cierra automáticamente después de 2 segundos
      },
      error: 'Hubo un error al enviar el código de verificación',
    },
    {
      hideProgressBar: true,
      closeOnClick: true,
    }
  );

    } catch (error) {
      console.error('Error al enviar código:', error)
      toast.error('Error al enviar el código de verificación', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
    }
  }

  const verifyCode = async () => {
    try {
      const params = new URLSearchParams()
      params.append('email', formData.email)
      params.append('code', verificationCode)

      const response = await axios.post(
        `http://${url_Backend}:8080/verification/verify`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      if (response.status === 200) {
        setTimeout(() => {
          toast.success('Cuenta verificada con correctamente.', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
          router.push('/account/login'); 
        }, 100);
        return true
      }
      toast.success('Usuario registrado exitosamente', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
    } catch (error) {
      console.error('Error al verificar código:', error)
      toast.error('Código de verificación inválido', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (!verificationStep) {
        // Primer paso: enviar código de verificación
        await sendVerificationCode()
        return
      }

      // Segundo paso: verificar código y registrar usuario
      const isCodeValid = await verifyCode()
      if (!isCodeValid) return

      // Registrar usuario
      const userData = {
        id: 0,
        usuario: formData.usuario,
        nombre: formData.nombre,
        contrasena: formData.contrasena,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        rol: "NORMAL"
      }

      const response = await axios.post(
        `http://${url_Backend}:8080/usuarios/crearusuario`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 200) {
        toast.success('Usuario registrado exitosamente', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
        router.push('/account/login')
      }
    } catch (error) {
      console.error('Error en el registro:', error)
      toast.error('Error al registrar usuario')
    }
  }

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
              {!verificationStep ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="nombre">
                      Nombre Completo
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="John Doe"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="usuario">
                      Nombre de Usuario
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="usuario"
                        name="usuario"
                        type="text"
                        required
                        value={formData.usuario}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="John Doe"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="email">
                      Correo Electrónico
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="ejemplo@correo.com"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="telefono">
                      Teléfono
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="telefono"
                        name="telefono"
                        type="text"
                        required
                        value={formData.telefono}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="0933322211"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="direccion">
                      Dirección
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="direccion"
                        name="direccion"
                        type="text"
                        required
                        value={formData.direccion}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="761 Kane Street, Morriston, American Samoa"
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="contrasena">
                      Contraseña
                    </label>
                    <motion.div
                      className="relative"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="contrasena"
                        name="contrasena"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.contrasena}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="••••••••"
                      />
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
                    </motion.div>
                  </div>
                </>) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Código de Verificación</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                onClick={handleSubmit}
              >
                {verificationStep ? 'Verificar y Registrar' : 'Enviar Código de Verificación'}
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
