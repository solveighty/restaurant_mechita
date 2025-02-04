'use client'
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  Clock,
  Truck,
  Phone,
  ChefHat,
  Star,
  MessageSquare,
  Send,
  User,
  Calendar
} from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify'
import { decodeJwt } from 'jose';
import axios from 'axios';
import url_Backend from '@/context/config';

export default function Home() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageReviews, setPageReviews] = useState([]);
  const [userId, setUserId] = useState(null);

  // Obtener el ID del usuario del token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJwt(token);
      setUserId(decodedToken.id);
    }
  }, []);

  // Cargar reseñas de la página
  useEffect(() => {
    const fetchPageReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://${url_Backend}:8080/resenas/pagina`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setPageReviews(response.data);
      } catch (error) {
        console.error('Error al cargar reseñas de la página:', error);
      }
    };
    fetchPageReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión para dejar una reseña', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
        return;
      }

      const response = await axios.post(`http://${url_Backend}:8080/resenas/crear`, {
        usuario: { id: userId },
        comentario: comment,
        calificacion: rating,
        tipoResena: 'PAGINA'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setComment('');
        setRating(0);
        setShowReviewForm(false);
        // Recargar las reseñas
        const updatedResponse = await axios.get(`http://${url_Backend}:8080/resenas/pagina`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setPageReviews(updatedResponse.data);
        toast.success('¡Gracias por tu reseña!', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
      }
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
      toast.error('Error al enviar la reseña', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Reviews Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre las experiencias de nuestros usuarios con nuestro servicio
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {pageReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <User className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">
                      {review.usuario.nombre}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(review.fecha).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.calificacion
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{review.comentario}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Review Button */}
        {userId && (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewForm(true)}
              className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Dejar una reseña
            </motion.button>
          </div>
        )}

        {/* Review Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Tu opinión nos importa</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  <MessageSquare className="inline-block mr-2 w-5 h-5" />
                  Comentario
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                  placeholder="Cuéntanos tu experiencia..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                onClick={handleSubmitReview}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 
                         disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
              </motion.button>
            </motion.div>
          </div>
        )}
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