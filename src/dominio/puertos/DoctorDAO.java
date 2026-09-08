package com.uam.medflow.dominio.puertos;

import java.util.List;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.Doctor;

public interface DoctorDAO {

    Optional<Doctor> findById(Integer id);

    Doctor save(Doctor doctor);

    void delete(Doctor doctor);

    boolean existsByRegistroMedicoIgnoreCase(String registroMedico);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRegistroMedicoIgnoreCaseAndIdNot(String registroMedico, Integer id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Integer id);

    List<Doctor> findAllByOrderByNombreCompletoAsc();

    List<Doctor> buscar(String termino);
}
