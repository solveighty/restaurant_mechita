import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import axios from 'axios'
import url_Backend from '@/context/config'
import { decodeJwt } from 'jose'
import { toast } from 'react-toastify'
import OrderDetailModal from './OrderDetailModal'

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('EN_PROCESO')
  const [userId, setUserId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [reviews, setReviews] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)

  const estadoOptions = [
    { label: 'En Proceso', value: 'EN_PROCESO', icon: Clock },
    { label: 'En Tránsito', value: 'EN_TRANSITO', icon: Truck },
    { label: 'Entregado', value: 'ENTREGADO', icon: Check }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decodedToken = decodeJwt(token)
      setUserId(decodedToken.id)
    }
  }, [])

  const fetchOrders = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://${url_Backend}:8080/historial/all?userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      setOrders(response.data)
    } catch (error) {
      console.error('Error al obtener pedidos:', error)
      toast.error('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://${url_Backend}:8080/resenas/pedidos?adminId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      const reviewsMap = {}
      response.data.forEach(review => {
        // Usar historialCompra.id para mapear la reseña al pedido
        reviewsMap[review.historialCompra?.id] = {
          rating: review.calificacion,
          comentario: review.comentario,
          fecha: review.fecha
        }
      })
      setReviews(reviewsMap)
    } catch (error) {
      console.error('Error al obtener reseñas:', error)
      toast.error('Error al cargar las reseñas')
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://${url_Backend}:8080/historial/actualizar-estado/${orderId}?userId=${userId}&nuevoEstado=${newStatus}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, estadoCompra: newStatus } : order
        )
      )

      toast.success('Estado actualizado correctamente', {
        autoClose: 2000,
        closeOnClick: true,
        hideProgressBar: true
      })
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  useEffect(() => {
    if (userId) {
      fetchOrders()
      fetchReviews()
    }
  }, [userId])

  // Ordenar pedidos por fecha más reciente y aplicar filtros
  const filteredOrders = orders
    .sort((a, b) => {
      // Convertir las fechas a objetos Date para comparación
      const dateA = new Date(a.fechaCompra)
      const dateB = new Date(b.fechaCompra)
      return dateB - dateA // Orden descendente (más reciente primero)
    })
    .filter(order => {
      const matchesSearch = order.id.toString().includes(searchTerm) ||
                          order.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.estadoCompra === statusFilter
      return matchesSearch && matchesStatus
    })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'EN_PROCESO': return 'text-yellow-600 bg-yellow-100'
      case 'EN_TRANSITO': return 'text-blue-600 bg-blue-100'
      case 'ENTREGADO': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-sm
              ${statusFilter === 'all' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Todos
          </button>
          {estadoOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1 rounded-full text-sm
                ${statusFilter === option.value 
                  ? getStatusColor(option.value)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.map(order => {
              const total = order.detalles.reduce((sum, item) => sum + item.precio, 0)
              return (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {order.usuario.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(order.fechaCompra).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.estadoCompra}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 border-0 
                        ${getStatusColor(order.estadoCompra)}`}
                    >
                      {estadoOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {selectedOrder && (
        <>
          <OrderDetailModal
            order={selectedOrder}
            review={reviews[selectedOrder.id]}
            onClose={() => setSelectedOrder(null)}
          />
        </>
      )}

      {/* Paginación mejorada */}
      <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
        {/* Versión móvil */}
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
              ${currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-300'}`}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Anterior
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium
              ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-300'}`}
          >
            Siguiente
            <ChevronRight className="h-5 w-5 ml-1" />
          </button>
        </div>

        {/* Versión desktop */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium text-orange-600">{indexOfFirstOrder + 1}</span>
              {' '}-{' '}
              <span className="font-medium text-orange-600">
                {Math.min(indexOfLastOrder, filteredOrders.length)}
              </span>
              {' '}de{' '}
              <span className="font-medium text-orange-600">{filteredOrders.length}</span>
              {' '}resultados
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-medium
                  ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-300'}`}
              >
                <span className="sr-only">Anterior</span>
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Números de página con mejor diseño */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Mostrar siempre primera página, última página, página actual y una página antes y después
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
                        ${currentPage === pageNumber
                          ? 'z-10 bg-orange-600 text-white focus-visible:outline-orange-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-orange-50'
                        } ${pageNumber === 1 ? '' : '-ml-px'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  // Mostrar puntos suspensivos
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-lg px-3 py-2 text-sm font-medium
                  ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600 border border-gray-300'}`}
              >
                <span className="sr-only">Siguiente</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 