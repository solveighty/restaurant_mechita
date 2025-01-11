package com.example.comidasmechita.Repository;

import com.example.comidasmechita.Entity.MenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.awt.*;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<MenuEntity, Long> {
    Optional<MenuEntity> findByNombre(String nombre);
}
