package com.example.comidasmechita.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ResenaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id", nullable = false)
    private UsuarioEntity usuario;

    @ManyToOne
    @JoinColumn(name = "historial_compra_id", referencedColumnName = "id", nullable = true)
    private HistorialCompraEntity historialCompra; // Si es null, significa que es una reseña de la página.

    @Lob
    private String comentario;

    private int calificacion; // 1 a 5 estrellas

    @Enumerated(EnumType.STRING)
    private TipoResena tipoResena;

    private LocalDateTime fecha = LocalDateTime.now();

    public enum TipoResena {
        PAGINA,  // Visible para todos
        PEDIDO   // Solo visible para administradores
    }
}
