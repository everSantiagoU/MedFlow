package com.uam.medflow.aplicacion.dto.auth;

public record LoginResponse(
        String token,
        Integer usuarioId,
        String email,
        String rol
) {}