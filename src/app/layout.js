import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata = {
  title: 'Comidas Mechita',
  description: 'Tu restaurante favorito',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
