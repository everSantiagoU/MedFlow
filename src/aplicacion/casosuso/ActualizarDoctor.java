package com.uam.medflow.aplicacion.casosuso;

import java.util.Locale;

import org.springframework.transaction.annotation.Transactional;

import com.uam.medflow.aplicacion.dto.doctor.DoctorRequest;
import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.dominio.excepciones.ConflictoException;
import com.uam.medflow.dominio.modelo.Doctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

@Transactional
public class ActualizarDoctor {

    private final DoctorDAO doctores;
    private final ObtenerDoctor obtenerDoctor;

    public ActualizarDoctor(DoctorDAO doctores, ObtenerDoctor obtenerDoctor) {
        this.doctores = doctores;
        this.obtenerDoctor = obtenerDoctor;
    }

    public DoctorResponse ejecutar(Integer id, DoctorRequest datos) {
        Doctor doctor = obtenerDoctor.buscarEntidad(id);
        String registroMedico = datos.registroMedico().trim();
        String email = datos.email().trim().toLowerCase(Locale.ROOT);

        if (doctores.existePorRegistroMedicoDistintoDeId(registroMedico, id)) {
            throw new ConflictoException("Ya existe un doctor con el registro medico " + registroMedico);
        }
        if (doctores.existePorEmailDistintoDeId(email, id)) {
            throw new ConflictoException("El correo " + email + " ya esta en uso");
        }

        doctor.setNombreCompleto(datos.nombreCompleto().trim());
        doctor.setEspecialidad(datos.especialidad().trim());
        doctor.setRegistroMedico(registroMedico);
        doctor.setEmail(email);

        return DoctorResponse.desde(doctores.guardar(doctor));
    }
}
