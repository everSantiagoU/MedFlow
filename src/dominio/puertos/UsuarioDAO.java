package com.uam.medflow.dominio.puertos;

import java.util.Optional;

import com.uam.medflow.dominio.modelo.Usuario;

public interface UsuarioDAO {

    Optional<Usuario> findByEmail(String email);
}
