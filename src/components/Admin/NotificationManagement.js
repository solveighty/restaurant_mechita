import { useState, useEffect } from 'react'
import { Bell, Check, Filter } from 'lucide-react'
import { decodeJwt } from 'jose'
import axios from 'axios'
import url_Backend from '@/context/config'
import { toast } from 'react-toastify'

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decodedToken = decodeJwt(token)
      setUserId(decodedToken.id)
    }
  }, [])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://${url_Backend}:8080/notificaciones/administrador/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const formattedNotifications = response.data
        .map(notif => ({
          ...notif,
          fecha: new Date(notif.fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      toast.error('Error al cargar las notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://${url_Backend}:8080/notificaciones/marcar-leida/${notificationId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, leida: true }
            : notif
        )
      )
      
      toast.success('Notificación marcada como leída', { 
        autoClose: 2000, 
        closeOnClick: true, 
        hideProgressBar: true, 
        position: "bottom-right" 
      })
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
      toast.error('Error al marcar la notificación como leída')
    }
  }

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      // Configurar polling cada 30 segundos
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const filteredNotifications = notifications
    .filter(notif => {
      if (filter === 'unread') return !notif.leida
      return true
    })
    // Asegurar que siempre se ordenen por fecha más reciente
    .sort((a, b) => {
      // Convertir las fechas a objetos Date para comparación
      const dateA = new Date(a.fecha.replace(/de/g, '').replace(/,/g, ''))
      const dateB = new Date(b.fecha.replace(/de/g, '').replace(/,/g, ''))
      return dateB - dateA
    })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Notificaciones
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${filter === 'all' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <Bell className="w-4 h-4" />
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${filter === 'unread' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            Sin leer
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer en este momento.'
                : 'No hay notificaciones para mostrar.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`
                relative bg-white rounded-lg shadow-sm border
                transition-all duration-200
                ${notification.leida 
                  ? 'border-gray-100' 
                  : 'border-orange-100 bg-orange-50'
                }
              `}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`
                      p-2 rounded-full
                      ${notification.leida 
                        ? 'bg-gray-100' 
                        : 'bg-orange-100'
                      }
                    `}>
                      <Bell className={`w-5 h-5 ${
                        notification.leida ? 'text-gray-500' : 'text-orange-500'
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      notification.leida ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.mensaje}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {notification.fecha}
                    </p>
                  </div>
                  {!notification.leida && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="
                          inline-flex items-center gap-1 px-3 py-1.5 
                          rounded-full text-sm font-medium
                          text-green-600 bg-green-50 hover:bg-green-100
                          transition-colors duration-200
                        "
                        title="Marcar como leída"
                      >
                        <Check className="w-4 h-4" />
                        Marcar leída
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 