package com.example.comidasmechita.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "historial_compras")
public class HistorialCompraEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private UsuarioEntity usuario;

    private LocalDateTime fechaCompra;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "historial_id")
    private List<DetalleCompraEntity> detalles;

    @Enumerated(EnumType.STRING)
    public EstadoCompra estadoCompra = EstadoCompra.EN_PROCESO;

    public enum EstadoCompra {
        EN_PROCESO,
        EN_TRANSITO,
        ENTREGADO
    }
}
