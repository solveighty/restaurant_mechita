'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Phone, MessageSquare, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as jose from 'jose'
import url_Backend from '@/context/config'

export default function ChatManagement() {
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState([])
  const chatContainerRef = useRef(null)
  const wsRef = useRef(null)
  const [adminId, setAdminId] = useState(null)
  const [messagesByChat, setMessagesByChat] = useState({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
    if (!adminId) return;

    // Conectar a ambos WebSockets
    const wsWhatsapp = new WebSocket(`ws://${url_Backend}:8081`);
    const wsTelegram = new WebSocket(`ws://${url_Backend}:8082`);
    
    const handleWebSocketMessage = (event, platform) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'active_chats':
          // Agregar la plataforma a cada chat
          const chatsWithPlatform = data.chats.map(chat => ({
            ...chat,
            platform: platform
          }));
          
          // Actualizar los mensajes y conversaciones
          setMessagesByChat(prev => {
            const newMessages = { ...prev };
            chatsWithPlatform.forEach(chat => {
              const chatKey = `${platform}_${chat.userId}`;
              newMessages[chatKey] = chat.messages.map(msg => ({
                id: msg.timestamp,
                text: msg.message,
                sender: msg.sender,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              }));
            });
            return newMessages;
          });

          setConversations(prev => {
            const filteredConvs = prev.filter(conv => conv.platform !== platform);
            return [...filteredConvs, ...chatsWithPlatform.map(chat => ({
              id: chat.userId,
              name: chat.username,
              lastMessage: chat.messages[chat.messages.length - 1]?.message || 'Inicio de chat',
              unread: 0,
              platform: platform,
              timestamp: new Date().toLocaleTimeString(),
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.username}`,
              actualUserId: chat.actualUserId
            }))];
          });
          break;

        case 'new_chat':
          setConversations(prev => {
            const filteredConvs = prev.filter(conv => conv.actualUserId !== data.actualUserId)
            return [...filteredConvs, {
              id: data.userId,
              name: data.username,
              lastMessage: data.message,
              unread: 1,
              platform: platform,
              timestamp: new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
              actualUserId: data.actualUserId
            }]
          });

          setMessagesByChat(prev => ({
            ...prev,
            [`${platform}_${data.userId}`]: []
          }));
          break;

        case 'chat_message':
          const newMsg = {
            id: Date.now(),
            text: data.message,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };

          // Actualizar messagesByChat
          setMessagesByChat(prev => {
            const chatKey = `${platform}_${data.userId}`;
            const updatedMessages = [...(prev[chatKey] || []), newMsg];
            return {
              ...prev,
              [chatKey]: updatedMessages
            };
          });

          // Si el chat está seleccionado, actualizar los mensajes directamente
          if (selectedChat?.id === data.userId && selectedChat?.platform === platform) {
            setMessages(prev => [...prev, newMsg]);
          }

          setConversations(prev => prev.map(conv => {
            if (conv.id === data.userId && conv.platform === platform) {
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
          }));
          break;

        case 'end_chat':
          setConversations(prev => prev.filter(conv => 
            !(conv.id === data.userId && conv.actualUserId === data.actualUserId)
          ));
          
          setMessagesByChat(prev => {
            const newMessages = { ...prev };
            delete newMessages[`${platform}_${data.userId}`];
            return newMessages;
          });
          
          if (selectedChat?.id === data.userId && selectedChat?.platform === platform) {
            setSelectedChat(null);
            setMessages([]);
          }
          break;
      }
    };

    wsWhatsapp.onopen = () => {
      wsWhatsapp.send(JSON.stringify({
        type: 'admin_register',
        adminId: adminId
      }));
    };

    wsTelegram.onopen = () => {
      wsTelegram.send(JSON.stringify({
        type: 'admin_register',
        adminId: adminId
      }));
    };

    wsWhatsapp.onmessage = (event) => handleWebSocketMessage(event, 'whatsapp');
    wsTelegram.onmessage = (event) => handleWebSocketMessage(event, 'telegram');

    wsRef.current = {
      whatsapp: wsWhatsapp,
      telegram: wsTelegram
    };

    return () => {
      wsWhatsapp.close();
      wsTelegram.close();
    };
  }, [adminId]);

  // Efecto para mantener los mensajes sincronizados con messagesByChat
  useEffect(() => {
    if (selectedChat) {
      const chatKey = `${selectedChat.platform}_${selectedChat.id}`;
      setMessages(messagesByChat[chatKey] || []);
    }
  }, [selectedChat, messagesByChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const ws = wsRef.current[selectedChat.platform]
    if (!ws) return

    ws.send(JSON.stringify({
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
      [`${selectedChat.platform}_${selectedChat.id}`]: [...(prev[`${selectedChat.platform}_${selectedChat.id}`] || []), newMsg]
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
    setMessages(messagesByChat[`${conv.platform}_${conv.id}`] || [])
    setConversations(prev => prev.map(c => {
      if (c.id === conv.id) {
        return { ...c, unread: 0 }
      }
      return c
    }))
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row bg-gray-100">
      {/* Botón de menú móvil con animación mejorada */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out"
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      {/* Sidebar mejorado */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: isSidebarOpen ? 0 : -300,
          opacity: isSidebarOpen ? 1 : 0,
          width: isSidebarOpen ? 'auto' : 0 
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className={`
          fixed md:relative
          w-full md:w-1/3 lg:w-1/4
          h-full
          bg-white
          border-r border-gray-200
          shadow-2xl md:shadow-lg
          z-40 md:z-auto
          overflow-hidden
        `}
      >
        {/* Header del sidebar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Conversaciones</h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="overflow-y-auto h-[calc(100%-4rem)] pb-20">
          <AnimatePresence>
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgb(255, 237, 213)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleSelectChat(conv);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`
                  p-4 border-b border-gray-100
                  cursor-pointer
                  transition-all duration-200
                  hover:bg-orange-50
                  ${selectedChat?.id === conv.id ? "bg-orange-100" : ""}
                `}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative flex-shrink-0">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-md">
                      {conv.platform === "telegram" ? (
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Phone className="w-4 h-4 text-green-500" />
                      )}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {conv.name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {conv.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full mt-2"
                      >
                        {conv.unread}
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Header del chat */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white border-b shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    {selectedChat.platform === "telegram" ? (
                      <>
                        <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                        Telegram
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 text-green-500 mr-1" />
                        WhatsApp
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Área de mensajes */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: message.sender === "admin" ? 100 : -100 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${
                      message.sender === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`
                        max-w-[75%] p-3 rounded-lg shadow-md
                        ${message.sender === "admin"
                          ? "bg-orange-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                        }
                      `}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {message.timestamp}
                      </span>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Área de entrada de mensaje */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t shadow-lg"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-md"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.form>
          </>
        ) : (
          // Estado sin chat seleccionado
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center p-4"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-orange-500 opacity-50" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Sin chat seleccionado</h3>
              <p className="text-gray-500">Selecciona una conversación para comenzar</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 