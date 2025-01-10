import './globals.css'

export const metadata = {
  title: 'Registro - Delicias Express',
  description: 'Regístrate en Delicias Express',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
