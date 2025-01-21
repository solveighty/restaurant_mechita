import { useState, useEffect } from 'react'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X,
  Image as ImageIcon 
} from 'lucide-react'
import axios from 'axios'
import url_Backend from '@/context/config'
import { toast } from 'react-toastify'
import { decodeJwt } from 'jose'

export default function MenuManagement() {
  const [menus, setMenus] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: ''
  })

  const categorias = [
    { label: 'Platos Especiales', value: 'PLATOS_ESPECIALES' },
    { label: 'Comidas Rápidas', value: 'COMIDAS_RAPIDAS' },
    { label: 'Bocaditos', value: 'BOCADITOS' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decodedToken = decodeJwt(token)
      setUserId(decodedToken.id)
    }
  }, [])

  // Función auxiliar para obtener el token y headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchMenus = async () => {
    try {
      const response = await axios.get(
        `http://${url_Backend}:8080/menu`,
        { headers: getAuthHeaders() }
      )
      setMenus(response.data)
    } catch (error) {
      toast.error('Error al cargar los menús')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return

    try {
      const endpoint = isEditing 
        ? `http://${url_Backend}:8080/menu/editar/${selectedMenu}?userId=${userId}`
        : `http://${url_Backend}:8080/menu/crearmenu?userId=${userId}`

      const method = isEditing ? 'put' : 'post'

      await axios({
        method,
        url: endpoint,
        data: formData,
        headers: getAuthHeaders()
      })

      toast.success(isEditing ? 'Menú actualizado' : 'Menú creado')
      setIsModalOpen(false)
      resetForm()
      fetchMenus()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.message || 'Error al guardar el menú')
    }
  }

  const handleDelete = async (menuId) => {
    if (!userId || !window.confirm('¿Estás seguro de eliminar este menú?')) return

    try {
      await axios.delete(
        `http://${url_Backend}:8080/menu/eliminar/${menuId}?userId=${userId}`,
        { headers: getAuthHeaders() }
      )
      toast.success('Menú eliminado')
      fetchMenus()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar el menú')
    }
  }

  const handleEdit = (menu) => {
    setSelectedMenu(menu.id)
    setFormData({
      nombre: menu.nombre,
      descripcion: menu.descripcion,
      precio: menu.precio,
      imagen: menu.imagen,
      categoria: menu.categoria
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      categoria: ''
    })
    setSelectedMenu(null)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Menús</h2>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Menú
        </button>
      </div>

      {/* Lista de menús */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <div key={menu.id} className="bg-white rounded-lg shadow p-4">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={menu.imagen || '/placeholder-image.jpg'}
                alt={menu.nombre}
                className="object-cover rounded-lg"
              />
            </div>
            <h3 className="font-semibold text-gray-900">{menu.nombre}</h3>
            <p className="text-sm text-gray-500 mt-1">{menu.descripcion}</p>
            <p className="text-lg font-medium text-gray-900 mt-2">
              ${menu.precio.toFixed(2)}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(menu)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(menu.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear/editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Editar Menú' : 'Nuevo Menú'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({...formData, precio: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL de la imagen
                </label>
                <input
                  type="url"
                  value={formData.imagen}
                  onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                >
                  {isEditing ? 'Guardar cambios' : 'Crear menú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 