package com.uam.medflow.arquitectura;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.Test;

class ArquitecturaHexagonalTest {

    private static final Path SRC = Path.of("src");

    @Test
    void dominioYAplicacionNoImportanInfraestructura() throws IOException {
        List<Path> archivosConDependenciaInvertida = Files.walk(SRC)
                .filter(Files::isRegularFile)
                .filter(path -> path.toString().endsWith(".java"))
                .filter(this::estaEnCentroDeLaAplicacion)
                .filter(this::importaInfraestructura)
                .toList();

        assertTrue(
                archivosConDependenciaInvertida.isEmpty(),
                () -> "Dominio/aplicacion no deben importar infraestructura: " + archivosConDependenciaInvertida);
    }

    private boolean estaEnCentroDeLaAplicacion(Path path) {
        String ruta = path.toString();
        return ruta.contains("/dominio/") || ruta.contains("/aplicacion/");
    }

    private boolean importaInfraestructura(Path path) {
        try {
            return Files.readString(path).contains("com.uam.medflow.infraestructura");
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer " + path, ex);
        }
    }
}
