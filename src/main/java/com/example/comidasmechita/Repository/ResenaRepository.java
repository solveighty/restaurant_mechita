package com.example.comidasmechita.Repository;

import com.example.comidasmechita.Entity.ResenaEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ResenaRepository extends JpaRepository<ResenaEntity, Long> {
    List<ResenaEntity> findByTipoResena(ResenaEntity.TipoResena tipoResena);
    long countByUsuarioAndTipoResena(UsuarioEntity usuario, ResenaEntity.TipoResena tipoResena);
    List<ResenaEntity> findByUsuario(UsuarioEntity usuario);
}
