package com.uam.medflow.infraestructura.seguridad;

import com.uam.medflow.dominio.excepciones.CredencialesInvalidasException;
import com.uam.medflow.dominio.puertos.ServicioAutenticacion;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AutenticacionSpringSecurity implements ServicioAutenticacion {

    private final AuthenticationManager authenticationManager;

    public AutenticacionSpringSecurity(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public void autenticar(String email, String password) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        } catch (BadCredentialsException ex) {
            throw new CredencialesInvalidasException("Credenciales invalidas");
        }
    }
}
