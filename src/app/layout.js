import Navbar from '@/components/Navbar'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from '@/context/CartContext'
import { NotificationProvider } from '@/context/NotificationContext'

export const metadata = {
  title: 'Comidas Mechita',
  description: 'Tu restaurante favorito',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <CartProvider>
            <Navbar />
            <main>
              {children}
              <ToastContainer />
            </main>
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
