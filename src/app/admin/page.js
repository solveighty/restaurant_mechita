'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react'
import axios from 'axios'
import { decodeJwt } from 'jose'
import url_Backend from '@/context/config'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ventas, setVentas] = useState([])
  const [rangoVentas, setRangoVentas] = useState('diario')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const decoded = decodeJwt(token)
        const adminId = decoded.id

        const { data } = await axios.get(`http://${url_Backend}:8080/estadisticas?adminId=${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const ventasResponse = await axios.get(
          `http://${url_Backend}:8080/historial/ventas?userId=${adminId}&rango=${rangoVentas}`,
          { headers: { Authorization: `Bearer ${token}` }}
        )

        const ventasData = ventasResponse.data.historial || []
        
        const totalVentas = ventasData.reduce((total, venta) => 
          total + (venta.detalles ? calcularTotalVenta(venta.detalles) : 0), 0
        )

        setStats([
          {
            title: 'Total Usuarios',
            value: data.totalUsuarios.toLocaleString(),
            icon: Users,
            change: '+12%',
            color: 'blue'
          },
          {
            title: 'Pedidos Hoy',
            value: data.pedidosHoy.toLocaleString(),
            icon: ShoppingBag,
            change: `${((data.pedidosHoy / data.pedidosSemana) * 100).toFixed(1)}%`,
            color: 'green'
          },
          {
            title: 'Pedidos Mes',
            value: data.pedidosMes.toLocaleString(),
            icon: TrendingUp,
            change: `${((data.pedidosMes / data.pedidosAnio) * 100).toFixed(1)}%`,
            color: 'purple'
          }
        ])
        setVentas(ventasData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rangoVentas])

  const calcularTotalVenta = (detalles) => {
    return detalles.reduce((total, detalle) => {
        const totalItem = detalle.precio;
        return total + totalItem;
    }, 0);
  };

  const handleRangoChange = (event) => {
    setRangoVentas(event.target.value)
  }

  if (loading) return <div className="flex justify-center p-6">Cargando...</div>
  if (error) return <div className="text-red-500 p-6">Error: {error}</div>
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500"> vs último mes</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Historial de Ventas Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Historial de Ventas</h2>
          <select
            value={rangoVentas}
            onChange={handleRangoChange}
            className="border rounded-md p-2"
          >
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left">Fecha</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta, index) => (
                <tr key={index} className="border-b">
                  <td className="px-6 py-4">
                    {new Date(venta.fechaCompra).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    ${calcularTotalVenta(venta.detalles).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{venta.estadoCompra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 