package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.HistorialCompraEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import com.example.comidasmechita.Repository.NotificacionRepository;
import com.example.comidasmechita.Repository.UsuarioRepository;
import com.example.comidasmechita.Services.HistorialCompraService;
import com.example.comidasmechita.Services.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notificaciones")
@CrossOrigin("*")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    // Endpoint para obtener las notificaciones no leídas de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerNotificacionesNoLeidas(@PathVariable Long usuarioId) {
        // Suponiendo que tienes un método en el servicio para obtener las notificaciones no leídas del usuario
        var notificaciones = notificacionService.obtenerNotificacionesNoLeidas(usuarioId);
        return ResponseEntity.ok(notificaciones);
    }
    // Endpoint para marcar una notificación como leída
    @PutMapping("/marcar-leida/{notificacionId}")
    public ResponseEntity<Void> marcarNotificacionLeida(@PathVariable Long notificacionId) {
        // Marcar la notificación como leída
        notificacionService.marcarNotificacionLeida(notificacionId);
        return ResponseEntity.noContent().build();  // Retorna 204 No Content si la operación fue exitosa
    }

    @GetMapping("/administrador/{administradorId}")
    public ResponseEntity<?> obtenerNotificacionesAdministrador(@PathVariable Long administradorId) {
        // Validar que el usuario es administrador
        UsuarioEntity admin = usuarioRepository.findById(administradorId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (admin.getRol() != UsuarioEntity.Rol.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No autorizado");
        }

        var notificaciones = notificacionRepository.findByUsuario(admin);
        return ResponseEntity.ok(notificaciones);
    }

}

