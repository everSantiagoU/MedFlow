package com.uam.medflow.dobles;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.Doctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

public class DoctorDAOEnMemoria implements DoctorDAO {

    private final List<Doctor> filas = new ArrayList<>();
    private int siguienteId = 1;

    @Override
    public Optional<Doctor> porId(Integer id) {
        return filas.stream().filter(doctor -> doctor.getId().equals(id)).findFirst();
    }

    @Override
    public Doctor guardar(Doctor doctor) {
        if (doctor.getId() == null) {
            doctor.setId(siguienteId++);
            filas.add(doctor);
        }
        return doctor;
    }

    @Override
    public void eliminar(Doctor doctor) {
        filas.remove(doctor);
    }

    @Override
    public boolean existePorRegistroMedico(String registroMedico) {
        return filas.stream().anyMatch(doctor -> doctor.getRegistroMedico().equalsIgnoreCase(registroMedico));
    }

    @Override
    public boolean existePorEmail(String email) {
        return filas.stream().anyMatch(doctor -> doctor.getEmail().equalsIgnoreCase(email));
    }

    @Override
    public boolean existePorRegistroMedicoDistintoDeId(String registroMedico, Integer id) {
        return filas.stream().anyMatch(doctor -> !doctor.getId().equals(id)
                && doctor.getRegistroMedico().equalsIgnoreCase(registroMedico));
    }

    @Override
    public boolean existePorEmailDistintoDeId(String email, Integer id) {
        return filas.stream().anyMatch(doctor -> !doctor.getId().equals(id)
                && doctor.getEmail().equalsIgnoreCase(email));
    }

    @Override
    public List<Doctor> listarOrdenadosPorNombre() {
        return filas.stream()
                .sorted(Comparator.comparing(Doctor::getNombreCompleto))
                .toList();
    }

    @Override
    public List<Doctor> buscar(String termino) {
        String normalizado = termino.toLowerCase(Locale.ROOT);
        return listarOrdenadosPorNombre().stream()
                .filter(doctor -> doctor.getNombreCompleto().toLowerCase(Locale.ROOT).contains(normalizado)
                        || doctor.getEspecialidad().toLowerCase(Locale.ROOT).contains(normalizado)
                        || doctor.getRegistroMedico().toLowerCase(Locale.ROOT).contains(normalizado))
                .toList();
    }
}
