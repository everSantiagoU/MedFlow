package com.uam.medflow.dominio.puertos;

import java.util.List;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.Paciente;

public interface PacienteDAO {

    Optional<Paciente> findById(Integer id);

    Paciente save(Paciente paciente);

    void delete(Paciente paciente);

    boolean existsByDocumentoIgnoreCase(String documento);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByDocumentoIgnoreCaseAndIdNot(String documento, Integer id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Integer id);

    List<Paciente> findAllByOrderByNombreCompletoAsc();

    List<Paciente> buscar(String termino);
}
