package com.uam.medflow.dominio.puertos;

import java.util.List;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.HistoriaClinica;

public interface HistoriaClinicaDAO {

    HistoriaClinica save(HistoriaClinica historiaClinica);

    boolean existsByCitaId(Integer citaId);

    Optional<HistoriaClinica> findConRelacionesById(Integer id);

    List<HistoriaClinica> findByPacienteConRelaciones(Integer pacienteId);

    List<HistoriaClinica> findAllConRelaciones();
}
