package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Services.HistorialCompraService;
import com.example.comidasmechita.Services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;

@RestController
public class EstadisticasController {
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private HistorialCompraService historialCompraService;

    @GetMapping("/estadisticas")
    public Map<String, Object> obtenerEstadisticas(@RequestParam Long adminId) {
        if (!usuarioService.isAdmin(adminId)) {
            throw new RuntimeException("Acceso denegado. Solo los administradores pueden acceder a las estadísticas.");
        }

        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("totalUsuarios", usuarioService.getTotalUsuarios());

        LocalDateTime ahora = LocalDateTime.now();

        // Pedidos de hoy
        LocalDateTime inicioDia = ahora.toLocalDate().atStartOfDay();
        estadisticas.put("pedidosHoy", historialCompraService.contarPedidosPorIntervalo(inicioDia, ahora));

        // Pedidos de esta semana
        LocalDateTime inicioSemana = ahora.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).toLocalDate().atStartOfDay();
        estadisticas.put("pedidosSemana", historialCompraService.contarPedidosPorIntervalo(inicioSemana, ahora));

        // Pedidos de este mes
        LocalDateTime inicioMes = ahora.with(TemporalAdjusters.firstDayOfMonth()).toLocalDate().atStartOfDay();
        estadisticas.put("pedidosMes", historialCompraService.contarPedidosPorIntervalo(inicioMes, ahora));

        // Pedidos de este año
        LocalDateTime inicioAnio = ahora.with(TemporalAdjusters.firstDayOfYear()).toLocalDate().atStartOfDay();
        estadisticas.put("pedidosAnio", historialCompraService.contarPedidosPorIntervalo(inicioAnio, ahora));

        return estadisticas;
    }
}
