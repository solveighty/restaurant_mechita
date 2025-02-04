import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { Trash2, Plus, Home } from 'lucide-react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import url_Backend from '@/context/config'

export default function CartFooter({ onClose }) {
  const { cartItems, paymentMethod, setPaymentMethod, processPayment, calculateTotal } = useCart()
  const [direcciones, setDirecciones] = useState([])
  const [nuevaDireccion, setNuevaDireccion] = useState('')
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [direccionPrincipal, setDireccionPrincipal] = useState('')

  // Obtener el userId del token
  const getUserId = () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = decodeJwt(token)
        return decodedToken.id
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        return null
      }
    }
    return null
  }

  // Obtener dirección principal del usuario
  const fetchDireccionPrincipal = async () => {
    try {
      const userId = getUserId()
      if (!userId) return

      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://${url_Backend}:8080/usuarios/obtenerusuario/${userId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (response.data && response.data.direccion) {
        setDireccionPrincipal(response.data.direccion)
        // Si no hay dirección seleccionada, seleccionar la principal por defecto
        if (!direccionSeleccionada) {
          setDireccionSeleccionada(response.data.direccion)
        }
      }
    } catch (error) {
      console.error('Error al obtener dirección principal:', error)
    }
  }

  // Cargar direcciones temporales
  const fetchDirecciones = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://${url_Backend}:8080/usuarios/${userId}/direcciones`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      setDirecciones(response.data)
    } catch (error) {
      console.error('Error al cargar direcciones:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agregar dirección temporal
  const agregarDireccion = async () => {
    if (!nuevaDireccion.trim()) return
    
    try {
      const userId = getUserId()
      const token = localStorage.getItem('token')
      await axios.post(
        `http://${url_Backend}:8080/usuarios/${userId}/direccion-temporal`,
        nuevaDireccion,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      )
      setNuevaDireccion('')
      setShowAddressForm(false)
      // Recargar las direcciones después de agregar una nueva
      await fetchDirecciones()
    } catch (error) {
      console.error('Error al agregar dirección:', error)
    }
  }

  // Eliminar dirección temporal
  const eliminarDireccion = async (direccion) => {
    try {
      const userId = getUserId()
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://${url_Backend}:8080/usuarios/${userId}/direccion-temporal`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          data: direccion
        }
      )
      // Si la dirección eliminada era la seleccionada, seleccionar la principal
      if (direccionSeleccionada === direccion) {
        setDireccionSeleccionada(direccionPrincipal)
      }
      await fetchDirecciones()
    } catch (error) {
      console.error('Error al eliminar dirección:', error)
    }
  }

  // Eliminar todas las direcciones temporales
  const eliminarTodasDirecciones = async () => {
    try {
      const userId = getUserId()
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://${url_Backend}:8080/usuarios/${userId}/direcciones-temporales`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      // Seleccionar la dirección principal después de eliminar todas las temporales
      setDireccionSeleccionada(direccionPrincipal)
      await fetchDirecciones()
    } catch (error) {
      console.error('Error al eliminar direcciones:', error)
    }
  }

  // Manejar cambio de dirección seleccionada
  const handleDireccionChange = (direccion) => {
    setDireccionSeleccionada(direccion)
  }

  const handlePayment = async () => {
    if (!direccionSeleccionada) {
      alert('Por favor selecciona una dirección de envío')
      return
    }
    const success = await processPayment(direccionSeleccionada)
    if (success) {
      onClose?.()
    }
  }

  // Cargar todas las direcciones al inicio
  useEffect(() => {
    fetchDireccionPrincipal()
    fetchDirecciones()
  }, [])

  return (
    <div className="border-t p-4 max-h-[80vh] md:max-h-none overflow-y-auto">
      {/* Sección de direcciones */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Dirección de envío
          </label>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="text-orange-500 hover:text-orange-600 text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Nueva dirección</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>

        {/* Formulario para agregar dirección */}
        {showAddressForm && (
          <div className="mb-3 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={nuevaDireccion}
              onChange={(e) => setNuevaDireccion(e.target.value)}
              placeholder="Ingresa la dirección"
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <button
              onClick={agregarDireccion}
              className="bg-orange-500 text-white px-3 py-2 sm:py-1 rounded-md hover:bg-orange-600 text-sm"
            >
              Agregar
            </button>
          </div>
        )}

        {/* Lista de direcciones */}
        <div className="space-y-2">
          {/* Dirección principal */}
          {direccionPrincipal && (
            <div 
              className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${
                direccionSeleccionada === direccionPrincipal 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-white border-gray-200 hover:bg-orange-50'
              }`}
              onClick={() => handleDireccionChange(direccionPrincipal)}
            >
              <div className="flex items-center justify-center w-5 h-5">
                <input
                  type="radio"
                  name="direccion"
                  checked={direccionSeleccionada === direccionPrincipal}
                  onChange={() => handleDireccionChange(direccionPrincipal)}
                  className="text-orange-500 focus:ring-orange-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <Home className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium break-words">
                {direccionPrincipal}
                <span className="ml-2 text-xs text-orange-600">(Principal)</span>
              </span>
            </div>
          )}

          {/* Direcciones temporales */}
          {loading ? (
            <div className="text-center py-2">Cargando direcciones...</div>
          ) : direcciones.length > 0 ? (
            <>
              {direcciones.map((direccion, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${
                    direccionSeleccionada === direccion 
                      ? 'bg-gray-100 border-gray-300' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleDireccionChange(direccion)}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    <input
                      type="radio"
                      name="direccion"
                      checked={direccionSeleccionada === direccion}
                      onChange={() => handleDireccionChange(direccion)}
                      className="text-orange-500 focus:ring-orange-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <span className="flex-1 text-sm break-words">{direccion}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      eliminarDireccion(direccion)
                    }}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {direcciones.length > 1 && (
                <button
                  onClick={eliminarTodasDirecciones}
                  className="text-red-500 hover:text-red-600 text-sm mt-2 w-full text-center"
                >
                  Eliminar todas las direcciones temporales
                </button>
              )}
            </>
          ) : !loading && direcciones.length === 0 && !direccionPrincipal && (
            <p className="text-sm text-gray-500 text-center py-2">
              No hay direcciones guardadas
            </p>
          )}
        </div>
      </div>

      {/* Método de pago */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de pago
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
        </select>
      </div>

      {/* Total y botón de pago */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex justify-between sm:flex-1">
          <span className="font-semibold">Total:</span>
          <span className="font-semibold">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>
        <button
          onClick={handlePayment}
          className="w-full sm:w-auto sm:min-w-[200px] bg-orange-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={cartItems.length === 0 || !direccionSeleccionada}
        >
          Pagar ahora
        </button>
      </div>
    </div>
  )
} 