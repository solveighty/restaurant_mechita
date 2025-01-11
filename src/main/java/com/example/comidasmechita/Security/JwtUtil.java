package com.example.comidasmechita.Security;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.example.comidasmechita.Entity.UsuarioEntity;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {
    private final String SECRET_KEY = "john5zimzum"; // Cambia por algo más seguro.
    private final int EXPIRATION_TIME = 3600000; // 1 hora en milisegundos.

    public String generateToken(UsuarioEntity usuario) {
        return JWT.create()
                .withSubject(usuario.getUsuario())
                .withClaim("id", usuario.getId())
                .withClaim("nombre", usuario.getNombre())
                .withClaim("email", usuario.getEmail())
                .withClaim("telefono", usuario.getTelefono())
                .withClaim("direccion", usuario.getDireccion())
                .withClaim("rol", usuario.getRol().name())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public String validateToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(SECRET_KEY)).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        return decodedJWT.getSubject();
    }
}
