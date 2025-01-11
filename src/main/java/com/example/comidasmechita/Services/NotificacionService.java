package com.example.comidasmechita.Services;

import com.example.comidasmechita.Entity.NotificacionEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import com.example.comidasmechita.Repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionService {
    @Autowired
    private NotificacionRepository notificacionRepository;

    // Notificar al administrador cuando se realice una compra
    public void notificarAdministrador(UsuarioEntity usuario, String mensaje) {
        if (usuario.getRol() != UsuarioEntity.Rol.ADMIN) {
            throw new RuntimeException("El usuario no es un administrador.");
        }
        NotificacionEntity notificacion = new NotificacionEntity();
        notificacion.setUsuario(usuario);
        notificacion.setMensaje(mensaje);
        notificacion.setTipoNotificacion(NotificacionEntity.TipoNotificacion.ADMINISTRADOR);
        notificacionRepository.save(notificacion);
    }

    // Notificar al usuario cuando su pedido cambie de estado
    public void notificarUsuario(UsuarioEntity usuario, String mensaje) {
        NotificacionEntity notificacion = new NotificacionEntity();
        notificacion.setUsuario(usuario);  // El usuario recibe la notificación
        notificacion.setMensaje(mensaje);
        notificacion.setTipoNotificacion(NotificacionEntity.TipoNotificacion.USUARIO);  // Usamos el enum
        notificacionRepository.save(notificacion);
    }

    // Obtener las notificaciones no leídas de un usuario
    public List<NotificacionEntity> obtenerNotificacionesNoLeidas(Long usuarioId) {
        UsuarioEntity usuario = new UsuarioEntity();  // Obtén el usuario de la base de datos según el usuarioId
        usuario.setId(usuarioId); // Este es solo un ejemplo, debes buscar el usuario real
        return notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
    }

    // Marcar una notificación como leída
    public void marcarNotificacionLeida(Long notificacionId) {
        NotificacionEntity notificacion = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notificacion.setLeida(true);  // Cambiar el estado de leída
        notificacionRepository.save(notificacion);  // Guardar los cambios
    }
}
