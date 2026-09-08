package com.uam.medflow.aplicacion.dto.doctor;

public record DoctorResponse(
        Integer id,
        String nombreCompleto,
        String especialidad,
        String registroMedico,
        String email) {
}
