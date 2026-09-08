package com.uam.medflow.dominio.puertos;

import java.time.LocalDateTime;
import java.util.List;

import com.uam.medflow.dominio.modelo.EventoCalendario;

public interface EventoCalendarioDAO {

    EventoCalendario save(EventoCalendario evento);

    List<EventoCalendario> buscarPorDoctorYRango(Integer doctorId, LocalDateTime desde, LocalDateTime hasta);

    boolean existeCruceEvento(Integer doctorId, LocalDateTime inicio, LocalDateTime fin);
}
