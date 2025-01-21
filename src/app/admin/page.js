'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Usuarios',
      value: '1,234',
      icon: Users,
      change: '+12%',
      color: 'blue'
    },
    {
      title: 'Pedidos Hoy',
      value: '45',
      icon: ShoppingBag,
      change: '+5%',
      color: 'green'
    },
    {
      title: 'Ingresos',
      value: '$12,345',
      icon: DollarSign,
      change: '+18%',
      color: 'orange'
    },
    {
      title: 'Crecimiento',
      value: '24%',
      icon: TrendingUp,
      change: '+2%',
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  )
} 