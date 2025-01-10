'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'

const menuItems = [
  { id: 1, name: 'Paella', description: 'Deliciosa paella valenciana', price: 15.99, image: '/placeholder.svg?height=300&width=300', category: 'Platos Especiales' },
  { id: 2, name: 'Hamburguesa', description: 'Hamburguesa clásica con queso', price: 8.99, image: '/placeholder.svg?height=300&width=300', category: 'Comidas Rápidas' },
  { id: 3, name: 'Croquetas', description: 'Croquetas caseras variadas', price: 6.99, image: '/placeholder.svg?height=300&width=300', category: 'Bocaditos' },
]

export default function MenuDisplay() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const categories = ['Platos Especiales', 'Comidas Rápidas', 'Bocaditos']

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setQuantity(1)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change))
  }

  const handleAddToCart = () => {
    console.log(`Added ${quantity} ${selectedItem?.name} to cart`)
    handleCloseModal()
  }

  return (
    <div>
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleItemClick(item)}
                >
                  <Image src={item.image} alt={item.name} width={300} height={300} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
              onClick={handleCloseModal}
            >
              <X size={24} />
            </button>
            <div className="flex">
              <Image src={selectedItem.image} alt={selectedItem.name} width={300} height={300} className="w-1/2 object-cover rounded-l-lg" />
              <div className="w-1/2 p-6">
                <h3 className="font-semibold text-2xl mb-2">{selectedItem.name}</h3>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                <p className="text-primary font-bold text-xl mb-4">${selectedItem.price.toFixed(2)}</p>
                <div className="flex items-center mb-4">
                  <button
                    className="bg-gray-200 rounded-full p-1"
                    onClick={() => handleQuantityChange(-1)}
                  >
                    <ChevronDown size={24} />
                  </button>
                  <span className="mx-4 text-xl">{quantity}</span>
                  <button
                    className="bg-gray-200 rounded-full p-1"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <ChevronUp size={24} />
                  </button>
                </div>
                <button
                  className="bg-indigo-500 text-white py-2 px-4 rounded-full w-full flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
