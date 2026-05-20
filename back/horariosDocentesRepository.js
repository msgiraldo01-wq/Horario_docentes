/**
 * Repositorio de horarios docentes (CRUD) con:
 * - Sentencias preparadas (execute)
 * - Control de transacciones (START TRANSACTION/COMMIT/ROLLBACK)
 * - Locks explícitos (LOCK TABLES/UNLOCK TABLES)
 *
 * Vulnerabilidad mitigada: Inyección SQL (SQL Injection)
 * - Qué explota: concatenación de strings en SQL.
 * - Criticidad: Alta/Crítica.
 * - Mitigación: placeholders + connection.execute en todas las consultas.
 *
 * Vulnerabilidad mitigada: TOCTOU / condiciones de carrera en validación de unicidad
 * - Qué explota: validación previa sin aislamiento.
 * - Criticidad: Media.
 * - Mitigación: transacción + LOCK TABLES clientes WRITE antes de validar/insertar/actualizar.
 */

async function withWriteLock(connection, fn) {
  await connection.query("START TRANSACTION"); // Inicia una transacción para agrupar operaciones como una unidad atómica.
  try { // Abre bloque protegido: cualquier error ejecutará ROLLBACK y liberación de locks en finally.
    await connection.query("LOCK TABLES horariosdocentes WRITE"); // Bloquea la tabla para escritura: evita condiciones de carrera durante validaciones de unicidad.
    const result = await fn(); // Ejecuta la operación crítica (validar + insertar/actualizar/borrar) dentro del lock.
    await connection.query("COMMIT"); // Confirma la transacción: hace persistentes los cambios.
    return result; // Devuelve el resultado de la operación al llamador.
  } catch (err) { // Captura cualquier error de la operación crítica para revertir cambios.
    try { // Intenta ROLLBACK; si falla, igual se re-lanza el error original.
      await connection.query("ROLLBACK"); // Revierte cambios si algo falló (consistencia).
    } catch { // Un rollback puede fallar si la conexión se cayó; se ignora para no ocultar el error principal.
    }
    throw err; // Re-lanza el error para que el controlador HTTP lo traduzca a una respuesta.
  } finally { // Se ejecuta siempre: haya éxito o error, libera locks para no bloquear el sistema.
    try { // Intenta liberar locks incluso si hubo errores previos.
      await connection.query("UNLOCK TABLES"); // Libera el lock de tabla (crítico para no bloquear a otros clientes).
    } catch { // Si UNLOCK falla (p.ej. conexión cerrada), se ignora porque no hay mucho que hacer aquí.
    }
  }
}

async function withReadLock(connection, fn) {
  await connection.query("START TRANSACTION"); // Inicia transacción para garantizar consistencia de lectura bajo lock.
  try { // Bloque protegido: asegura COMMIT/ROLLBACK y liberación de locks de lectura.
    await connection.query("LOCK TABLES horariosdocentes READ"); // Bloquea la tabla en modo lectura: nadie puede escribir mientras se valida/lee.
    const result = await fn(); // Ejecuta la operación de lectura de forma consistente.
    await connection.query("COMMIT"); // Finaliza la transacción.
    return result; // Retorna el resultado al llamador.
  } catch (err) { // Captura errores de lectura/consistencia.
    try { // Intenta revertir la transacción antes de propagar el error.
      await connection.query("ROLLBACK"); // Deshace la transacción si falló (aunque sea lectura, mantiene simetría del flujo).
    } catch { // Ignora fallo de rollback secundario.
    }
    throw err; // Propaga el error para manejo centralizado.
  } finally { // Se ejecuta siempre para liberar el lock READ.
    try { // Intenta liberar locks sin importar el estado de la transacción.
      await connection.query("UNLOCK TABLES"); // Libera el lock de lectura.
    } catch { // Ignora fallo al liberar locks por ser un error secundario.
    }
  }
}

async function findHorarioById(connection, idHorario) {
  const [rows] = await connection.execute(
    `SELECT idHorario, docente, facultad, carrera, materia, fechaClase, horaIniciaClase, horaTerminaClase FROM horariosdocentes WHERE idHorario = ? LIMIT 1`,
    [idHorario]
  );

  return rows[0] ?? null;
}

async function existsHorarioSolapado(connection, horario,
  { excludeIdHorario } = {}
) {

  let sql = `SELECT 1 AS ok FROM horariosdocentes WHERE docente = ? AND fechaClase = ?
            AND (horaIniciaClase < ? AND horaTerminaClase > ?)`;

  const params = [
    horario.docente,
    horario.fechaClase,
    horario.horaTerminaClase,
    horario.horaIniciaClase
  ];

  // Excluir el mismo registro cuando se actualiza
  if (excludeIdHorario) {
    sql += " AND idHorario <> ?";
    params.push(excludeIdHorario);
  }

  sql += " LIMIT 1";

  const [rows] = await connection.execute(sql, params);

  return rows.length > 0;
}

async function createHorario(connection, horario) {
  return withWriteLock(connection, async () => {
    // Validar conflictos
    const existeSolapamiento =
      await existsHorarioSolapado(connection, horario);
    if (existeSolapamiento) {
      const err = new Error(
        "El docente ya tiene una clase en ese horario");
      err.code = "HORARIO_SOLAPADO";
      throw err;
    }

    const [result] = await connection.execute(
      `
        INSERT INTO horariosdocentes
        (
          docente,
          facultad,
          carrera,
          materia,
          fechaClase,
          horaIniciaClase,
          horaTerminaClase
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        horario.docente,
        horario.facultad,
        horario.carrera,
        horario.materia,
        horario.fechaClase,
        horario.horaIniciaClase,
        horario.horaTerminaClase
      ]
    );

    const idHorario = result.insertId;
    return await findHorarioById(connection, idHorario);
  });
}

async function updateHorario(connection, idHorario, horario) {
  return withWriteLock(connection, async () => {
    const actual =
      await findHorarioById(connection, idHorario);
    if (!actual) {
      const err = new Error("Horario no encontrado");
      err.code = "NOT_FOUND";
      throw err;
    }

    const existeSolapamiento =
      await existsHorarioSolapado(connection,horario,
        { excludeIdHorario: idHorario }
      );
    if (existeSolapamiento) {
      const err = new Error(
        "El docente ya tiene una clase en ese horario");
      err.code = "HORARIO_SOLAPADO";
      throw err;
    }

    await connection.execute(
      `UPDATE horariosdocentes SET docente = ?, facultad = ?, carrera = ?, materia = ?, fechaClase = ?, horaIniciaClase = ?, horaTerminaClase = ? WHERE idHorario = ?`,
      [
        horario.docente,
        horario.facultad,
        horario.carrera,
        horario.materia,
        horario.fechaClase,
        horario.horaIniciaClase,
        horario.horaTerminaClase,
        idHorario
      ]
    );

    return await findHorarioById(connection, idHorario);
  });
}

async function deleteHorario(connection, idHorario) {
  return withWriteLock(connection, async () => {
    const actual =
      await findHorarioById(connection, idHorario);
    if (!actual) {
      const err = new Error("Horario no encontrado");
      err.code = "NOT_FOUND";
      throw err;
    }

    await connection.execute(
      `DELETE FROM horariosdocentes WHERE idHorario = ? LIMIT 1`,
      [idHorario]
    );
    return actual;
  });
}

async function listHorarios(connection) {

  const [rows] = await connection.execute(
    `
      SELECT
        idHorario,
        docente,
        facultad,
        carrera,
        materia,
        fechaClase,
        horaIniciaClase,
        horaTerminaClase
      FROM horariosdocentes
      ORDER BY fechaClase ASC, horaIniciaClase ASC
    `
  );

  return rows;
}

module.exports = {
  createHorario,
  updateHorario,
  deleteHorario,
  findHorarioById,
  listHorarios
};