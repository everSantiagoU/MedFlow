package com.uam.medflow.infraestructura.http.controladores;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.uam.medflow.aplicacion.dto.auth.LoginRequest;
import com.uam.medflow.aplicacion.dto.auth.LoginResponse;
import com.uam.medflow.aplicacion.casosuso.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
