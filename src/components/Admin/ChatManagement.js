'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Phone, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import * as jose from 'jose'

export default function ChatManagement() {
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState([])
  const chatContainerRef = useRef(null)
  const wsRef = useRef(null)
  const [adminId, setAdminId] = useState(null)
  const [messagesByChat, setMessagesByChat] = useState({})

  useEffect(() => {
    // Obtener y decodificar el token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = jose.decodeJwt(token)
        setAdminId(decodedToken.id)
      } catch (error) {
        console.error('Error al decodificar el token:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Solo conectar al WebSocket si tenemos el adminId
    if (!adminId) return

    wsRef.current = new WebSocket('ws://localhost:8081')

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({
        type: 'admin_register',
        adminId: adminId
      }))
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'active_chats':
          // Manejar los chats activos y sus mensajes
          const newMessagesByChat = {}
          data.chats.forEach(chat => {
            newMessagesByChat[chat.userId] = chat.messages.map(msg => ({
              id: msg.timestamp,
              text: msg.message,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }))
          })
          setMessagesByChat(newMessagesByChat)
          setConversations(data.chats.map(chat => ({
            id: chat.userId,
            name: chat.username,
            lastMessage: chat.messages[chat.messages.length - 1]?.message || 'Inicio de chat',
            unread: 0,
            platform: "whatsapp",
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.username}`,
            actualUserId: chat.actualUserId
          })))
          break

        case 'new_chat':
          setConversations(prev => {
            const filteredConvs = prev.filter(conv => conv.actualUserId !== data.actualUserId)
            return [...filteredConvs, {
              id: data.userId,
              name: data.username,
              lastMessage: data.message,
              unread: 1,
              platform: "whatsapp",
              timestamp: new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
              actualUserId: data.actualUserId
            }]
          })
          setMessagesByChat(prev => ({
            ...prev,
            [data.userId]: []
          }))
          break

        case 'chat_message':
          const newMsg = {
            id: Date.now(),
            text: data.message,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }

          setMessagesByChat(prev => ({
            ...prev,
            [data.userId]: [...(prev[data.userId] || []), newMsg]
          }))

          if (selectedChat?.id === data.userId) {
            setMessages(prev => [...prev, newMsg])
          }

          setConversations(prev => prev.map(conv => {
            if (conv.id === data.userId && conv.actualUserId === data.actualUserId) {
              return {
                ...conv,
                lastMessage: data.message,
                timestamp: new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                unread: selectedChat?.id === data.userId ? 0 : (conv.unread || 0) + 1
              }
            }
            return conv
          }))
          break

        case 'end_chat':
          setConversations(prev => prev.filter(conv => 
            !(conv.id === data.userId && conv.actualUserId === data.actualUserId)
          ))
          setMessagesByChat(prev => {
            const newMessages = { ...prev }
            delete newMessages[data.userId]
            return newMessages
          })
          if (selectedChat?.id === data.userId) {
            setSelectedChat(null)
            setMessages([])
          }
          break
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [adminId, selectedChat])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      userId: selectedChat.id,
      message: newMessage
    }))

    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "admin",
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    setMessagesByChat(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg]
    }))
    setMessages(prev => [...prev, newMsg])
    setNewMessage("")

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedChat.id) {
        return {
          ...conv,
          lastMessage: newMessage,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
      }
      return conv
    }))
  }

  const handleSelectChat = (conv) => {
    setSelectedChat(conv)
    setMessages(messagesByChat[conv.id] || [])
    setConversations(prev => prev.map(c => {
      if (c.id === conv.id) {
        return { ...c, unread: 0 }
      }
      return c
    }))
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Conversaciones</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
              onClick={() => handleSelectChat(conv)}
              className={`p-4 border-b cursor-pointer ${
                selectedChat?.id === conv.id ? "bg-orange-50" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <span className="absolute bottom-0 right-0">
                    {conv.platform === "telegram" ? (
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Phone className="w-4 h-4 text-green-500" />
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conv.name}
                    </h3>
                    <span className="text-xs text-gray-500">{conv.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-orange-500 rounded-full">
                    {conv.unread}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
                  <span className="text-sm text-gray-500">
                    {selectedChat.platform === "telegram" ? "Telegram" : "WhatsApp"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "admin"
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de mensaje */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación para comenzar
          </div>
        )}
      </div>
    </div>
  )
} 