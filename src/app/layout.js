import { Inter } from 'next/font/google'
import MainLayout from '@/components/MainLayout'
import RouteGuard from '@/components/RouteGuard'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Comidas Mechita',
  description: 'Tu restaurante favorito',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <RouteGuard>
          <MainLayout>{children}</MainLayout>
        </RouteGuard>
      </body>
    </html>
  )
}
