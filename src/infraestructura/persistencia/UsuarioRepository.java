package com.uam.medflow.infraestructura.persistencia;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.uam.medflow.dominio.modelo.Usuario;
import com.uam.medflow.dominio.puertos.UsuarioDAO;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer>, UsuarioDAO {

    Optional<Usuario> findByEmail(String email);
}
