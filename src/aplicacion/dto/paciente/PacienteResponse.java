package com.uam.medflow.aplicacion.dto.paciente;

public record PacienteResponse(
        Integer id,
        String nombreCompleto,
        String documento,
        String telefono,
        String email,
        String direccion) {
}
