package com.uam.medflow.aplicacion.casosuso;

import java.util.Locale;

import org.springframework.transaction.annotation.Transactional;

import com.uam.medflow.aplicacion.dto.doctor.DoctorRequest;
import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.dominio.excepciones.ConflictoException;
import com.uam.medflow.dominio.modelo.Doctor;
import com.uam.medflow.dominio.puertos.DoctorDAO;

@Transactional
public class RegistrarDoctor {

    private final DoctorDAO doctores;

    public RegistrarDoctor(DoctorDAO doctores) {
        this.doctores = doctores;
    }

    public DoctorResponse ejecutar(DoctorRequest datos) {
        String registroMedico = datos.registroMedico().trim();
        String email = datos.email().trim().toLowerCase(Locale.ROOT);

        if (doctores.existePorRegistroMedico(registroMedico)) {
            throw new ConflictoException("Ya existe un doctor con el registro medico " + registroMedico);
        }
        if (doctores.existePorEmail(email)) {
            throw new ConflictoException("El correo " + email + " ya esta en uso");
        }

        Doctor doctor = new Doctor();
        doctor.setNombreCompleto(datos.nombreCompleto().trim());
        doctor.setEspecialidad(datos.especialidad().trim());
        doctor.setRegistroMedico(registroMedico);
        doctor.setEmail(email);

        return DoctorResponse.desde(doctores.guardar(doctor));
    }
}
