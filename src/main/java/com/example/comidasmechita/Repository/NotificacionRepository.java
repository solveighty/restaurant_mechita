package com.example.comidasmechita.Repository;

import com.example.comidasmechita.Entity.NotificacionEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {
    List<NotificacionEntity> findByUsuarioAndLeidaFalse(UsuarioEntity usuario);

    List<NotificacionEntity> findByUsuario(UsuarioEntity usuario);
}