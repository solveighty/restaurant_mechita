const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');


const url_Backend = 'localhost';

// Crear el cliente de WhatsApp con opciones específicas
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth()
});

// Estado para almacenar datos de sesión temporal
const userSessions = {};
const pendingSelections = {};

// Evento cuando el cliente está listo
client.on('ready', () => {
    console.log('Cliente WhatsApp listo!');
});

// Evento para mostrar el código QR
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Manejador de mensajes
client.on('message', async msg => {
    const chatId = msg.from;
    const messageBody = msg.body;

    // Verificar si el mensaje viene de un grupo y si es un comando
    if (msg.from.includes('g.us') && messageBody.startsWith('/')) {
        client.sendMessage(chatId, 'Este bot solo funciona en chats privados. Por favor, escríbeme directamente.');
        return;
    }

    // Comando login
    if (messageBody.startsWith('/login ')) {
        const credentials = messageBody.slice(7).split(' ');

        if (credentials.length !== 2) {
            client.sendMessage(chatId, 'Formato incorrecto. Debes usar: /login <usuario> <contraseña>');
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

            const user = usersResponse.data.find(u => u.usuario === username);

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar si el usuario es admin
            const isAdminResponse = await axios.get(`http://${url_Backend}:8080/usuarios/${user.id}/esAdmin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const isAdmin = isAdminResponse.data;

            // Guardar sesión
            userSessions[chatId] = {
                username,
                token,
                carritoId: user.carrito.id,
                isAdmin,
                ...user
            };

            // Obtener el carrito
            await axios.get(`http://${url_Backend}:8080/carrito/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            client.sendMessage(chatId, `¡Hola, ${username}! Te has logueado exitosamente. Usa el comando /comandos para ver lo que puedes hacer.`);

        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.status === 401) {
                client.sendMessage(chatId, 'Credenciales incorrectas. Inténtalo de nuevo.');
            } else {
                client.sendMessage(chatId, 'Error al iniciar sesión. Por favor, intenta más tarde.');
            }
        }
    }

    // Comando logout
    else if (messageBody === '/logout') {
        if (userSessions[chatId]) {
            delete userSessions[chatId];
            client.sendMessage(chatId, 'Has cerrado sesión exitosamente. ¡Hasta luego!');
        } else {
            client.sendMessage(chatId, 'No hay una sesión activa para cerrar.');
        }
    }

    // Comando menu
    else if (messageBody === '/menu') {
        const session = userSessions[chatId];

        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
            return;
        }

        try {
            const response = await axios.get(`http://${url_Backend}:8080/menu`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                }
            });
            const menuItems = response.data;

            let menuMessage = '*Menú disponible:*\n\n';
            menuItems.forEach((item, index) => {
                menuMessage += `${index + 1}. *${item.nombre}* - $${item.precio}\n`;
                menuMessage += `   Para ordenar, envía: /ordenar ${index + 1} <cantidad>\n\n`;
            });

            client.sendMessage(chatId, menuMessage);
        } catch (error) {
            console.error('Error al obtener el menú:', error);
            client.sendMessage(chatId, 'Error al obtener el menú.');
        }
    }

    // Comando carrito
    else if (messageBody === '/carrito') {
        const session = userSessions[chatId];

        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
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
                client.sendMessage(chatId, 'Tu carrito está vacío.');
                return;
            }

            let total = 0;
            let mensajeCarrito = '🛒 *Tu Carrito:*\n\n';

            carrito.items.forEach((item, index) => {
                mensajeCarrito += `${index + 1}. *${item.menu.nombre}*\n`;
                mensajeCarrito += `   Cantidad: ${item.cantidad}\n`;
                mensajeCarrito += `   Precio: $${item.menu.precio}\n`;
                mensajeCarrito += `   Para eliminar, envía: /eliminar ${item.id}\n\n`;

                total += item.menu.precio * item.cantidad;
            });

            mensajeCarrito += `\n*Total a pagar:* $${total.toFixed(2)}`;
            client.sendMessage(chatId, mensajeCarrito);

        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            client.sendMessage(chatId, 'Ocurrió un error al obtener tu carrito. Intenta nuevamente más tarde.');
        }
    }

    // Comando ordenar
    else if (messageBody.startsWith('/ordenar ')) {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
            return;
        }

        const args = messageBody.slice(9).split(' ');
        if (args.length !== 2) {
            client.sendMessage(chatId, 'Formato incorrecto. Usa: /ordenar <número_menu> <cantidad>');
            return;
        }

        const menuIndex = parseInt(args[0]) - 1;
        const quantity = parseInt(args[1]);

        try {
            const menuResponse = await axios.get(`http://${url_Backend}:8080/menu`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const menuItems = menuResponse.data;
            if (!menuItems[menuIndex]) {
                client.sendMessage(chatId, 'Número de menú inválido.');
                return;
            }

            const menuId = menuItems[menuIndex].id;
            const payload = {
                usuarioId: parseInt(session.id, 10),
                menuId: parseInt(menuId, 10),
                cantidad: quantity
            };

            await axios.post(`http://${url_Backend}:8080/carrito/agregar`, payload, {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                }
            });

            client.sendMessage(chatId, `¡${menuItems[menuIndex].nombre} ha sido agregado al carrito con éxito!`);
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            client.sendMessage(chatId, 'Ocurrió un error al agregar el item al carrito.');
        }
    }

    // Comando eliminar del carrito
    else if (messageBody.startsWith('/eliminar ')) {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero.');
            return;
        }

        const itemId = messageBody.slice(10);
        try {
            await axios.delete(`http://${url_Backend}:8080/carrito/eliminar/${session.carritoId}/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                }
            });

            client.sendMessage(chatId, 'Producto eliminado del carrito. Usa /carrito para ver tu carrito actualizado.');
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            client.sendMessage(chatId, 'Ocurrió un error al eliminar el producto del carrito.');
        }
    }

    // Comando pagar
    else if (messageBody === '/pagar') {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero.');
            return;
        }

        try {
            // Obtener direcciones
            const direccionPrincipalResponse = await axios.get(
                `http://${url_Backend}:8080/usuarios/obtenerusuario/${session.id}`,
                {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                }
            );

            const direccionesTemporalesResponse = await axios.get(
                `http://${url_Backend}:8080/usuarios/${session.id}/direcciones`,
                {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                }
            );

            const direccionPrincipal = direccionPrincipalResponse.data.direccion;
            const direccionesTemporales = direccionesTemporalesResponse.data;

            let mensaje = '*Selecciona una dirección de envío:*\n\n';
            mensaje += `0. Dirección Principal: ${direccionPrincipal}\n`;
            direccionesTemporales.forEach((dir, index) => {
                mensaje += `${index + 1}. ${dir}\n`;
            });
            mensaje += '\nPara seleccionar, envía: /seleccionar_direccion <número>';

            session.pagoEnProceso = { paso: 'seleccion_direccion' };
            client.sendMessage(chatId, mensaje);

        } catch (error) {
            console.error('Error al procesar el pago:', error);
            client.sendMessage(chatId, 'Ocurrió un error al procesar el pago.');
        }
    }

    // Comando seleccionar dirección
    else if (messageBody.startsWith('/seleccionar_direccion ')) {
        const session = userSessions[chatId];
        if (!session || !session.pagoEnProceso || session.pagoEnProceso.paso !== 'seleccion_direccion') {
            client.sendMessage(chatId, 'Por favor, inicia el proceso de pago con /pagar');
            return;
        }

        const numeroSeleccion = parseInt(messageBody.split(' ')[1]);


        try {
            // Obtener direcciones
            const direccionPrincipalResponse = await axios.get(
                `http://${url_Backend}:8080/usuarios/obtenerusuario/${session.id}`,
                {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                }
            );

            const direccionesTemporalesResponse = await axios.get(
                `http://${url_Backend}:8080/usuarios/${session.id}/direcciones`,
                {
                    headers: { 'Authorization': `Bearer ${session.token}` }
                }
            );

            const direccionPrincipal = direccionPrincipalResponse.data.direccion;
            const direccionesTemporales = direccionesTemporalesResponse.data;



            let direccionSeleccionada = null;

            // Validación mejorada para múltiples direcciones
            if (!isNaN(numeroSeleccion)) {
                if (numeroSeleccion === 0) {
                    direccionSeleccionada = direccionPrincipal;
                } else if (numeroSeleccion > 0 && numeroSeleccion <= direccionesTemporales.length) {
                    direccionSeleccionada = direccionesTemporales[numeroSeleccion - 1];
                }
            }

            if (!direccionSeleccionada) {
                client.sendMessage(chatId, 
                    `Número de dirección inválido. Por favor, selecciona un número válido de la lista (0 a ${direccionesTemporales.length}).`
                );
                return;
            }

            // Guardar la dirección seleccionada
            session.pagoEnProceso.direccionEnvio = direccionSeleccionada;
            session.pagoEnProceso.paso = 'seleccion_pago';

            const mensaje = '*Selecciona el método de pago:*\n\n' +
                '1. Efectivo\n' +
                '2. Tarjeta\n\n' +
                'Para seleccionar, envía: /seleccionar_pago <número>';

            client.sendMessage(chatId, mensaje);

        } catch (error) {
            console.error('Error completo al seleccionar dirección:', error);
            client.sendMessage(chatId, 'Ocurrió un error al seleccionar la dirección.');
        }
    }

    // Comando seleccionar método de pago
    else if (messageBody.startsWith('/seleccionar_pago ')) {
        const session = userSessions[chatId];
        if (!session || !session.pagoEnProceso || session.pagoEnProceso.paso !== 'seleccion_pago') {
            client.sendMessage(chatId, 'Por favor, selecciona primero una dirección de envío.');
            return;
        }

        const metodoPago = messageBody.slice(17) === '1' ? 'Efectivo' : 'Tarjeta';
        
        try {
            const response = await axios.put(
                `http://${url_Backend}:8080/carrito/pagar/${session.carritoId}`,
                {
                    metodoPago: metodoPago,
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
                client.sendMessage(chatId, '¡Pago procesado con éxito! Tu pedido será enviado a la dirección seleccionada.');
                delete session.pagoEnProceso;
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            client.sendMessage(chatId, 'Ocurrió un error al procesar el pago.');
        }
    }

    // Comando historial de pedidos
    else if (messageBody === '/historial-pedidos') {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'No has iniciado sesión. Usa el comando /login <usuario> <contraseña> para acceder.');
            return;
        }

        try {
            const response = await axios.get(`http://${url_Backend}:8080/historial/${session.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.length === 0) {
                client.sendMessage(chatId, 'No tienes pedidos en tu historial.');
                return;
            }

            const pedidosOrdenados = response.data.sort(
                (a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)
            );

            let mensaje = 'Historial de tus pedidos:\n\n';
            pedidosOrdenados.forEach((pedido, index) => {
                mensaje += `Pedido #${index + 1} - Estado: ${pedido.estadoCompra} - Fecha: ${pedido.fechaCompra}\n`;
                mensaje += `Total: $${calcularTotal(pedido.detalles)}\n\n`;
            });

            client.sendMessage(chatId, mensaje);
        } catch (error) {
            console.error('Error al obtener el historial de pedidos:', error);
            client.sendMessage(chatId, 'Hubo un error al obtener el historial de tus pedidos. Inténtalo más tarde.');
        }
    }

    // Comando agregar dirección temporal
    else if (messageBody.startsWith('/agregarDireccion ')) {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
            return;
        }

        const nuevaDireccion = messageBody.slice(17);
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

            client.sendMessage(chatId, '¡Dirección temporal agregada con éxito!');
        } catch (error) {
            console.error('Error al agregar dirección temporal:', error);
            client.sendMessage(chatId, 'Ocurrió un error al agregar la dirección temporal.');
        }
    }

    // Comando ver direcciones
    else if (messageBody === '/verDirecciones') {
        const session = userSessions[chatId];

        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero con el comando /login.');
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
                    mensaje += `   Para eliminar esta dirección, envía: /eliminar_direccion ${dir}\n\n`;
                });
                mensaje += '\nPara eliminar todas las direcciones temporales, envía: /eliminar_todas_direcciones';
            } else {
                mensaje += '*No tienes direcciones temporales registradas.*\n';
                mensaje += 'Usa /agregarDireccion <dirección> para agregar una nueva.';
            }

            client.sendMessage(chatId, mensaje);
        } catch (error) {
            console.error('Error al obtener direcciones:', error);
            client.sendMessage(chatId, 'Ocurrió un error al obtener las direcciones.');
        }
    }

    // Comando eliminar dirección temporal
    else if (messageBody.startsWith('/eliminar_direccion ')) {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero.');
            return;
        }

        const direccion = messageBody.slice(19);
        try {
            await axios.delete(
                `http://${url_Backend}:8080/usuarios/${session.id}/direccion-temporal`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                        'Content-Type': 'text/plain'
                    },
                    data: direccion
                }
            );
            
            client.sendMessage(chatId, '¡Dirección temporal eliminada con éxito!');
        } catch (error) {
            console.error('Error al eliminar dirección temporal:', error);
            client.sendMessage(chatId, 'Ocurrió un error al eliminar la dirección temporal.');
        }
    }

    // Comando eliminar todas las direcciones temporales
    else if (messageBody === '/eliminar_todas_direcciones') {
        const session = userSessions[chatId];
        if (!session) {
            client.sendMessage(chatId, 'Por favor, inicia sesión primero.');
            return;
        }

        try {
            await axios.delete(
                `http://${url_Backend}:8080/usuarios/${session.id}/direcciones-temporales`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.token}`
                    }
                }
            );
            
            client.sendMessage(chatId, '¡Todas las direcciones temporales han sido eliminadas!');
        } catch (error) {
            console.error('Error al eliminar direcciones temporales:', error);
            client.sendMessage(chatId, 'Ocurrió un error al eliminar las direcciones temporales.');
        }
    }

    // Comando historial de ventas (admin)
    else if (messageBody.match(/^\/historialVentas (diario|semanal|mensual|anual)$/)) {
        const session = userSessions[chatId];
        if (!session || !session.isAdmin) {
            client.sendMessage(chatId, 'No tienes permisos para acceder al historial de ventas.');
            return;
        }

        const rango = messageBody.split(' ')[1];

        try {
            const response = await axios.get(`http://${url_Backend}:8080/historial/ventas?userId=${session.id}&rango=${rango}`, {
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const ventas = response.data.historial;
                const ventasOrdenadas = ventas.sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra));
                const totalVentas = ventas.reduce((total, venta) => total + calcularTotal(venta.detalles), 0);

                let mensaje = `Historial de ventas (${rango}):\n\n`;
                ventasOrdenadas.forEach(venta => {
                    const totalVenta = calcularTotal(venta.detalles);
                    mensaje += `Fecha: ${new Date(venta.fechaCompra).toLocaleString()}\n`;
                    mensaje += `Total: $${totalVenta}\n`;
                    mensaje += `Detalles:\n`;
                    venta.detalles.forEach(detalle => {
                        mensaje += `  - ${detalle.nombreMenu} x${detalle.cantidad} = $${(detalle.precio).toFixed(2)}\n`;
                    });
                    mensaje += `\n`;
                });

                mensaje += `Total de las ventas: $${totalVentas}\n`;
                client.sendMessage(chatId, mensaje);
            }
        } catch (error) {
            console.error('Error al obtener el historial de ventas:', error);
            client.sendMessage(chatId, 'Hubo un error al obtener el historial de ventas.');
        }
    }

    // Comando comandos (ayuda)
    else if (messageBody === '/comandos') {
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
    Comando exclusivo para administradores.

🛠 Si tienes dudas, no dudes en usar este comando nuevamente.
`;
        client.sendMessage(chatId, comandos);
    }
});

// Función auxiliar para calcular el total
const calcularTotal = (detalles) => {
    return detalles
        .reduce((total, detalle) => total + detalle.precio * detalle.cantidad, 0)
        .toFixed(2);
};

// Sistema de notificaciones
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
                const sortedNotifications = allNotifications.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                const latestNotification = sortedNotifications[0];

                const lastNotificationId = session.lastNotificationId || null;
                if (latestNotification.id !== lastNotificationId) {
                    userSessions[chatId].lastNotificationId = latestNotification.id;
                    const message = `Nueva notificación:\n\n${latestNotification.mensaje}\nFecha: ${new Date(latestNotification.fecha).toLocaleString()}`;
                    client.sendMessage(chatId, message);
                }
            }
        } catch (error) {
            console.error(`Error al obtener notificaciones para chatId ${chatId}:`, error);
        }
    }
};

// Configurar el polling de notificaciones cada 10 segundos
setInterval(checkNotifications, 10000);

// Inicializar el cliente
client.initialize();