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
  FilterX
} from 'lucide-react'
import { decodeJwt } from 'jose'
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
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [searchTerm, setSearchTerm] = useState('')
  const [userId, setUserId] = useState(null)

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

        const data = response.data
        setPedidos(data)
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
            {pedidosFiltrados.map((pedido) => (
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

                {/* Información del cliente */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Información de entrega</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cliente</p>
                      <p className="font-medium">{pedido.usuario.nombre}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dirección</p>
                      <p className="font-medium">{pedido.usuario.direccion}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium">{pedido.usuario.telefono}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{pedido.usuario.email}</p>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
} 