'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import url_Backend from './config'
import { toast } from 'react-toastify';

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [isToastShowing, setIsToastShowing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = decodeJwt(token)
        setUserId(decodedToken.id)
      } catch (error) {
        console.error('Error al decodificar el token:', error)
      }
    }
  }, [])

  // Agregar un efecto para el polling
  useEffect(() => {
    let intervalId;

    if (userId) {
      // Hacer la primera consulta inmediatamente
      fetchNotifications();

      // Configurar el intervalo de polling (cada 10 segundos)
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 10000);
    }

    // Limpiar el intervalo cuando el componente se desmonte o userId cambie
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId || isToastShowing) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://${url_Backend}:8080/notificaciones/usuario/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Filtrar y ordenar notificaciones
      const filteredNotifications = response.data
        .filter(notification => notification.tipoNotificacion === 'USUARIO')
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      
      // Solo mostrar el toast si hay notificaciones no leídas
      const unreadNotifications = filteredNotifications.filter(notification => !notification.leida)
      if (unreadNotifications.length > 0 && !toast.isActive('newNotification')) {
        setIsToastShowing(true);
        toast.success('Tienes una nueva notificación', { 
          autoClose: 2000, 
          closeOnClick: true, 
          hideProgressBar: true, 
          position: "bottom-right",
          toastId: 'newNotification',
          onClose: () => setIsToastShowing(false)
        });
      }

      setNotifications(filteredNotifications)
      
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    if (isToastShowing) return;
    
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
      // Actualizar el estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, leida: true }
            : notif
        )
      )
      
      if (!toast.isActive('notificationRead')) {
        setIsToastShowing(true);
        toast.success('Notificación marcada como leída', { 
          autoClose: 2000, 
          closeOnClick: true, 
          hideProgressBar: true, 
          position: "bottom-right",
          toastId: 'notificationRead',
          onClose: () => setIsToastShowing(false)
        });
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
    }
  }

  const value = {
    notifications,
    loading,
    fetchNotifications,
    markAsRead
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 