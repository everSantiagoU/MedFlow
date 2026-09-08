package com.uam.medflow.infraestructura.http.excepciones;

import java.util.List;

public record ApiErrorResponse(String mensaje, List<String> errores) {
}
