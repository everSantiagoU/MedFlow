package com.uam.medflow.dominio.puertos;

import java.util.List;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.Doctor;

public interface DoctorDAO {

    Optional<Doctor> porId(Integer id);

    Doctor guardar(Doctor doctor);

    void eliminar(Doctor doctor);

    boolean existePorRegistroMedico(String registroMedico);

    boolean existePorEmail(String email);

    boolean existePorRegistroMedicoDistintoDeId(String registroMedico, Integer id);

    boolean existePorEmailDistintoDeId(String email, Integer id);

    List<Doctor> listarOrdenadosPorNombre();

    List<Doctor> buscar(String termino);
}
