import { X } from 'lucide-react'

export default function OrderDetailModal({ order, review, onClose }) {
  if (!order) return null
  

  // Calcular el total del pedido
  const total = order.detalles.reduce((sum, item) => sum + item.precio, 0)

  // Función para formatear el método de pago
  const formatPaymentMethod = (method) => {
    return method === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header - Sticky para mantener visible mientras se hace scroll */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Pedido #{order.id}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
          {/* Información del cliente */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Información del Cliente
            </h3>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg space-y-1">
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Nombre:</span> {order.usuario.nombre}
              </p>
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Email:</span> {order.usuario.email}
              </p>
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Teléfono:</span> {order.usuario.telefono}
              </p>
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Dirección principal:</span> {order.usuario.direccion}
              </p>
              {order.direccionEnvio && order.direccionEnvio !== order.usuario.direccion && (
                <p className="text-xs sm:text-sm text-gray-900">
                  <span className="font-medium">Dirección de envío:</span>{' '}
                  <span className="text-orange-600">{order.direccionEnvio}</span>
                </p>
              )}
            </div>
          </div>

          {/* Detalles del pedido */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Detalles del Pedido
            </h3>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg space-y-1">
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Fecha de Compra:</span>{' '}
                {new Date(order.fechaCompra).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Método de Pago:</span>{' '}
                <span className="capitalize">{formatPaymentMethod(order.metodoPago)}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-medium">Estado:</span>{' '}
                <span className={`
                  px-2 py-1 rounded-full text-xs
                  ${order.estadoCompra === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                    order.estadoCompra === 'EN_TRANSITO' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'}
                `}>
                  {order.estadoCompra}
                </span>
              </p>
            </div>
          </div>

          {/* Items del pedido - Tabla responsive */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Productos
            </h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 sm:py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Producto
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Cantidad
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Precio
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.detalles.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                            {item.nombreMenu}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">
                            {item.cantidad}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">
                            ${item.precio.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-900 text-right">
                            ${(item.precio).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 text-right">
                          Total
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 text-right">
                          ${total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add this section before the closing div */}
        {review && (
          <div className="p-3 sm:p-4 border-t">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Reseña del Cliente
            </h3>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg space-y-2">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-medium text-gray-900 mr-2">
                  Calificación:
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-4 h-4 ${
                        index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              {review.comentario && (
                <p className="text-xs sm:text-sm text-gray-700">
                  {review.comentario}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(review.fecha).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 