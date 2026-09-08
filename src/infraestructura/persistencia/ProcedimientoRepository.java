package com.uam.medflow.infraestructura.persistencia;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.uam.medflow.dominio.modelo.Procedimiento;
import com.uam.medflow.dominio.puertos.ProcedimientoDAO;

public interface ProcedimientoRepository extends JpaRepository<Procedimiento, Integer>, ProcedimientoDAO {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);

    List<Procedimiento> findAllByOrderByNombreAsc();

    @Query("""
            select p
            from Procedimiento p
            where lower(p.nombre) like lower(concat('%', :termino, '%'))
            order by p.nombre asc
            """)
    List<Procedimiento> buscar(@Param("termino") String termino);
}
