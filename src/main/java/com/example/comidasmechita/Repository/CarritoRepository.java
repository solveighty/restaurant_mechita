package com.example.comidasmechita.Repository;

import com.example.comidasmechita.Entity.CarritoEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<CarritoEntity, Long> {
    Optional<CarritoEntity> findByUsuario(UsuarioEntity usuario);
}
