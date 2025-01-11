package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.UsuarioEntity;
import com.example.comidasmechita.Services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
@Validated
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

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

    @PostMapping("/verificarPassword")
    public ResponseEntity<String> verificarPassword(@RequestParam String usuario, @RequestParam String contrasena) {
        Optional<UsuarioEntity> usuarioOpt = usuarioService.getUsuarioByUsuario(usuario);

        if (usuarioOpt.isPresent()) {
            UsuarioEntity usuarioExistente = usuarioOpt.get();
            try {
                boolean isPasswordCorrect = usuarioService.checkPassword(contrasena, usuarioExistente.getContrasena());
                if (isPasswordCorrect) {
                    return new ResponseEntity<>("Contraseña correcta", HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("Contraseña incorrecta", HttpStatus.UNAUTHORIZED);
                }
            } catch (NoSuchAlgorithmException e) {
                return new ResponseEntity<>("Error al verificar la contraseña", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
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
}