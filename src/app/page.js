'use client'
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Clock,
  Truck,
  Phone,
  ChefHat,
  Star
} from "lucide-react";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-8"
        >
          <UtensilsCrossed className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Sabores que llegan a tu puerta
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Descubre la mejor experiencia gastronómica desde la comodidad de tu hogar
          </p>
        </motion.div>
        <Link href="/menu">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Ordenar Ahora
          </motion.button>
        </Link>
      </motion.section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="w-8 h-8" />,
              title: "Entrega Rápida",
              description: "Tu pedido en menos de 30 minutos"
            },
            {
              icon: <ChefHat className="w-8 h-8" />,
              title: "Chefs Expertos",
              description: "Platillos preparados con pasión"
            },
            {
              icon: <Truck className="w-8 h-8" />,
              title: "Delivery Seguro",
              description: "Seguimiento en tiempo real"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-orange-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-orange-500 text-white py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Star className="w-8 h-8" fill="currentColor" />
            <Star className="w-8 h-8" fill="currentColor" />
            <Star className="w-8 h-8" fill="currentColor" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para disfrutar?
          </h2>
          <p className="text-xl mb-8">
            Haz tu pedido ahora y recibe un 10% de descuento
          </p>
          <div className="flex justify-center items-center space-x-4">
            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Ver Menú
              </motion.button>
            </Link>
            <Link href="/contact/information">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors"
              >
                Contactar
                <Phone className="w-5 h-5 inline-block ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}