import { motion } from 'framer-motion'
import { Package, Check } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { useRouter } from 'next/navigation'

export default function NotificationItem({ notification }) {
  const { markAsRead } = useNotifications()
  const router = useRouter()

  const handleMarkAsRead = async (e) => {
    e.stopPropagation()
    await markAsRead(notification.id)
  }

  // Extraer el ID del pedido del mensaje
  const getPedidoId = (mensaje) => {
    const match = mensaje.match(/ID de pedido: (\d+)/)
    return match ? match[1] : null
  }

  const handleClick = () => {
    const pedidoId = getPedidoId(notification.mensaje)
    if (pedidoId) {
      router.push(`/account/orders?highlight=${pedidoId}`)
      markAsRead(notification.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className={`
        p-4 
        border-b last:border-b-0 
        active:bg-gray-100 md:active:bg-transparent
        ${notification.leida 
          ? 'bg-gray-50 md:hover:bg-gray-100' 
          : 'bg-white md:hover:bg-orange-50'
        }
        cursor-pointer 
        transition-colors
        touch-pan-y
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Package 
            className={`w-5 h-5 ${
              notification.leida ? 'text-gray-400' : 'text-orange-500'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${
            notification.leida ? 'text-gray-600' : 'text-gray-900'
          }`}>
            {notification.mensaje}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.fecha).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        {!notification.leida && (
          <button
            onClick={handleMarkAsRead}
            className="
              flex-shrink-0 
              p-2
              text-gray-400 
              hover:text-green-500 
              active:bg-green-100
              md:hover:bg-green-50 
              rounded-full 
              transition-colors
              touch-manipulation
            "
            title="Marcar como leída"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
} 