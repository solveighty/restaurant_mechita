import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartItem({ item }) {
  const { removeItem, updateItemQuantity } = useCart()

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity > 0) {
      await updateItemQuantity(item.id, newQuantity)
    }
  }

  return (
    <div className="flex items-center space-x-4 py-4 px-2 hover:bg-gray-50">
      <div className="relative h-16 w-16">
        <Image
          src={item.menu.imagen}
          alt={item.menu.nombre}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">{item.menu.nombre}</h4>
        <div className="mt-1 flex items-center gap-4">
          {/* Controles de cantidad */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.cantidad - 1)}
              className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
              disabled={item.cantidad <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 w-8 text-center">
              {item.cantidad}
            </span>
            <button
              onClick={() => handleQuantityChange(item.cantidad + 1)}
              className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm font-medium text-orange-500">
            ${(item.menu.precio * item.cantidad).toFixed(2)}
          </p>
        </div>
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
} 