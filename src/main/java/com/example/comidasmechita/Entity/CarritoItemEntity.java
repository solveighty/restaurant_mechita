package com.example.comidasmechita.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "carrito_items")
public class CarritoItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "carrito_id", referencedColumnName = "id")
    @JsonBackReference  // Evita la recursión con CarritoEntity
    private CarritoEntity carrito;

    @ManyToOne
    @JoinColumn(name = "menu_id", referencedColumnName = "id")
    private MenuEntity menu;

    private int cantidad;
}
