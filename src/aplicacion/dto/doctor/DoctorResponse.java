package com.uam.medflow.aplicacion.dto.doctor;

import com.uam.medflow.dominio.modelo.Doctor;

public record DoctorResponse(
        Integer id,
        String nombreCompleto,
        String especialidad,
        String registroMedico,
        String email) {

    public static DoctorResponse desde(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getNombreCompleto(),
                doctor.getEspecialidad(),
                doctor.getRegistroMedico(),
                doctor.getEmail());
    }
}
