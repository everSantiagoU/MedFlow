package com.uam.medflow.dominio.puertos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.Cita;

public interface CitaDAO {

    Cita save(Cita cita);

    Optional<Cita> findConRelacionesById(Integer id);

    List<Cita> buscarPorFecha(LocalDate fecha);

    List<Cita> buscarPorDoctorYRango(Integer doctorId, LocalDateTime desde, LocalDateTime hasta);

    List<Cita> buscarCitasActivasParaCruceCalendario(Integer doctorId, LocalDateTime desdeBusqueda, LocalDateTime fin);

    boolean existeCruceDoctor(Integer doctorId, LocalDateTime fechaHora, Integer citaId);

    boolean existeCrucePaciente(Integer pacienteId, LocalDateTime fechaHora, Integer citaId);
}
