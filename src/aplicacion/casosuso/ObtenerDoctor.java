package com.uam.medflow.aplicacion.casosuso;

import org.springframework.transaction.annotation.Transactional;

import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.dominio.excepciones.RecursoNoEncontradoException;
import com.uam.medflow.dominio.modelo.Doctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

@Transactional(readOnly = true)
public class ObtenerDoctor {

    private final DoctorDAO doctores;

    public ObtenerDoctor(DoctorDAO doctores) {
        this.doctores = doctores;
    }

    public DoctorResponse ejecutar(Integer id) {
        return DoctorResponse.desde(buscarEntidad(id));
    }

    public Doctor buscarEntidad(Integer id) {
        return doctores.porId(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Doctor no encontrado con id " + id));
    }
}
