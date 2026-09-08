package com.uam.medflow.aplicacion.dto.cita;

import java.time.LocalDateTime;

public record CitaResponse(
        Integer id,
        LocalDateTime fechaHora,
        String estado,
        Integer pacienteId,
        String pacienteNombre,
        Integer doctorId,
        String doctorNombre,
        String doctorEspecialidad,
        Integer procedimientoId,
        String procedimientoNombre,
        Integer procedimientoDuracionMinutos) {
}
