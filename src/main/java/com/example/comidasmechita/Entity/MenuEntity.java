package com.example.comidasmechita.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class MenuEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String descripcion;
    private Float precio;
    private String imagen;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    public enum Categoria {
        PLATOS_ESPECIALES,
        COMIDAS_RAPIDAS,
        BOCADITOS
    }
}
