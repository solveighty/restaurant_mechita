package com.example.comidasmechita.Repository;

import com.example.comidasmechita.Entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {
    Optional<UsuarioEntity> findByUsuario(String usuario);
    Optional<UsuarioEntity> findByRol(UsuarioEntity.Rol rol);
    boolean existsByUsuario(String usuario);
    boolean existsByTelefono(String telefono);
    boolean existsByEmail(String email);
}
