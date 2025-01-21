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

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.leida
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

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
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Bell className={`w-6 h-6 ${
                    notification.leida ? 'text-gray-400' : 'text-orange-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm ${
                        notification.leida ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {notification.mensaje}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {notification.fecha}
                      </p>
                    </div>
                    {!notification.leida && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full"
                        title="Marcar como leída"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 