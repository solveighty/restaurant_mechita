package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.CarritoEntity;
import com.example.comidasmechita.Services.CarritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/carrito")
@CrossOrigin("*")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    // Obtener el carrito de un usuario
    @GetMapping("/{usuarioId}")
    public ResponseEntity<CarritoEntity> getCarritoByUsuarioId(@PathVariable Long usuarioId) {
        CarritoEntity carrito = carritoService.getOrCreateCarrito(usuarioId);
        return new ResponseEntity<>(carrito, HttpStatus.OK);
    }

    // Agregar un ítem al carrito
    @PostMapping("/agregar")
    public ResponseEntity<CarritoEntity> addItemToCarrito(@RequestBody Map<String, Object> request) {
        Long usuarioId = ((Number) request.get("usuarioId")).longValue();
        Long menuId = ((Number) request.get("menuId")).longValue();
        int cantidad = (int) request.get("cantidad");
        CarritoEntity updatedCarrito = carritoService.addItemToCarrito(usuarioId, menuId, cantidad);
        return new ResponseEntity<>(updatedCarrito, HttpStatus.OK);
    }

    // Actualizar la cantidad de un ítem en el carrito
    @PutMapping("/actualizar/{carritoItemId}")
    public ResponseEntity<CarritoEntity> updateItemCantidad(
            @PathVariable Long carritoItemId,
            @RequestParam int cantidad) {
        CarritoEntity carrito = carritoService.updateItemCantidad(carritoItemId, cantidad);
        return new ResponseEntity<>(carrito, HttpStatus.OK);
    }

    @DeleteMapping("/eliminar/{carritoId}/{itemId}")
    public ResponseEntity<Void> eliminarItemDelCarrito(@PathVariable Long carritoId, @PathVariable Long itemId) {
        carritoService.eliminarItemDelCarrito(carritoId, itemId);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content si la eliminación es exitosa
    }

    @PutMapping("/pagar/{carritoId}")
    public ResponseEntity<Map<String, String>> pagarCarrito(@PathVariable Long carritoId) {
        carritoService.simularPago(carritoId);

        // Crear un mapa para incluir el mensaje de respuesta
        Map<String, String> response = new HashMap<>();
        response.put("message", "Pago exitoso. Carrito vaciado y notificaciones enviadas.");

        // Retornar un ResponseEntity con el mensaje
        return ResponseEntity.ok(response);  // Retorna el estado 200 OK con el mensaje
    }
}
