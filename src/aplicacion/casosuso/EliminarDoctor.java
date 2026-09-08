package com.uam.medflow.aplicacion.casosuso;

import org.springframework.transaction.annotation.Transactional;

import com.uam.medflow.dominio.puertos.DoctorDAO;

@Transactional
public class EliminarDoctor {

    private final DoctorDAO doctores;
    private final ObtenerDoctor obtenerDoctor;

    public EliminarDoctor(DoctorDAO doctores, ObtenerDoctor obtenerDoctor) {
        this.doctores = doctores;
        this.obtenerDoctor = obtenerDoctor;
    }

    public void ejecutar(Integer id) {
        doctores.eliminar(obtenerDoctor.buscarEntidad(id));
    }
}
