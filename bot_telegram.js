const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');

// Token del bot de Telegram
const token = process.env.BOT_TOKEN;

const url_Backend = '192.168.192.20'

// Crear el bot usando 'polling' para recibir actualizaciones
const bot = new TelegramBot(token, { polling: true });

// Estado para almacenar datos de sesión temporal
const userSessions = {};
const pendingSelections = {};

// Comando para loguearse
bot.onText(/\/login (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const credentials = match[1].split(' ');

  if (credentials.length !== 2) {
    bot.sendMessage(chatId, 'Formato incorrecto. Usa: /login <usuario> <contraseña>');
    return;
  }

  const [username, password] = credentials;

  try {
    // Obtener el token JWT mediante el endpoint de login
    const loginResponse = await axios.post(`http://${url_Backend}:8080/usuarios/login`, null, {
      params: {
        identificador: username,
        contrasena: password
      }
    });

    const token = loginResponse.data.token;

    // Usar el token para obtener los datos del usuario
    const usersResponse = await axios.get(`http://${url_Backend}:8080/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Buscar el usuario por nombre de usuario
    const user = usersResponse.data.find(u => u.usuario === username);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si el usuario es admin usando el token
    const isAdminResponse = await axios.get(`http://${url_Backend}:8080/usuarios/${user.id}/esAdmin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const isAdmin = isAdminResponse.data;

    // Guardar los detalles del usuario, token y estado de admin en la sesión
    userSessions[chatId] = {
      username,
      token, // Guardar el token JWT
      carritoId: user.carrito.id,
      isAdmin,
      ...user
    };

    // Obtener el carrito usando el token
    const carritoResponse = await axios.get(`http://${url_Backend}:8080/carrito/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    bot.sendMessage(chatId, `¡Hola, ${username}! Te has logueado exitosamente. Usa el comando /comandos para ver lo que puedes hacer.`);

  } catch (error) {
    console.error('Error:', error);
    if (error.response && error.response.status === 401) {
      bot.sendMessage(chatId, 'Credenciales incorrectas. Inténtalo de nuevo.');
    } else {
      bot.sendMessage(chatId, 'Error al iniciar sesión. Por favor, intenta más tarde.');
    }
  }
});


//comando para desloguear
bot.onText(/\/logout/, (msg) => {
  const chatId = msg.chat.id;

  if (userSessions[chatId]) {
    delete userSessions[chatId];
    bot.sendMessage(chatId, 'Has cerrado sesión exitosamente. ¡Hasta luego!');
  } else {
    bot.sendMessage(chatId, 'No hay una sesión activa para cerrar.');
  }
});

// Actualizar la función addToCart para usar el token
const addToCart = async (chatId, menuId, quantity) => {
  const session = userSessions[chatId];
  if (!session) {
    bot.sendMessage(chatId, "Por favor, inicia sesión primero.");
    return;
  }

  try {
    const payload = {
      usuarioId: parseInt(session.id, 10),
      menuId: parseInt(menuId, 10),
      cantidad: parseInt(quantity, 10),
    };

    const response = await axios.post(`http://${url_Backend}:8080/carrito/agregar`, payload, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      bot.sendMessage(chatId, `Platillo agregado al carrito con éxito.`);
    } else {
      bot.sendMessage(chatId, 'No se pudo agregar el item al carrito.');
    }
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al intentar agregar el item al carrito.');
  }
};

// Mostrar el menú con botones
bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  try {
    // Obtener el menú desde el backend con el token de autorización
    const response = await axios.get(`http://${url_Backend}:8080/menu`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });
    const menuItems = response.data;

    // Crear una lista de botones con los elementos del menú
    const buttons = menuItems.map((item) => [
      {
        text: `${item.nombre} - $${item.precio}`,
        callback_data: `select_${item.id}`,
      },
    ]);

    // Enviar el menú con botones
    bot.sendMessage(chatId, 'Menú disponible:', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } catch (error) {
    console.error('Error al obtener el menú:', error);
    bot.sendMessage(chatId, 'Error al obtener el menú.');
  }
});

bot.onText(/\/carrito/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  try {
    const carritoResponse = await axios.get(`http://${url_Backend}:8080/carrito/${session.id}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });

    const carrito = carritoResponse.data;

    if (carrito.items.length === 0) {
      bot.sendMessage(chatId, 'Tu carrito está vacío.');
      return;
    }

    // Inicializar el total a pagar
    let total = 0;
    
    // Construir un mensaje con los detalles del carrito
    let mensajeCarrito = '🛒 *Tu Carrito:*\n\n';
    const buttons = [];

    carrito.items.forEach((item, index) => {
      mensajeCarrito += `${index + 1}. *${item.menu.nombre}*\n   Cantidad: ${item.cantidad}\n   Precio: $${item.menu.precio}\n\n`;

      // Sumar el precio del ítem al total
      total += item.menu.precio * item.cantidad;

      // Crear el botón para eliminar el ítem
      buttons.push([{
        text: `Eliminar ${item.menu.nombre}`,
        callback_data: `eliminar_${item.id}`,  // Aquí pasamos el item ID para eliminarlo
      }]);
    });

    // Mostrar el total a pagar
    mensajeCarrito += `\n*Total a pagar:* $${total.toFixed(2)}`;

    // Enviar el mensaje del carrito con los botones para eliminar
    bot.sendMessage(chatId, mensajeCarrito, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    });

  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al obtener tu carrito. Intenta nuevamente más tarde.');
  }
});

// Manejador de callback para eliminar ítems del carrito
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const session = userSessions[chatId];
  const data = query.data.split('_');
  const action = data[0];
  const itemId = data[1];

  if (action === 'select') {
    try {
      const menuResponse = await axios.get(`http://${url_Backend}:8080/menu`, {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const menuItem = menuResponse.data.find(item => item.id == itemId);

      if (!menuItem) {
        bot.sendMessage(chatId, 'No se encontró el menú seleccionado. Por favor, intenta nuevamente.');
        return;
      }

      // Guardar la selección pendiente para este chat
      pendingSelections[chatId] = { menuId: itemId, menuName: menuItem.nombre };

      bot.sendMessage(chatId, `Has seleccionado *${menuItem.nombre}*. Por favor, ingresa la cantidad que deseas agregar:`, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error al obtener el menú seleccionado:', error.message);
      bot.sendMessage(chatId, 'Ocurrió un error al obtener los detalles del menú seleccionado.');
    }
  } else if (action === 'eliminar') {
    try {
      const carritoId = session.carritoId;
      const response = await axios.delete(`http://${url_Backend}:8080/carrito/eliminar/${carritoId}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status >= 200 && response.status < 300) {
        bot.sendMessage(chatId, '¡El producto ha sido eliminado del carrito!');
        bot.emit('text', { chat: { id: chatId }, text: '/carrito' });
      } else {
        bot.sendMessage(chatId, 'Ocurrió un error al eliminar el producto. Intenta nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error.message);
      bot.sendMessage(chatId, 'Ocurrió un error al eliminar el producto. Intenta nuevamente más tarde.');
    }
  }
});


bot.onText(/\/pagar/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  try {
    const response = await axios.put(`http://${url_Backend}:8080/carrito/pagar/${session.carritoId}`, 
      { metodoPago: 'Efectivo' },
      {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Verificar si la respuesta del backend es exitosa
    if (response.status === 200) {
      bot.sendMessage(chatId, '¡Pago procesado con éxito! Tu carrito ha sido vaciado.');
    } else {
      throw new Error('Respuesta inesperada del servidor');
    }

  } catch (error) {
    console.error('Error al procesar el pago:', error);
  }
});

bot.onText(/\/historialVentas (diario|semanal|mensual|anual)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  const rango = match[1]; // Rango elegido: diario, semanal, mensual, anual

  if (!session || !session.isAdmin) {
    bot.sendMessage(chatId, 'No tienes permisos para acceder al historial de ventas.');
    return;
  }

  // Función para calcular el total de una venta
  const calcularTotalVenta = (detalles) => {
    return detalles.reduce((total, detalle) => {
      // Si tienes la cantidad de cada item, la puedes usar
      return total + (detalle.precio);
    }, 0);
  };

  try {
    // Obtener las ventas del rango seleccionado para el usuario
    const response = await axios.get(`http://${url_Backend}:8080/historial/ventas?userId=${session.id}&rango=${rango}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });

    // Verificar si la respuesta es exitosa
    if (response.status === 200) {
      const ventas = response.data.historial;

      // Ordenar las ventas por fecha (descendente)
      const ventasOrdenadas = ventas.sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra));

      // Calcular el total de todas las ventas
      const totalVentas = ventas.reduce((total, venta) => total + calcularTotalVenta(venta.detalles), 0);

      // Formatear la respuesta para mostrar las ventas de forma legible
      let message = `Historial de ventas (${rango}):\n\n`;
      ventasOrdenadas.forEach(venta => {
        const totalVenta = calcularTotalVenta(venta.detalles);
        message += `Fecha: ${new Date(venta.fechaCompra).toLocaleString()}\nTotal: $${totalVenta.toFixed(2)}\n`;
        message += `Detalles:\n`;
        venta.detalles.forEach(detalle => {
          message += `  - ${detalle.nombreMenu} x${detalle.cantidad} = $${(detalle.precio).toFixed(2)}\n`;
        });
        message += `\n`; // Separar ventas
      });

      // Incluir el total de las ventas
      message += `Total de las ventas: $${totalVentas.toFixed(2)}\n`;

      if (ventasOrdenadas.length === 0) {
        message = `No se encontraron ventas en el rango ${rango}.`;
      }

      bot.sendMessage(chatId, message);
    } else {
      bot.sendMessage(chatId, 'No se pudo obtener el historial de ventas. Intenta más tarde.');
    }
  } catch (error) {
    console.error('Error al obtener el historial de ventas:', error);
    bot.sendMessage(chatId, 'Hubo un error al intentar obtener el historial de ventas.');
  }
});


// Comando /historia-pedidos
bot.onText(/\/historial-pedidos/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session) {
    bot.sendMessage(chatId, 'No has iniciado sesión. Usa el comando /login <usuario> <contraseña> para acceder.');
    return;
  }

  try {
    // Hacer la solicitud al backend para obtener el historial de pedidos
    const response = await axios.get(`http://${url_Backend}:8080/historial/${session.id}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Verifica si hay pedidos
    if (response.data.length === 0) {
      bot.sendMessage(chatId, 'No tienes pedidos en tu historial.');
      return;
    }

    // Ordenar los pedidos por fecha
    const pedidosOrdenados = response.data.sort(
      (a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)
    );

    // Enviar el historial de pedidos al usuario
    let mensaje = 'Historial de tus pedidos:\n\n';
    pedidosOrdenados.forEach((pedido, index) => {
      mensaje += `Pedido #${index + 1} - Estado: ${pedido.estadoCompra} - Fecha: ${pedido.fechaCompra}\n`;
      mensaje += `Total: $${calcularTotal(pedido.detalles)}\n\n`;
    });

    bot.sendMessage(chatId, mensaje);
  } catch (error) {
    console.error('Error al obtener el historial de pedidos:', error);
    bot.sendMessage(chatId, 'Hubo un error al obtener el historial de tus pedidos. Inténtalo más tarde.');
  }
});


// Función para calcular el total de un pedido
const calcularTotal = (detalles) => {
  return detalles
    .reduce((total, detalle) => total + detalle.precio * detalle.cantidad, 0)
    .toFixed(2);
};

const checkNotifications = async () => {
  for (const chatId in userSessions) {
    const session = userSessions[chatId];
    const userId = session.id;
    const isAdmin = session.isAdmin;

    try {
      const url = isAdmin 
        ? `http://${url_Backend}:8080/notificaciones/administrador/${userId}`
        : `http://${url_Backend}:8080/notificaciones/usuario/${userId}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });
      const allNotifications = response.data;

      if (allNotifications.length > 0) {
        // Ordenar notificaciones por fecha (las más recientes primero)
        const sortedNotifications = allNotifications.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Obtener la notificación más reciente
        const latestNotification = sortedNotifications[0];

        // Verificar si es una nueva notificación (comparando con la última enviada)
        const lastNotificationId = session.lastNotificationId || null; // Inicialmente no hay ID
        if (latestNotification.id !== lastNotificationId) {
          // Actualizar el último ID de notificación en la sesión
          userSessions[chatId].lastNotificationId = latestNotification.id;

          // Crear mensaje para enviar las nuevas notificaciones
          const message = `Nueva notificación:\n\n${latestNotification.mensaje}\nFecha: ${new Date(latestNotification.fecha).toLocaleString()}`;
          bot.sendMessage(chatId, message);
        }
      }
    } catch (error) {
      console.error(`Error al obtener notificaciones para chatId ${chatId}:`, error);
    }
  }
};

// Configurar el polling cada 10 segundos
setInterval(checkNotifications, 10000);

// Escuchar la respuesta con la cantidad y agregar al carrito
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (pendingSelections[chatId]) {
    const { menuId, menuName } = pendingSelections[chatId];
    const quantity = parseInt(msg.text, 10);

    if (isNaN(quantity) || quantity <= 0) {
      bot.sendMessage(chatId, 'Cantidad inválida. Intenta nuevamente.');
      return;
    }

    try {
      // Llamar a la función para agregar al carrito
      const userId = userSessions[chatId]?.id;
      const payload = {
        usuarioId: parseInt(userId, 10),
        menuId: parseInt(menuId, 10),
        cantidad: parseInt(quantity, 10),
      };

      const response = await axios.post(`http://${url_Backend}:8080/carrito/agregar`, payload, {
        headers: {
          'Authorization': `Bearer ${userSessions[chatId]?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        bot.sendMessage(chatId, `¡${menuName} ha sido agregado al carrito con éxito!`);
      } else {
        bot.sendMessage(chatId, 'No se pudo agregar el item al carrito.');
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error.message);
      bot.sendMessage(chatId, 'Ocurrió un error al intentar agregar el item al carrito.');
    }

    // Limpiar la selección pendiente
    delete pendingSelections[chatId];
  }
});

// Comando para mostrar la lista de comandos disponibles
bot.onText(/\/comandos/, (msg) => {
  const chatId = msg.chat.id;

  const comandos = `
📜 *Lista de Comandos Disponibles:*
  
1. *\/login <usuario> <contraseña>*  
   Inicia sesión en el sistema.

2. *\/logout*  
   Cierra tu sesión actual.

3. *\/menu*  
   Muestra el menú disponible con los platillos y precios.

4. *\/carrito*  
   Muestra los artículos en tu carrito de compras.

5. *\/pagar*  
   Procesa el pago de tu carrito y lo vacía.

6. *\/historial-pedidos*  
   Muestra los pedidos que has realizado anteriormente.

7. *\/comandos*  
   Muestra esta lista de comandos.

1. *\/historialVentas diario|semanal|mensual|anual*  
   Comando si eres administrador.

🛠 Si tienes dudas, no dudes en usar este comando nuevamente.
  `;

  bot.sendMessage(chatId, comandos, { parse_mode: 'Markdown' });
});