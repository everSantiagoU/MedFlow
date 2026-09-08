package com.uam.medflow.infraestructura.http.controladores;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.uam.medflow.aplicacion.dto.doctor.DoctorRequest;
import com.uam.medflow.aplicacion.dto.doctor.DoctorResponse;
import com.uam.medflow.aplicacion.dto.doctor.DoctorUpdateResponse;
import com.uam.medflow.aplicacion.casosuso.ActualizarDoctor;
import com.uam.medflow.aplicacion.casosuso.EliminarDoctor;
import com.uam.medflow.aplicacion.casosuso.ListarDoctores;
import com.uam.medflow.aplicacion.casosuso.ObtenerDoctor;
import com.uam.medflow.aplicacion.casosuso.RegistrarDoctor;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/doctores")
public class DoctorController {

    private final ListarDoctores listarDoctores;
    private final ObtenerDoctor obtenerDoctor;
    private final RegistrarDoctor registrarDoctor;
    private final ActualizarDoctor actualizarDoctor;
    private final EliminarDoctor eliminarDoctor;

    public DoctorController(
            ListarDoctores listarDoctores,
            ObtenerDoctor obtenerDoctor,
            RegistrarDoctor registrarDoctor,
            ActualizarDoctor actualizarDoctor,
            EliminarDoctor eliminarDoctor) {
        this.listarDoctores = listarDoctores;
        this.obtenerDoctor = obtenerDoctor;
        this.registrarDoctor = registrarDoctor;
        this.actualizarDoctor = actualizarDoctor;
        this.eliminarDoctor = eliminarDoctor;
    }

    @GetMapping
    public List<DoctorResponse> listar(@RequestParam(required = false) String busqueda) {
        return listarDoctores.ejecutar(busqueda);
    }

    @GetMapping("/{id}")
    public DoctorResponse obtenerPorId(@PathVariable Integer id) {
        return obtenerDoctor.ejecutar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorResponse crear(@Valid @RequestBody DoctorRequest request) {
        return registrarDoctor.ejecutar(request);
    }

    @PutMapping("/{id}")
    public DoctorUpdateResponse actualizar(@PathVariable Integer id, @Valid @RequestBody DoctorRequest request) {
        DoctorResponse doctorActualizado = actualizarDoctor.ejecutar(id, request);
        return new DoctorUpdateResponse("Doctor actualizado correctamente", doctorActualizado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Integer id) {
        eliminarDoctor.ejecutar(id);
    }
}
