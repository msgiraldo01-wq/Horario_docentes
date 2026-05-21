/**
 * Repositorio de horarios docentes (CRUD)
 * Compatible con appHorarios.js
 */

function limpiarTexto(valor) {
  return String(valor || "")
    .trim()
    .replace(/\s+/g, " ");
}

function validarHorario(horario) {

  horario.docente = limpiarTexto(horario.docente);
  horario.facultad = limpiarTexto(horario.facultad);
  horario.carrera = limpiarTexto(horario.carrera);
  horario.materia = limpiarTexto(horario.materia);

  if (
    !horario.docente ||
    !horario.facultad ||
    !horario.carrera ||
    !horario.materia ||
    !horario.fechaClase ||
    !horario.horaIniciaClase ||
    !horario.horaTerminaClase
  ) {

    const err = new Error(
      "Todos los campos son obligatorios"
    );

    err.code = "VALIDATION_ERROR";

    throw err;
  }

  // Validar fechas
  const fecha = new Date(horario.fechaClase);

  if (Number.isNaN(fecha.getTime())) {

    const err = new Error("Fecha inválida");

    err.code = "INVALID_DATE";

    throw err;
  }

  // Validar horas
  if (
    horario.horaIniciaClase >= horario.horaTerminaClase
  ) {

    const err = new Error(
      "La hora inicial debe ser menor a la final"
    );

    err.code = "INVALID_TIME_RANGE";

    throw err;
  }
  const [h1, m1] = horario.horaIniciaClase
    .split(":")
    .map(Number);

  const [h2, m2] = horario.horaTerminaClase
    .split(":")
    .map(Number);

  const inicio = h1 * 60 + m1;
  const fin = h2 * 60 + m2;
  const duracion = fin - inicio;

  if (duracion < 45) {
    const err = new Error(
      "La clase debe durar mínimo 45 minutos"
    );

    err.code = "INVALID_MIN_DURATION";

    throw err;
  }
  if (duracion > 360) {
    const err = new Error(
      "La clase no puede durar más de 6 horas"
    );

    err.code = "INVALID_MAX_DURATION";

    throw err;
  }
}

async function withWriteLock(connection, fn) {

  await connection.query("START TRANSACTION");

  try {

    await connection.query(
      "LOCK TABLES horarios_docentes WRITE"
    );

    const result = await fn();

    await connection.query("COMMIT");

    return result;

  } catch (err) {

    try {

      await connection.query("ROLLBACK");

    } catch {}

    throw err;

  } finally {

    try {

      await connection.query("UNLOCK TABLES");

    } catch {}
  }
}

async function findHorarioById(connection, idHorario) {

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
      FROM horarios_docentes
      WHERE idHorario = ?
      LIMIT 1
    `,
    [idHorario]
  );

  return rows[0] ?? null;
}

async function existsHorarioSolapado(
  connection,
  horario,
  { excludeIdHorario } = {}
) {

  let sql = `
    SELECT 1 AS ok
    FROM horarios_docentes
    WHERE docente = ?
      AND fechaClase = ?
      AND (
        horaIniciaClase < ?
        AND horaTerminaClase > ?
      )
  `;

  const params = [
    horario.docente,
    horario.fechaClase,
    horario.horaTerminaClase,
    horario.horaIniciaClase
  ];

  if (excludeIdHorario) {

    sql += " AND idHorario <> ?";

    params.push(excludeIdHorario);
  }

  sql += " LIMIT 1";

  const [rows] = await connection.execute(
    sql,
    params
  );

  return rows.length > 0;
}

async function createHorario(connection, horario) {

  return withWriteLock(connection, async () => {

    validarHorario(horario);

    const existeSolapamiento =
      await existsHorarioSolapado(
        connection,
        horario
      );

    if (existeSolapamiento) {

      const err = new Error(
        "El docente ya tiene una clase en ese horario"
      );

      err.code = "HORARIO_SOLAPADO";

      throw err;
    }

    const [result] = await connection.execute(
      `
        INSERT INTO horarios_docentes
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

    return await findHorarioById(
      connection,
      result.insertId
    );
  });
}

async function updateHorario(
  connection,
  idHorario,
  horario
) {

  return withWriteLock(connection, async () => {

    validarHorario(horario);

    const actual =
      await findHorarioById(
        connection,
        idHorario
      );

    if (!actual) {

      const err = new Error(
        "Horario no encontrado"
      );

      err.code = "NOT_FOUND";

      throw err;
    }

    const existeSolapamiento =
      await existsHorarioSolapado(
        connection,
        horario,
        {
          excludeIdHorario: idHorario
        }
      );

    if (existeSolapamiento) {

      const err = new Error(
        "El docente ya tiene una clase en ese horario"
      );

      err.code = "HORARIO_SOLAPADO";

      throw err;
    }

    await connection.execute(
      `
        UPDATE horarios_docentes
        SET
          docente = ?,
          facultad = ?,
          carrera = ?,
          materia = ?,
          fechaClase = ?,
          horaIniciaClase = ?,
          horaTerminaClase = ?
        WHERE idHorario = ?
      `,
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

    return await findHorarioById(
      connection,
      idHorario
    );
  });
}

async function deleteHorario(
  connection,
  idHorario
) {

  return withWriteLock(connection, async () => {

    const actual =
      await findHorarioById(
        connection,
        idHorario
      );

    if (!actual) {

      const err = new Error(
        "Horario no encontrado"
      );

      err.code = "NOT_FOUND";

      throw err;
    }

    await connection.execute(
      `
        DELETE FROM horarios_docentes
        WHERE idHorario = ?
        LIMIT 1
      `,
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
      FROM horarios_docentes
      ORDER BY
        fechaClase ASC,
        horaIniciaClase ASC
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