package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.UsuarioEntity;
import com.example.comidasmechita.Repository.UsuarioRepository;
import com.example.comidasmechita.Security.JwtUtil;
import com.example.comidasmechita.Services.UsuarioService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
@Validated
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<UsuarioEntity>> getAllUsuarios() {
        List<UsuarioEntity> usuarios = usuarioService.getAllUsuarios();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/obtenerusuario/{id}")
    public ResponseEntity<UsuarioEntity> getUsuarioById(@PathVariable Long id) {
        Optional<UsuarioEntity> usuario = usuarioService.getUsuarioById(id);
        return usuario.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/crearusuario")
    public ResponseEntity<UsuarioEntity> createUsuario(@Valid @RequestBody UsuarioEntity usuario) {
        UsuarioEntity createdUsuario = usuarioService.saveUsuario(usuario);
        return new ResponseEntity<>(createdUsuario, HttpStatus.CREATED);
    }

    @PutMapping("/editarusuario/{id}")
    public ResponseEntity<UsuarioEntity> updateUsuario(@PathVariable Long id, @RequestBody UsuarioEntity usuario) {
        try {
            UsuarioEntity updatedUsuario = usuarioService.updateUsuario(id, usuario);
            return new ResponseEntity<>(updatedUsuario, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/eliminarusuario/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        try {
            usuarioService.deleteUsuario(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String identificador, @RequestParam String contrasena) {
        Optional<UsuarioEntity> usuarioOpt;

        // Detectar si el identificador es un correo electrónico o un usuario
        if (identificador.contains("@")) {
            usuarioOpt = usuarioService.getUsuarioByCorreo(identificador); // Buscar por correo
        } else {
            usuarioOpt = usuarioService.getUsuarioByUsuario(identificador); // Buscar por usuario
        }

        // Validar si se encontró el usuario
        if (usuarioOpt.isPresent()) {
            UsuarioEntity usuarioExistente = usuarioOpt.get();
            try {
                // Verificar la contraseña
                boolean isPasswordCorrect = usuarioService.checkPassword(contrasena, usuarioExistente.getContrasena());
                if (isPasswordCorrect) {
                    // Generar el token JWT
                    String token = jwtUtil.generateToken(usuarioExistente);
                    return ResponseEntity.ok().body(new LoginResponse(token));
                } else {
                    return new ResponseEntity<>("Contraseña incorrecta", HttpStatus.UNAUTHORIZED);
                }
            } catch (NoSuchAlgorithmException e) {
                return new ResponseEntity<>("Error al verificar la contraseña", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>("Usuario o correo no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/obtenerPorUsuario/{usuario}")  // Cambié el nombre para que coincida con el frontend
    public ResponseEntity<UsuarioEntity> getUsuarioByUsuario(@PathVariable String usuario) {
        Optional<UsuarioEntity> usuarioOpt = usuarioService.getUsuarioByUsuario(usuario);
        return usuarioOpt.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/{id}/esAdmin")
    public ResponseEntity<Boolean> esAdmin(@PathVariable Long id) {
        boolean isAdmin = usuarioService.isAdmin(id);
        return ResponseEntity.ok(isAdmin);
    }

    @PostMapping("/{id}/direccion-temporal")
    public void agregarDireccionTemporal(@PathVariable Long id, @RequestBody String direccionTemporal) {
        UsuarioEntity usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.agregarDireccionTemporal(direccionTemporal);
        usuarioRepository.save(usuario);
    }

    @GetMapping("/{id}/direcciones")
    public List<String> obtenerDirecciones(@PathVariable Long id) {
        UsuarioEntity usuario = usuarioRepository.findById(id).orElseThrow();

        // Crear una lista mutable e inicializarla con la dirección permanente
        List<String> direcciones = new ArrayList<>();

        // Agregar las direcciones temporales a la lista
        direcciones.addAll(usuario.getDireccionesTemporales());

        return direcciones;
    }

    @DeleteMapping("/{id}/direccion-temporal")
    public void eliminarDireccionTemporal(@PathVariable Long id, @RequestBody String direccionTemporal) {
        UsuarioEntity usuario = usuarioRepository.findById(id).orElseThrow();

        usuario.getDireccionesTemporales().remove(direccionTemporal); // Eliminar la dirección específica
        usuarioRepository.save(usuario);
    }

    @DeleteMapping("/{id}/direcciones-temporales")
    public void eliminarTodasLasDireccionesTemporales(@PathVariable Long id) {
        UsuarioEntity usuario = usuarioRepository.findById(id).orElseThrow();

        usuario.getDireccionesTemporales().clear(); // Eliminar todas las direcciones temporales
        usuarioRepository.save(usuario);
    }

    @Getter
    @Setter
    static class LoginResponse {
        private String token;

        public LoginResponse(String token) {
            this.token = token;
        }

    }
}