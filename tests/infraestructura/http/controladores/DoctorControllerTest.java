package com.uam.medflow.infraestructura.http.controladores;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import com.uam.medflow.aplicacion.dto.doctor.DoctorRequest;
import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.aplicacion.dto.doctor.DoctorUpdateResponse;
import com.uam.medflow.aplicacion.casosuso.ActualizarDoctor;
import com.uam.medflow.aplicacion.casosuso.EliminarDoctor;
import com.uam.medflow.aplicacion.casosuso.ListarDoctores;
import com.uam.medflow.aplicacion.casosuso.ObtenerDoctor;
import com.uam.medflow.aplicacion.casosuso.RegistrarDoctor;

class DoctorControllerTest {

    @Test
    void actualizarRetornaMensajeDeConfirmacion() {
        ActualizarDoctor actualizarDoctor = mock(ActualizarDoctor.class);
        DoctorController controller = new DoctorController(
                mock(ListarDoctores.class),
                mock(ObtenerDoctor.class),
                mock(RegistrarDoctor.class),
                actualizarDoctor,
                mock(EliminarDoctor.class));
        DoctorRequest request = new DoctorRequest(
                "Dra. Laura Gomez",
                "Medicina General",
                "RM-001",
                "laura.gomez@medflow.com");
        DoctorResponse response = new DoctorResponse(
                1,
                "Dra. Laura Gomez",
                "Medicina General",
                "RM-001",
                "laura.gomez@medflow.com");

        when(actualizarDoctor.ejecutar(1, request)).thenReturn(response);

        DoctorUpdateResponse resultado = controller.actualizar(1, request);

        assertEquals("Doctor actualizado correctamente", resultado.mensaje());
        assertEquals(response, resultado.doctor());
    }
}
