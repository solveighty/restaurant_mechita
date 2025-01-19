import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartItem({ item }) {
  const { removeItem } = useCart()

  return (
    <div className="flex items-center space-x-4 border-b pb-4">
      <div className="relative h-16 w-16">
        <Image
          src={item.menu.imagen}
          alt={item.menu.nombre}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{item.menu.nombre}</h4>
        <p className="text-sm text-gray-500">
          Cantidad: {item.cantidad}
        </p>
        <p className="text-orange-500 font-medium">
          ${(item.menu.precio * item.cantidad).toFixed(2)}
        </p>
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
} 