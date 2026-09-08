package com.uam.medflow.infraestructura.persistencia;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.uam.medflow.dominio.modelo.Doctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

@Repository
public class DoctorDAOJpa implements DoctorDAO {

    private final DoctorSpringDataRepository repositorio;

    public DoctorDAOJpa(DoctorSpringDataRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public Optional<Doctor> porId(Integer id) {
        return repositorio.findById(id);
    }

    @Override
    public Doctor guardar(Doctor doctor) {
        return repositorio.save(doctor);
    }

    @Override
    public void eliminar(Doctor doctor) {
        repositorio.delete(doctor);
    }

    @Override
    public boolean existePorRegistroMedico(String registroMedico) {
        return repositorio.existsByRegistroMedicoIgnoreCase(registroMedico);
    }

    @Override
    public boolean existePorEmail(String email) {
        return repositorio.existsByEmailIgnoreCase(email);
    }

    @Override
    public boolean existePorRegistroMedicoDistintoDeId(String registroMedico, Integer id) {
        return repositorio.existsByRegistroMedicoIgnoreCaseAndIdNot(registroMedico, id);
    }

    @Override
    public boolean existePorEmailDistintoDeId(String email, Integer id) {
        return repositorio.existsByEmailIgnoreCaseAndIdNot(email, id);
    }

    @Override
    public List<Doctor> listarOrdenadosPorNombre() {
        return repositorio.findAllByOrderByNombreCompletoAsc();
    }

    @Override
    public List<Doctor> buscar(String termino) {
        return repositorio.buscar(termino);
    }
}
