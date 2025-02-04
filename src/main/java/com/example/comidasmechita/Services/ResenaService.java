package com.example.comidasmechita.Services;

import com.example.comidasmechita.Entity.HistorialCompraEntity;
import com.example.comidasmechita.Entity.ResenaEntity;
import com.example.comidasmechita.Entity.UsuarioEntity;
import com.example.comidasmechita.Repository.HistorialCompraRepository;
import com.example.comidasmechita.Repository.ResenaRepository;
import com.example.comidasmechita.Repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResenaService {
    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistorialCompraRepository historialCompraRepository;

    public ResenaEntity crearResena(Long usuarioId, String comentario, int calificacion, Long historialId, ResenaEntity.TipoResena tipo) {
        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Si el tipo de reseña es "PAGINA", validar si el usuario ya tiene 2 reseñas
        if (tipo == ResenaEntity.TipoResena.PAGINA) {
            long cantidadResenasPagina = resenaRepository.countByUsuarioAndTipoResena(usuario, ResenaEntity.TipoResena.PAGINA);

            // Si ya tiene 2 reseñas de tipo "PAGINA", lanzar excepción o retornar un error
            if (cantidadResenasPagina >= 2) {
                throw new RuntimeException("No puedes hacer más de dos reseñas de tipo 'PÁGINA'");
            }
        }

        ResenaEntity resena = new ResenaEntity();
        resena.setUsuario(usuario);
        resena.setComentario(comentario);
        resena.setCalificacion(calificacion);
        resena.setTipoResena(tipo);

        if (tipo == ResenaEntity.TipoResena.PEDIDO) {
            HistorialCompraEntity historial = historialCompraRepository.findById(historialId)
                    .orElseThrow(() -> new RuntimeException("Historial de compra no encontrado"));
            resena.setHistorialCompra(historial);
        }

        return resenaRepository.save(resena);
    }

    @Transactional(readOnly = true)
    public List<ResenaEntity> obtenerResenasPorUsuario(Long usuarioId) {
        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return resenaRepository.findByUsuario(usuario);
    }

    @Transactional(readOnly = true)
    public List<ResenaEntity> obtenerResenasPagina() {
        return resenaRepository.findByTipoResena(ResenaEntity.TipoResena.PAGINA);
    }

    @Transactional(readOnly = true)
    public List<ResenaEntity> obtenerResenasPedidos() {
        return resenaRepository.findByTipoResena(ResenaEntity.TipoResena.PEDIDO);
    }
}
