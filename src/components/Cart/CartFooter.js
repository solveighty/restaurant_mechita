import { useCart } from '@/context/CartContext'

export default function CartFooter({ onClose }) {
  const { cartItems, paymentMethod, setPaymentMethod, processPayment, calculateTotal } = useCart()

  const handlePayment = async () => {
    const success = await processPayment()
    if (success) {
      onClose?.()
    }
  }

  return (
    <div className="border-t p-4">
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
      <div className="flex justify-between mb-4">
        <span className="font-semibold">Total:</span>
        <span className="font-semibold">
          ${calculateTotal().toFixed(2)}
        </span>
      </div>
      <button
        onClick={handlePayment}
        className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={cartItems.length === 0}
      >
        Pagar ahora
      </button>
    </div>
  )
} 