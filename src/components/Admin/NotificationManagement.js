import { useState } from 'react'
import { Bell, Check, Filter } from 'lucide-react'

export default function NotificationManagement() {
  const [filter, setFilter] = useState('all')

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            ${filter === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          <Bell className="w-5 h-5" />
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            ${filter === 'unread' 
              ? 'bg-orange-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          Sin leer
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {/* Ejemplo de notificación */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Bell className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Nuevo pedido recibido
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Pedido #123 necesita ser procesado
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Hace 5 minutos
                  </p>
                </div>
                <button className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full">
                  <Check className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200">
                  Aprobar
                </button>
                <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200">
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 