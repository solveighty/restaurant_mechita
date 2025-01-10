'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Mail, Instagram, Send, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  // Datos del restaurante
  const restaurantInfo = {
    address: "Calle Principal 123, Ciudad",
    phone: "+34 123 456 789",
    email: "info@deliciasexpress.com",
    schedule: {
      weekdays: "Lunes a Viernes: 11:00 - 23:00",
      weekends: "Sábados y Domingos: 12:00 - 00:00"
    },
    socialMedia: {
      instagram: "https://instagram.com/turestaurante",
      telegram: "https://t.me/turestaurante",
      whatsapp: "https://wa.me/34123456789"
    }
  }

  const InfoCard = ({ icon: Icon, title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-orange-100 p-3 rounded-full">
          <Icon className="text-orange-500 w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600 ml-14">
        {children}
      </div>
    </motion.div>
  )

  const SocialButton = ({ icon: Icon, href, label, bgColor }) => (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`${bgColor} text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300`}
      aria-label={label}
    >
      <Icon size={24} />
    </motion.a>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Contáctanos</h1>
          <p className="text-gray-600">Estamos aquí para atenderte</p>
        </div>

        <InfoCard icon={Phone} title="Teléfono">
          <a 
            href={`tel:${restaurantInfo.phone}`}
            className="text-orange-500 hover:text-orange-600"
          >
            {restaurantInfo.phone}
          </a>
        </InfoCard>

        <InfoCard icon={Clock} title="Horario de Atención">
          <p>{restaurantInfo.schedule.weekdays}</p>
          <p>{restaurantInfo.schedule.weekends}</p>
        </InfoCard>

        <InfoCard icon={Mail} title="Correo y Redes Sociales">
          <a 
            href={`mailto:${restaurantInfo.email}`}
            className="text-orange-500 hover:text-orange-600 block mb-6"
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
