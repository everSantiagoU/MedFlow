package com.uam.medflow.aplicacion.casosuso;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.dominio.modelo.Doctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

@Transactional(readOnly = true)
public class ListarDoctores {

    private final DoctorDAO doctores;

    public ListarDoctores(DoctorDAO doctores) {
        this.doctores = doctores;
    }

    public List<DoctorResponse> ejecutar(String busqueda) {
        List<Doctor> encontrados = (busqueda == null || busqueda.isBlank())
                ? doctores.listarOrdenadosPorNombre()
                : doctores.buscar(busqueda.trim());

        return encontrados.stream()
                .map(DoctorResponse::desde)
                .toList();
    }
}
