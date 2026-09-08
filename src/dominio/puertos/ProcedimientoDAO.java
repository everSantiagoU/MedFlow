package com.uam.medflow.dominio.puertos;

import java.util.List;
import java.util.Optional;

import com.uam.medflow.dominio.modelo.Procedimiento;

public interface ProcedimientoDAO {

    Optional<Procedimiento> findById(Integer id);

    Procedimiento save(Procedimiento procedimiento);

    void delete(Procedimiento procedimiento);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);

    List<Procedimiento> findAllByOrderByNombreAsc();

    List<Procedimiento> buscar(String termino);
}
