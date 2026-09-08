package com.uam.medflow.aplicacion.casosuso;

import com.uam.medflow.aplicacion.dto.auth.LoginRequest;
import com.uam.medflow.aplicacion.dto.auth.LoginResponse;
import com.uam.medflow.dominio.modelo.Usuario;
import com.uam.medflow.dominio.excepciones.CredencialesInvalidasException;
import com.uam.medflow.dominio.puertos.ServicioAutenticacion;
import com.uam.medflow.dominio.puertos.ServicioTokens;
import com.uam.medflow.dominio.puertos.UsuarioDAO;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioDAO usuarios;
    private final ServicioTokens tokens;
    private final ServicioAutenticacion autenticacion;

    public AuthService(
            UsuarioDAO usuarios,
            ServicioTokens tokens,
            ServicioAutenticacion autenticacion) {
        this.usuarios = usuarios;
        this.tokens = tokens;
        this.autenticacion = autenticacion;
    }

    public LoginResponse login(LoginRequest request) {
        autenticacion.autenticar(request.email(), request.password());

        Usuario usuario = usuarios.findByEmail(request.email())
                .orElseThrow(() -> new CredencialesInvalidasException("Credenciales invalidas"));

        String token = tokens.generarToken(usuario);

        return new LoginResponse(token, usuario.getId(), usuario.getEmail(), usuario.getRol().name());
    }
}
