package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.ResenaEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import com.example.comidasmechita.Repository.UsuarioRepository;
import com.example.comidasmechita.Services.ResenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resenas")
public class ResenaController {
    @Autowired
    private ResenaService resenaService;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/crear")
    public ResponseEntity<ResenaEntity> crearResena(@RequestBody ResenaEntity resena) {
        ResenaEntity nuevaResena = resenaService.crearResena(
                resena.getUsuario().getId(),
                resena.getComentario(),
                resena.getCalificacion(),
                resena.getHistorialCompra() != null ? resena.getHistorialCompra().getId() : null,
                resena.getTipoResena()
        );
        return ResponseEntity.ok(nuevaResena);
    }

    @GetMapping("/pagina")
    public ResponseEntity<List<ResenaEntity>> obtenerResenasPagina() {
        return ResponseEntity.ok(resenaService.obtenerResenasPagina());
    }

    @GetMapping("/pedidos")
    public ResponseEntity<List<ResenaEntity>> obtenerResenasPedidos(@RequestParam Long adminId) {
        // Verificar si el usuario es administrador
        if (!esAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(resenaService.obtenerResenasPedidos());
    }

    private boolean esAdmin(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .map(usuario -> usuario.getRol() == UsuarioEntity.Rol.ADMIN)
                .orElse(false);
    }
}
