package com.example.comidasmechita.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "usuarios")
public class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String usuario;
    private String nombre;
    private String contrasena;
    private String telefono;
    @Email(message = "El correo electrónico debe tener un formato válido")
    private String email;
    private String direccion;
    @ElementCollection
    private List<String> direccionesTemporales = new ArrayList<>();
    private LocalDateTime miembroDesde = LocalDateTime.now();
    private boolean cuentaVerificada;


    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private CarritoEntity carrito;

    @Enumerated(EnumType.STRING)
    private Rol rol;


    public enum Rol{
        ADMIN,
        NORMAL
    }

    public void agregarDireccionTemporal(String direccion) {
        if (this.direccionesTemporales == null) {
            this.direccionesTemporales = new ArrayList<>();
        }
        this.direccionesTemporales.add(direccion);
    }
}
