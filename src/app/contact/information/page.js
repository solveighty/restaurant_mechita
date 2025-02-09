'use client'

import { motion } from 'framer-motion'
import { Phone, Clock, Mail, Instagram, Send, MessageCircle } from 'lucide-react'

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

export default function ContactPage() {
  const restaurantInfo = {
    address: "404 Dooley Street, Oasis, Mississippi, 8325",
    phone: "+593 98 102 3471",
    email: "contact@comidasmechita.esm.ec",
    schedule: {
      weekdays: "Lunes a Viernes: 07:00 - 19:00",
      weekends: "Sábados: 08:00 - 16:00"
    },
    socialMedia: {
      instagram: "https://www.instagram.com/romanpaulov/",
      telegram: "https://t.me/ComidasMechita_bot",
      whatsapp: "https://manulization.com/"
    }
  }

  const InfoCard = ({ icon: Icon, title, children }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-6 sm:p-8 rounded-xl shadow-lg"
    >
      <div className="flex items-center space-x-4 mb-4">
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="bg-orange-100 p-3 rounded-full"
        >
          <Icon className="text-orange-500 w-6 h-6" />
        </motion.div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600 ml-14 text-sm sm:text-base">
        {children}
      </div>
    </motion.div>
  )

  const SocialButton = ({ icon: Icon, href, label, bgColor }) => (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      className={`${bgColor} text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300`}
      aria-label={label}
    >
      <Icon size={20} className="sm:w-6 sm:h-6" />
    </motion.a>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto space-y-6 sm:space-y-8"
      >
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4"
          >
            Contáctanos
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-orange-500 mx-auto mb-3 sm:mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-sm sm:text-base"
          >
            Estamos aquí para atenderte
          </motion.p>
        </motion.div>

        {/* Información de contacto */}
        <InfoCard icon={Phone} title="Teléfono">
          <a 
            href={`tel:${restaurantInfo.phone}`}
            className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
          >
            {restaurantInfo.phone}
          </a>
        </InfoCard>

        <InfoCard icon={Clock} title="Horario de Atención">
          <p className="mb-2">{restaurantInfo.schedule.weekdays}</p>
          <p>{restaurantInfo.schedule.weekends}</p>
        </InfoCard>

        <InfoCard icon={Mail} title="Correo y Redes Sociales">
          <a 
            href={`mailto:${restaurantInfo.email}`}
            className="text-orange-500 hover:text-orange-600 block mb-6 transition-colors duration-200"
          >
            {restaurantInfo.email}
          </a>
          
          <div className="flex space-x-4">
            <SocialButton
              icon={Instagram}
              href={restaurantInfo.socialMedia.instagram}
              label="Instagram"
              bgColor="bg-gradient-to-br from-purple-600 to-pink-500"
            />
            <SocialButton
              icon={Send}
              href={restaurantInfo.socialMedia.telegram}
              label="Telegram"
              bgColor="bg-blue-500"
            />
            <SocialButton
              icon={MessageCircle}
              href={restaurantInfo.socialMedia.whatsapp}
              label="WhatsApp"
              bgColor="bg-green-500"
            />
          </div>
        </InfoCard>
      </motion.div>
    </div>
  )
}
