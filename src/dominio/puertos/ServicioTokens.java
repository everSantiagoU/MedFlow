package com.uam.medflow.dominio.puertos;

import com.uam.medflow.dominio.modelo.Usuario;

public interface ServicioTokens {

    String generarToken(Usuario usuario);
}
