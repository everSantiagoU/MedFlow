package com.uam.medflow.infraestructura.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.uam.medflow.aplicacion.casosuso.ActualizarDoctor;
import com.uam.medflow.aplicacion.casosuso.EliminarDoctor;
import com.uam.medflow.aplicacion.casosuso.ListarDoctores;
import com.uam.medflow.aplicacion.casosuso.ObtenerDoctor;
import com.uam.medflow.aplicacion.casosuso.RegistrarDoctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

@Configuration
public class DoctorCasosUsoConfig {

    @Bean
    public ObtenerDoctor obtenerDoctor(DoctorDAO doctores) {
        return new ObtenerDoctor(doctores);
    }

    @Bean
    public ListarDoctores listarDoctores(DoctorDAO doctores) {
        return new ListarDoctores(doctores);
    }

    @Bean
    public RegistrarDoctor registrarDoctor(DoctorDAO doctores) {
        return new RegistrarDoctor(doctores);
    }

    @Bean
    public ActualizarDoctor actualizarDoctor(DoctorDAO doctores, ObtenerDoctor obtenerDoctor) {
        return new ActualizarDoctor(doctores, obtenerDoctor);
    }

    @Bean
    public EliminarDoctor eliminarDoctor(DoctorDAO doctores, ObtenerDoctor obtenerDoctor) {
        return new EliminarDoctor(doctores, obtenerDoctor);
    }
}
