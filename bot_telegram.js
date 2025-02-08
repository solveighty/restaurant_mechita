const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');
const WebSocket = require('ws');

// Token del bot de Telegram
const token = process.env.BOT_TOKEN;

const url_Backend = 'localhost'

// Crear el bot usando 'polling' para recibir actualizaciones
const bot = new TelegramBot(token, { polling: true });

// Estado para almacenar datos de sesión temporal
const userSessions = {};
const pendingSelections = {};

// Crear servidor WebSocket
const wss = new WebSocket.Server({ port: 8082 }); // Puerto diferente al de WhatsApp
const adminConnections = new Map(); // Para mantener las conexiones de administradores
const activeChats = new Map(); // Mantiene formato: chatId -> { userId, username, messages: [] }

// Comando para loguearse
bot.onText(/\/login (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const credentials = match[1].split(' ');

  if (credentials.length !== 2) {
    bot.sendMessage(chatId, 'Formato incorrecto. Debes usar: /login <usuario> <contraseña>');
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

// Actualizar el manejador de callback para incluir la selección de menú
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const session = userSessions[chatId];
  const data = query.data.split('_');
  const action = data[0];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  if (action === 'select') {
    const menuId = data[1];
    try {
      // Obtener el nombre del platillo seleccionado
      const response = await axios.get(`http://${url_Backend}:8080/menu`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const menuItem = response.data.find(item => item.id.toString() === menuId);
      if (!menuItem) {
        throw new Error('Platillo no encontrado');
      }

      // Guardar la selección pendiente
      pendingSelections[chatId] = {
        menuId: menuId,
        menuName: menuItem.nombre
      };

      // Pedir la cantidad al usuario
      bot.sendMessage(chatId, `Has seleccionado: ${menuItem.nombre}\nPor favor, indica la cantidad que deseas (escribe solo el número):`);
    } catch (error) {
      console.error('Error al seleccionar platillo:', error);
      bot.sendMessage(chatId, 'Ocurrió un error al seleccionar el platillo. Por favor, intenta nuevamente.');
    }
  } else if (action === 'eliminar' && data[1] === 'direccion') {
    const direccion = data.slice(2).join('_');
    try {
      console.log('Intentando eliminar dirección:', direccion);
      console.log('Usuario ID:', session.id);
      
      await axios.delete(
        `http://${url_Backend}:8080/usuarios/${session.id}/direccion-temporal`,
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'text/plain'  // Cambiado a text/plain
          },
          data: direccion  // Enviando la dirección directamente como texto
        }
      );
      
      // Verificar si la dirección fue eliminada
      const verificacionResponse = await axios.get(
        `http://${url_Backend}:8080/usuarios/${session.id}/direcciones`,
        {
          headers: { 'Authorization': `Bearer ${session.token}` }
        }
      );
      
      const direccionesActuales = verificacionResponse.data;
      if (direccionesActuales.includes(direccion)) {
        throw new Error('La dirección no fue eliminada correctamente');
      }
      
      bot.sendMessage(chatId, '¡Dirección temporal eliminada con éxito!');
      // Actualizar la lista de direcciones
      bot.deleteMessage(chatId, query.message.message_id);
      bot.emit('text', { chat: { id: chatId }, text: '/verDirecciones' });
    } catch (error) {
      console.error('Error al eliminar dirección temporal:', error);
      console.error('Detalles de la solicitud:', {
        direccion: direccion,
        userId: session.id,
        error: error.response?.data
      });
      bot.sendMessage(chatId, 'Ocurrió un error al eliminar la dirección temporal. Por favor, intenta nuevamente.');
    }
  } else if (action === 'eliminar' && data[1] === 'todas' && data[2] === 'direcciones') {
    try {
      await axios.delete(
        `http://${url_Backend}:8080/usuarios/${session.id}/direcciones-temporales`,
        {
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        }
      );
      
      bot.sendMessage(chatId, '¡Todas las direcciones temporales han sido eliminadas!');
      // Actualizar la lista de direcciones
      bot.deleteMessage(chatId, query.message.message_id);
      bot.emit('text', { chat: { id: chatId }, text: '/verDirecciones' });
    } catch (error) {
      console.error('Error al eliminar todas las direcciones temporales:', error);
      bot.sendMessage(chatId, 'Ocurrió un error al eliminar las direcciones temporales. Por favor, intenta nuevamente.');
    }
  } else if (action === 'eliminar' && !isNaN(data[1])) {
    // Esta es la lógica original para eliminar items del carrito
    try {
      const carritoId = session.carritoId;
      const itemId = data[1];
      const response = await axios.delete(`http://${url_Backend}:8080/carrito/eliminar/${carritoId}/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status >= 200 && response.status < 300) {
        // Obtener el carrito actualizado
        const carritoResponse = await axios.get(`http://${url_Backend}:8080/carrito/${session.id}`, {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        });

        const carrito = carritoResponse.data;

        if (carrito.items.length === 0) {
          bot.sendMessage(chatId, 'El producto ha sido eliminado. Tu carrito está vacío.');
          return;
        }

        let total = 0;
        let mensajeCarrito = '🛒 *Tu Carrito Actualizado:*\n\n';
        const buttons = [];

        carrito.items.forEach((item, index) => {
          mensajeCarrito += `${index + 1}. *${item.menu.nombre}*\n   Cantidad: ${item.cantidad}\n   Precio: $${item.menu.precio}\n\n`;
          total += item.menu.precio * item.cantidad;
          buttons.push([{
            text: `Eliminar ${item.menu.nombre}`,
            callback_data: `eliminar_${item.id}`,
          }]);
        });

        mensajeCarrito += `\n*Total a pagar:* $${total.toFixed(2)}`;

        bot.sendMessage(chatId, mensajeCarrito, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: buttons
          }
        });
      } else {
        bot.sendMessage(chatId, 'Ocurrió un error al eliminar el producto. Intenta nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error);
      bot.sendMessage(chatId, 'Ocurrió un error al eliminar el producto del carrito. Por favor, intenta nuevamente.');
    }
  } else if (action === 'dir') {
    const tipoDir = data[1];
    const direccion = data.slice(2).join('_');
    
    // Guardar la dirección seleccionada
    session.pagoEnProceso = {
      ...session.pagoEnProceso,
      direccionEnvio: direccion,
      paso: 'seleccion_pago'
    };

    // Mostrar opciones de pago
    const botonesMetodoPago = [
      [{ text: 'Efectivo', callback_data: 'pago_efectivo' }],
      [{ text: 'Tarjeta', callback_data: 'pago_tarjeta' }]
    ];

    bot.sendMessage(chatId, 'Por favor, selecciona el método de pago:', {
      reply_markup: {
        inline_keyboard: botonesMetodoPago
      }
    });
  } else if (action === 'pago') {
    const metodoPago = data[1];
    
    try {
      const response = await axios.put(
        `http://${url_Backend}:8080/carrito/pagar/${session.carritoId}`,
        {
          metodoPago: metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta',
          direccionEnvio: session.pagoEnProceso.direccionEnvio
        },
        {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        bot.sendMessage(chatId, '¡Pago procesado con éxito! Tu pedido será enviado a la dirección seleccionada.');
        // Limpiar el estado del proceso de pago
        delete session.pagoEnProceso;
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      bot.sendMessage(chatId, 'Ocurrió un error al procesar el pago. Por favor, intenta más tarde.');
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
    // Obtener dirección principal
    const direccionPrincipalResponse = await axios.get(
      `http://${url_Backend}:8080/usuarios/obtenerusuario/${session.id}`,
      {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }
    );

    // Obtener direcciones temporales
    const direccionesTemporalesResponse = await axios.get(
      `http://${url_Backend}:8080/usuarios/${session.id}/direcciones`,
      {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }
    );

    const direccionPrincipal = direccionPrincipalResponse.data.direccion;
    const direccionesTemporales = direccionesTemporalesResponse.data;

    // Crear botones para selección de dirección
    const buttons = [
      [{ text: `Dirección Principal: ${direccionPrincipal}`, callback_data: `dir_principal_${direccionPrincipal}` }]
    ];

    direccionesTemporales.forEach(dir => {
      buttons.push([{ text: `Dirección Temporal: ${dir}`, callback_data: `dir_temporal_${dir}` }]);
    });

    // Guardar estado temporal para el proceso de pago
    session.pagoEnProceso = { paso: 'seleccion_direccion' };

    bot.sendMessage(chatId, 'Por favor, selecciona la dirección de envío:', {
      reply_markup: {
        inline_keyboard: buttons
      }
    });

  } catch (error) {
    console.error('Error al procesar el pago:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al procesar el pago. Por favor, intenta más tarde.');
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

// Comando para agregar dirección temporal
bot.onText(/\/agregarDireccion (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  const nuevaDireccion = match[1];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  try {
    await axios.post(
      `http://${url_Backend}:8080/usuarios/${session.id}/direccion-temporal`,
      nuevaDireccion,
      {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'text/plain'
        }
      }
    );

    bot.sendMessage(chatId, '¡Dirección temporal agregada con éxito!');
  } catch (error) {
    console.error('Error al agregar dirección temporal:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al agregar la dirección temporal.');
  }
});

// Comando para ver direcciones temporales
bot.onText(/\/verDirecciones/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  try {
    // Obtener dirección principal
    const direccionPrincipalResponse = await axios.get(
      `http://${url_Backend}:8080/usuarios/obtenerusuario/${session.id}`,
      {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }
    );

    // Obtener direcciones temporales
    const direccionesTemporalesResponse = await axios.get(
      `http://${url_Backend}:8080/usuarios/${session.id}/direcciones`,
      {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }
    );

    const direccionPrincipal = direccionPrincipalResponse.data.direccion;
    const direccionesTemporales = direccionesTemporalesResponse.data;

    let mensaje = '*Tus direcciones:*\n\n';
    mensaje += `📍 *Dirección Principal:*\n${direccionPrincipal}\n\n`;
    
    if (direccionesTemporales.length > 0) {
      mensaje += '*Direcciones Temporales:*\n';
      direccionesTemporales.forEach((dir, index) => {
        mensaje += `${index + 1}. ${dir}\n`;
      });

      // Crear botones para eliminar direcciones
      const buttons = direccionesTemporales.map((dir, index) => [{
        text: `🗑️ Eliminar: ${dir}`,
        callback_data: `eliminar_direccion_${dir}`
      }]);

      // Agregar botón para eliminar todas
      if (direccionesTemporales.length > 1) {
        buttons.push([{
          text: '🗑️ Eliminar todas las direcciones temporales',
          callback_data: 'eliminar_todas_direcciones'
        }]);
      }

      bot.sendMessage(chatId, mensaje, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttons
        }
      });
    } else {
      mensaje += '*No tienes direcciones temporales registradas.*\n';
      mensaje += 'Usa /agregarDireccion <dirección> para agregar una nueva.';
      bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al obtener las direcciones.');
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

7. *\/agregarDireccion <dirección>*
   Agrega una nueva dirección temporal.

8. *\/verDirecciones*
   Muestra todas tus direcciones y permite eliminarlas.

9. *\/comandos*  
   Muestra esta lista de comandos.

10. *\/historialVentas diario|semanal|mensual|anual*  
    Comando si eres administrador.

🛠 Si tienes dudas, no dudes en usar este comando nuevamente.
  `;

  bot.sendMessage(chatId, comandos, { parse_mode: 'Markdown' });
});

// Agregar los nuevos comandos de chat
bot.onText(/\/chat/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session) {
    bot.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
    return;
  }

  // Verificar si ya tiene un chat activo
  if (activeChats.has(chatId)) {
    bot.sendMessage(chatId, 'Ya tienes un chat activo. Usa /endchat para finalizar el chat actual antes de iniciar uno nuevo.');
    return;
  }

  session.chatActive = true;
  activeChats.set(chatId, {
    userId: session.id,
    username: session.username,
    messages: []
  });

  bot.sendMessage(chatId, 'Has iniciado un chat con el administrador. Todos tus mensajes serán enviados al administrador. Usa /endchat para finalizar.');
  
  // Notificar a todos los admins conectados
  for (const [, ws] of adminConnections) {
    ws.send(JSON.stringify({
      type: 'new_chat',
      userId: chatId,
      username: session.username,
      message: 'Usuario ha iniciado un chat',
      actualUserId: session.id,
      platform: 'telegram'
    }));
  }
});

bot.onText(/\/endchat/, (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session || !activeChats.has(chatId)) {
    bot.sendMessage(chatId, 'No tienes un chat activo para finalizar.');
    return;
  }

  session.chatActive = false;
  
  // Notificar a los admins
  for (const [, ws] of adminConnections) {
    ws.send(JSON.stringify({
      type: 'end_chat',
      userId: chatId,
      username: session.username,
      actualUserId: session.id,
      platform: 'telegram'
    }));
  }
  
  activeChats.delete(chatId);
  bot.sendMessage(chatId, 'Has finalizado el chat con el administrador.');
});

// Modificar el manejador de mensajes existente para incluir el chat
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  
  // Si hay un chat activo y no es un comando
  if (session?.chatActive && !msg.text?.startsWith('/')) {
    const chatData = activeChats.get(chatId);
    if (chatData) {
      // Guardar el mensaje en el historial
      chatData.messages.push({
        sender: 'user',
        message: msg.text,
        timestamp: new Date().toISOString()
      });

      // Enviar mensaje a los admins
      for (const [, ws] of adminConnections) {
        ws.send(JSON.stringify({
          type: 'chat_message',
          userId: chatId,
          username: session.username,
          message: msg.text,
          actualUserId: session.id,
          platform: 'telegram'
        }));
      }
    }
    return;
  }
  
  // ... resto del código existente de manejo de mensajes ...
});

// Agregar el manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'admin_register') {
        adminConnections.set(data.adminId, ws);
        ws.adminId = data.adminId;
        
        // Enviar lista de chats activos al nuevo admin
        const activeChatsArray = Array.from(activeChats.entries()).map(([chatId, chatData]) => ({
          userId: chatId,
          username: chatData.username,
          actualUserId: chatData.userId,
          messages: chatData.messages,
          platform: 'telegram'
        }));
        
        ws.send(JSON.stringify({
          type: 'active_chats',
          chats: activeChatsArray
        }));
        return;
      }
      
      if (data.type === 'chat_message') {
        const { userId, message: textMessage } = data;
        const chatData = activeChats.get(userId);
        
        if (userSessions[userId] && chatData) {
          // Guardar mensaje del admin
          chatData.messages.push({
            sender: 'admin',
            message: textMessage,
            timestamp: new Date().toISOString()
          });
          
          bot.sendMessage(userId, `Admin: ${textMessage}`);
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    if (ws.adminId) {
      adminConnections.delete(ws.adminId);
    }
  });
});

