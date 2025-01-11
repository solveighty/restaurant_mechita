package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.HistorialCompraEntity;
import com.example.comidasmechita.Services.HistorialCompraService;
import com.example.comidasmechita.Services.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/historial")
@CrossOrigin("*")
public class HistorialCompraController {
    @Autowired
    private HistorialCompraService historialCompraService;

    @Autowired
    private NotificacionService notificacionService;

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<HistorialCompraEntity>> getHistorialByUsuarioId(@PathVariable Long usuarioId) {
        List<HistorialCompraEntity> historial = historialCompraService.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/all")
    public ResponseEntity<List<HistorialCompraEntity>> getAllHistorial(@RequestParam Long userId) {
        try {
            List<HistorialCompraEntity> historial = historialCompraService.getAllHistorialIfAdmin(userId);
            return ResponseEntity.ok(historial);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build(); // Retorna 403 si no tiene permisos
        }
    }

    @PutMapping("/actualizar-estado/{historialId}")
    public ResponseEntity<HistorialCompraEntity> actualizarEstadoCompra(
            @RequestParam Long userId,
            @PathVariable Long historialId,
            @RequestParam HistorialCompraEntity.EstadoCompra nuevoEstado) {
        try {
            // Cambiar el estado de la compra
            HistorialCompraEntity actualizado = historialCompraService.actualizarEstadoCompra(userId, historialId, nuevoEstado);

            // Notificar al usuario
            String mensaje = "El estado de tu pedido con ID: " + historialId + " ha cambiado a: " + nuevoEstado;
            notificacionService.notificarUsuario(actualizado.getUsuario(), mensaje);

            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(null); // Acceso denegado
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null); // Error interno
        }
    }

    // Endpoint para obtener el historial de compras por fechas
    @GetMapping("/ventas")
    public ResponseEntity<Map<String, Object>> obtenerVentasPorFechas(
            @RequestParam Long userId,
            @RequestParam String rango) {
        try {
            // Obtener la fecha de inicio y final según el rango
            LocalDateTime startDate = null;
            LocalDateTime endDate = LocalDateTime.now();

            switch (rango) {
                case "diario":
                    startDate = LocalDateTime.now().minusDays(1);
                    break;
                case "semanal":
                    startDate = LocalDateTime.now().minusWeeks(1);
                    break;
                case "mensual":
                    startDate = LocalDateTime.now().minusMonths(1);
                    break;
                case "anual":
                    startDate = LocalDateTime.now().minusYears(1);
                    break;
                default:
                    return ResponseEntity.status(400).body(null); // Bad request si el rango es inválido
            }

            // Obtener el historial de compras y el total de ventas
            Map<String, Object> response = historialCompraService.obtenerHistorialYTotalVentasPorFechas(userId, startDate, endDate);

            // Retornar tanto el historial como el total de ventas
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build(); // 403 si no es admin
        } catch (Exception e) {
            return ResponseEntity.status(500).build(); // Error interno
        }
    }

}
