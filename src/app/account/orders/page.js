'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  DollarSign,
  Search,
  FilterX,
  Star,
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { decodeJwt } from 'jose'
import { toast } from 'react-toastify'
import url_Backend from '@/context/config'
import axios from 'axios';

const estadosIcons = {
  'EN_PROCESO': <Package className="w-5 h-5" />,
  'EN_TRANSITO': <Truck className="w-5 h-5" />,
  'ENTREGADO': <CheckCircle2 className="w-5 h-5" />
}

const estadosColors = {
  'EN_PROCESO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'EN_TRANSITO': 'bg-blue-100 text-blue-800 border-blue-200',
  'ENTREGADO': 'bg-green-100 text-green-800 border-green-200'
}

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('EN_PROCESO')
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewType, setReviewType] = useState('PAGINA')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userReviews, setUserReviews] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pedidosPorPagina = 5

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decodedToken = decodeJwt(token)
      setUserId(decodedToken.id)
    }
  }, [])

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!userId) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://${url_Backend}:8080/historial/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Ordenar pedidos por fecha, más recientes primero
        const sortedData = response.data.sort((a, b) => 
          new Date(b.fechaCompra) - new Date(a.fechaCompra)
        )
        setPedidos(sortedData)
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
        setPedidos([])
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchPedidos()
    }
  }, [userId])

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!userId) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://${url_Backend}:8080/resenas/usuario/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setUserReviews(response.data)
      } catch (error) {
        console.error('Error al cargar reseñas:', error)
        setUserReviews([])
      }
    }

    if (userId) {
      fetchUserReviews()
    }
  }, [userId])

  // Función para calcular el total de un pedido
  const calcularTotalPedido = (detalles) => {
    if (!detalles) return 0
    return detalles.reduce((total, item) => total + item.precio, 0)
  }

  const pedidosFiltrados = pedidos
    .filter(pedido => 
      filtroEstado === 'TODOS' || pedido.estadoCompra === filtroEstado
    )
    .filter(pedido =>
      searchTerm === '' || 
      pedido.detalles.some(item => 
        item.nombreMenu.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

  // Función para verificar si ya existe una reseña
  const hasExistingReview = (type, orderId = null) => {
    return userReviews.some(review => {
      if (type === 'PAGINA') {
        return review.tipoResena === 'PAGINA'
      } else {
        return review.tipoResena === 'PEDIDO' && review.historialCompra?.id === orderId
      }
    })
  }

  // Función para obtener la reseña existente
  const getExistingReview = (orderId) => {
    return userReviews.find(review => 
      review.tipoResena === 'PEDIDO' && review.historialCompra?.id === orderId
    )
  }

  // Calcular pedidos para la página actual
  const indexOfLastPedido = currentPage * pedidosPorPagina
  const indexOfFirstPedido = indexOfLastPedido - pedidosPorPagina
  const pedidosActuales = pedidosFiltrados.slice(indexOfFirstPedido, indexOfLastPedido)
  const totalPages = Math.ceil(pedidosFiltrados.length / pedidosPorPagina)

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const token = localStorage.getItem('token')
    const decodedToken = decodeJwt(token)
    const userId = decodedToken.id

    const reviewData = {
      usuario: { id: userId },
      comentario: comment,
      calificacion: rating,
      tipoResena: reviewType,
    }

    if (reviewType === 'PEDIDO') {
      reviewData.historialCompra = { id: selectedOrderId }
    }

    try {
      const response = await axios.post(`http://${url_Backend}:8080/resenas/crear`, reviewData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 200) {
        // Actualizar las reseñas del usuario inmediatamente
        const reviewsResponse = await axios.get(`http://${url_Backend}:8080/resenas/usuario/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setUserReviews(reviewsResponse.data)
        
        setComment('')
        setRating(0)
        setShowReviewForm(false)
        toast.success('¡Gracias por tu reseña!', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
      }
    } catch (error) {
      console.error('Error al enviar la reseña:', error)
      toast.error('Error al enviar la reseña', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Modificar la función que abre el formulario de reseña
  const handleOpenReviewForm = (pedido) => {
    const reviewType = pedido.estadoCompra === 'ENTREGADO' ? 'PEDIDO' : 'PAGINA'
    
    if (reviewType === 'PEDIDO') {
      if (hasExistingReview('PEDIDO', pedido.id)) {
        toast.error('Ya has dejado una reseña para este pedido', { autoClose: 2000, closeOnClick: true, hideProgressBar: true })
        return
      }
    } 

    setSelectedOrderId(pedido.id)
    setReviewType(reviewType)
    setShowReviewForm(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Historial de todos tus pedidos y su estado actual
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre del producto..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FilterX className="w-5 h-5" />
            </button>
          )}
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          {[
            { label: 'Todos', value: 'TODOS' },
            { label: 'En proceso', value: 'EN_PROCESO' },
            { label: 'En tránsito', value: 'EN_TRANSITO' },
            { label: 'Entregado', value: 'ENTREGADO' },
          ].map(estado => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Pedidos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron pedidos con los filtros actuales.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {pedidosActuales.map((pedido) => (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                {/* Header del pedido */}
                <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{pedido.id}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(pedido.fechaCompra).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(pedido.fechaCompra).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${calcularTotalPedido(pedido.detalles).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${estadosColors[pedido.estadoCompra]}`}>
                    {estadosIcons[pedido.estadoCompra]}
                    <span className="text-sm font-medium">
                      {pedido.estadoCompra.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Información del cliente y entrega */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Información de entrega</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cliente</p>
                      <p className="font-medium">{pedido.usuario.nombre}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dirección principal</p>
                      <p className="font-medium">{pedido.usuario.direccion}</p>
                    </div>
                    {pedido.direccionEnvio && (
                      <div className="md:col-span-2">
                        <p className="text-gray-500">Dirección de envío seleccionada</p>
                        <p className="font-medium text-orange-600">{pedido.direccionEnvio}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium">{pedido.usuario.telefono}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{pedido.usuario.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Método de pago</p>
                      <p className="font-medium">
                        {pedido.metodoPago === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items del pedido */}
                <div className="space-y-4">
                  {pedido.detalles.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.nombreMenu}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.precio).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total del pedido */}
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total del pedido:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      ${calcularTotalPedido(pedido.detalles).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Sección de reseña */}
                <div className="mt-4 border-t pt-4">
                  {hasExistingReview('PEDIDO', pedido.id) ? (
                    // Mostrar la reseña existente
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Tu reseña</h4>
                      {(() => {
                        const review = getExistingReview(pedido.id)
                        return (
                          <div>
                            <div className="flex mb-2">
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
                            <p className="text-gray-700">{review.comentario}</p>
                            <div className="text-sm text-gray-500 mt-2">
                              {new Date(review.fecha).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    // Botón para dejar reseña
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleOpenReviewForm(pedido)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                          ${pedido.estadoCompra !== 'ENTREGADO'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                        disabled={pedido.estadoCompra !== 'ENTREGADO'}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {pedido.estadoCompra !== 'ENTREGADO'
                          ? 'Disponible al entregar'
                          : 'Dejar reseña'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Paginación Responsive */}
          <div className="mt-8">
            {/* Controles de paginación */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 sm:px-4 sm:py-2 rounded-md bg-orange-100 text-orange-600 
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-200 
                           transition-colors text-sm sm:text-base flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de página - Responsive */}
                <div className="flex gap-1 sm:gap-2">
                  {totalPages <= 5 ? (
                    // Si hay 5 páginas o menos, mostrar todas
                    [...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md transition-colors text-sm sm:text-base
                          ${currentPage === index + 1
                            ? 'bg-orange-600 text-white'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                      >
                        {index + 1}
                      </button>
                    ))
                  ) : (
                    // Si hay más de 5 páginas, mostrar versión condensada
                    <>
                      {/* Primera página */}
                      {currentPage > 2 && (
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-orange-100 
                                   text-orange-600 hover:bg-orange-200 transition-colors text-sm sm:text-base"
                        >
                          1
                        </button>
                      )}

                      {/* Elipsis izquierdo */}
                      {currentPage > 3 && (
                        <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500">
                          ...
                        </span>
                      )}

                      {/* Páginas alrededor de la actual */}
                      {[...Array(5)].map((_, index) => {
                        const pageNumber = currentPage - 2 + index
                        if (pageNumber > 0 && pageNumber <= totalPages) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md transition-colors text-sm sm:text-base
                                ${currentPage === pageNumber
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                            >
                              {pageNumber}
                            </button>
                          )
                        }
                        return null
                      })}

                      {/* Elipsis derecho */}
                      {currentPage < totalPages - 2 && (
                        <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500">
                          ...
                        </span>
                      )}

                      {/* Última página */}
                      {currentPage < totalPages - 1 && (
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-orange-100 
                                   text-orange-600 hover:bg-orange-200 transition-colors text-sm sm:text-base"
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 sm:px-4 sm:py-2 rounded-md bg-orange-100 text-orange-600 
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-200 
                           transition-colors text-sm sm:text-base flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Información de paginación */}
            <div className="text-center text-xs sm:text-sm text-gray-600 mt-4">
              Mostrando {indexOfFirstPedido + 1} - {Math.min(indexOfLastPedido, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
            </div>
          </div>

          {/* Modal de reseña */}
          {showReviewForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Deja tu reseña</h2>
                  <button 
                    onClick={() => setShowReviewForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Tipo de reseña</label>
                  <select
                    value={reviewType}
                    onChange={(e) => setReviewType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                  >
                    {selectedOrderId && reviewType === 'PEDIDO' && (
                      <option value="PEDIDO">Pedido #{selectedOrderId}</option>
                    )}
                  </select>
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
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 
                           disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 