package com.uam.medflow.aplicacion.dto.procedimiento;

import java.math.BigDecimal;

public record ProcedimientoResponse(
        Integer id,
        String nombre,
        BigDecimal precio,
        Integer duracionMinutos) {
}
