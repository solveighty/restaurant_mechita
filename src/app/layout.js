import Navbar from '@/components/Navbar'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from '@/context/CartContext'

export const metadata = {
  title: 'Comidas Mechita',
  description: 'Tu restaurante favorito',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Navbar />
          <main>
            {children}
            <ToastContainer />
          </main>
        </CartProvider>
      </body>
    </html>
  )
}
