package com.uam.medflow.aplicacion.casosuso;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.uam.medflow.aplicacion.dto.doctor.DoctorRequest;
import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.dobles.DoctorDAOEnMemoria;
import com.uam.medflow.dominio.excepciones.ConflictoException;
import com.uam.medflow.dominio.excepciones.RecursoNoEncontradoException;

class DoctorCasosUsoTest {

    private DoctorDAOEnMemoria doctores;
    private RegistrarDoctor registrar;
    private ObtenerDoctor obtener;
    private ActualizarDoctor actualizar;
    private ListarDoctores listar;
    private EliminarDoctor eliminar;

    @BeforeEach
    void armar() {
        doctores = new DoctorDAOEnMemoria();
        obtener = new ObtenerDoctor(doctores);
        registrar = new RegistrarDoctor(doctores);
        actualizar = new ActualizarDoctor(doctores, obtener);
        listar = new ListarDoctores(doctores);
        eliminar = new EliminarDoctor(doctores, obtener);
    }

    @Test
    void registraNormalizandoLosDatos() {
        DoctorResponse doctor = registrar.ejecutar(new DoctorRequest(
                "  Dra. Laura Gomez  ",
                "  Cardiologia  ",
                "  RM-001  ",
                "  LAURA.GOMEZ@MEDFLOW.COM  "));

        assertEquals(1, doctor.id());
        assertEquals("Dra. Laura Gomez", doctor.nombreCompleto());
        assertEquals("Cardiologia", doctor.especialidad());
        assertEquals("RM-001", doctor.registroMedico());
        assertEquals("laura.gomez@medflow.com", doctor.email());
    }

    @Test
    void rechazaRegistroMedicoYCorreoDuplicadosSinImportarMayusculas() {
        registrar.ejecutar(datos("Dra. Laura Gomez", "RM-001", "laura@medflow.com"));

        assertThrows(
                ConflictoException.class,
                () -> registrar.ejecutar(datos("Dr. Andres Ruiz", "rm-001", "andres@medflow.com")));
        assertThrows(
                ConflictoException.class,
                () -> registrar.ejecutar(datos("Dr. Andres Ruiz", "RM-002", "LAURA@MEDFLOW.COM")));
    }

    @Test
    void listaBuscaActualizaYEliminaDoctores() {
        DoctorResponse laura = registrar.ejecutar(datos("Dra. Laura Gomez", "RM-001", "laura@medflow.com"));
        registrar.ejecutar(datos("Dr. Andres Ruiz", "RM-002", "andres@medflow.com"));

        assertEquals("Dr. Andres Ruiz", listar.ejecutar(null).getFirst().nombreCompleto());
        assertEquals(1, listar.ejecutar("Laura").size());

        DoctorResponse actualizado = actualizar.ejecutar(
                laura.id(),
                datos("Dra. Laura Gomez", "RM-003", "NUEVO@MEDFLOW.COM"));
        assertEquals("RM-003", actualizado.registroMedico());
        assertEquals("nuevo@medflow.com", actualizado.email());

        eliminar.ejecutar(laura.id());
        assertThrows(RecursoNoEncontradoException.class, () -> obtener.ejecutar(laura.id()));
    }

    private DoctorRequest datos(String nombre, String registroMedico, String email) {
        return new DoctorRequest(nombre, "Cardiologia", registroMedico, email);
    }
}
