/**
 * Repositorio de horarios de docentes (Acceso a la base de datos).
 * Este archivo se encarga de realizar las operaciones directas con MySQL (Crear, Leer, Actualizar y Eliminar),
 * asegurando que no se crucen los horarios y que los datos sean correctos antes de guardarlos.
 */

/**
 * Función auxiliar para limpiar los espacios en blanco de un texto.
 * Quita espacios al inicio/final y reduce múltiples espacios seguidos a uno solo.
 */
function limpiarTexto(valor) {
  // Convierte el valor a texto (si no existe, usa texto vacío), quita espacios laterales y reemplaza espacios múltiples.
  return String(valor || "")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Función para comprobar si los datos de un horario son correctos antes de realizar cambios en la base de datos.
 * Lanza un error detallado si alguna regla no se cumple.
 */
function validarHorario(horario) {
  // Limpia los textos de los campos principales quitando espacios innecesarios.
  horario.docente = limpiarTexto(horario.docente);
  horario.facultad = limpiarTexto(horario.facultad);
  horario.carrera = limpiarTexto(horario.carrera);
  horario.materia = limpiarTexto(horario.materia);

  // Comprueba si alguno de los campos obligatorios está vacío.
  if (
    !horario.docente ||
    !horario.facultad ||
    !horario.carrera ||
    !horario.materia ||
    !horario.fechaClase ||
    !horario.horaIniciaClase ||
    !horario.horaTerminaClase
  ) {
    const err = new Error("Todos los campos son obligatorios"); // Si falta algún campo, crea un error con un mensaje descriptivo.
    err.code = "VALIDATION_ERROR"; // Le asigna un código identificador al error para poder reconocerlo.
    throw err; // Interrumpe la ejecución lanzando el error.
  }

  const fecha = new Date(horario.fechaClase); // Intenta crear un objeto de fecha con el valor recibido.

  // Si la fecha no es un número o valor de tiempo válido (ejemplo: letras o fechas inexistentes).
  if (Number.isNaN(fecha.getTime())) {
    const err = new Error("Fecha inválida"); // Crea un error de fecha no válida.
    err.code = "INVALID_DATE"; // Le asigna un código identificador al error.
    throw err; // Interrumpe la ejecución lanzando el error.
  }

  // Si la hora de inicio de la clase es igual o mayor a la hora de finalización.
  if (horario.horaIniciaClase >= horario.horaTerminaClase) {
    const err = new Error("La hora inicial debe ser menor a la final"); // Crea un error indicando que el rango de tiempo es ilógico.
    err.code = "INVALID_TIME_RANGE"; // Le asigna un código identificador al error.
    throw err; // Interrumpe la ejecución lanzando el error.
  }

  // Separa las horas y minutos de inicio y finalización para calcular la duración.
  const [h1, m1] = horario.horaIniciaClase.split(":").map(Number);
  const [h2, m2] = horario.horaTerminaClase.split(":").map(Number);

  // Convierte las horas de inicio y fin a minutos totales transcurridos en el día.
  const inicio = h1 * 60 + m1;
  const fin = h2 * 60 + m2;
  const duracion = fin - inicio; // Resta el tiempo final menos el inicial para saber cuántos minutos dura la clase.

  // Si la clase dura menos de 45 minutos.
  if (duracion < 45) {
    const err = new Error("La clase debe durar mínimo 45 minutos"); // Crea un error indicando la duración mínima.
    err.code = "INVALID_MIN_DURATION"; // Le asigna un código identificador al error.
    throw err; // Interrumpe la ejecución lanzando el error.
  }

  // Si la clase dura más de 360 minutos (6 horas).
  if (duracion > 360) {
    const err = new Error("La clase no puede durar más de 6 horas"); // Crea un error indicando la duración máxima permitida.
    err.code = "INVALID_MAX_DURATION"; // Le asigna un código identificador al error.
    throw err; // Interrumpe la ejecución lanzando el error.
  }
}

/**
 * Función de seguridad para bloquear temporalmente la tabla al escribir.
 * Evita que dos personas registren un horario al mismo tiempo en el mismo segundo y se crucen los datos.
 * - 'connection': La conexión activa de la base de datos.
 * - 'fn': La función o tarea que queremos realizar de forma segura (ej. insertar o actualizar).
 */
async function withWriteLock(connection, fn) {
  // Inicia una transacción, que es una serie de instrucciones SQL que deben ejecutarse todas con éxito o ninguna.
  await connection.query("START TRANSACTION");

  try {
    // Bloquea la tabla para escrituras externas. Nadie más puede modificarla mientras estemos trabajando aquí.
    await connection.query("LOCK TABLES horarios_docentes WRITE");

    // Ejecuta la función o tarea que le pasamos como parámetro y guarda el resultado.
    const result = await fn();

    // Si todo salió bien, confirma y guarda de forma definitiva los cambios en la base de datos.
    await connection.query("COMMIT");

    // Devuelve el resultado de la tarea.
    return result;

  } catch (err) {
    try {
      // Si algo falla, cancela todos los cambios hechos durante esta transacción para evitar datos corruptos.
      await connection.query("ROLLBACK");
    } catch { }

    // Lanza nuevamente el error para que sea manejado por el servidor.
    throw err;

  } finally {
    try {
      // Siempre, al final de todo (tenga éxito o falle), libera el bloqueo de la tabla para que otros puedan usarla.
      await connection.query("UNLOCK TABLES");
    } catch { }
  }
}

/**
 * Función para buscar un horario específico por su ID único.
 * - 'connection': Conexión activa a la base de datos.
 * - 'idHorario': El identificador numérico de la clase que queremos buscar.
 */
async function findHorarioById(connection, idHorario) {
  // Ejecuta la consulta SQL para seleccionar todos los campos del horario que coincida con el ID.
  const [rows] = await connection.execute(
    `SELECT idHorario, docente, facultad, carrera, materia, fechaClase, horaIniciaClase, horaTerminaClase
      FROM horarios_docentes
      WHERE idHorario = ? LIMIT 1
    `,
    [idHorario] // El signo '?' se reemplaza de forma segura por el valor de 'idHorario'.
  );

  return rows[0] ?? null; // Si encuentra el registro, devuelve la primera fila obtenida; si no, devuelve null (vacío).
}

/**
 * Función para comprobar si un docente ya tiene una clase registrada que se cruce (solape) con el horario propuesto.
 * - 'connection': Conexión activa a la base de datos.
 * - 'horario': El nuevo horario que se quiere registrar.
 * - 'excludeIdHorario': (Opcional) El ID del horario que estamos editando, para no compararlo consigo mismo.
 */
async function existsHorarioSolapado( //[REQ. FRONT #13]
  connection,
  horario,
  { excludeIdHorario } = {}
) {
  // Consulta SQL para buscar si hay registros con el mismo docente, en la misma fecha, y donde el rango de horas de la clase nueva coincida o se cruce con una existente.
  let sql = `SELECT 1 AS ok FROM horarios_docentes WHERE docente = ? AND fechaClase = ? AND (horaIniciaClase < ? AND horaTerminaClase > ?)`;

  // Valores seguros que reemplazarán a los signos '?' en la consulta SQL.
  const params = [
    horario.docente,
    horario.fechaClase,
    horario.horaTerminaClase, // Reemplaza al tercer '?'
    horario.horaIniciaClase   // Reemplaza al cuarto '?'
  ];

  // Si se indicó excluir un ID (porque estamos editando y no queremos comparar el horario actual con su versión anterior).
  if (excludeIdHorario) {
    sql += " AND idHorario <> ?"; // Añade a la consulta SQL que ignore el ID que estamos editando.
    params.push(excludeIdHorario); // Agrega el ID a la lista de parámetros.
  }

  sql += " LIMIT 1"; // Limita la búsqueda a un solo resultado para que sea más rápida.

  // Ejecuta la consulta SQL con los parámetros definidos de forma segura.
  const [rows] = await connection.execute(
    sql,
    params
  );

  // Devuelve verdadero (true) si se encontró al menos un registro que se cruza; de lo contrario, falso (false).
  return rows.length > 0;
}

/**
 * Función para registrar un nuevo horario en la base de datos de manera segura.
 * - 'connection': Conexión activa a la base de datos.
 * - 'horario': Objeto con los datos del nuevo horario.
 */
async function createHorario(connection, horario) {
  // Ejecuta el proceso asegurando un bloqueo de escritura para evitar cruces por doble registro simultáneo.
  return withWriteLock(connection, async () => {
    validarHorario(horario); // Valida que los datos cumplan con el formato y las reglas de negocio.

    // Revisa si la clase propuesta se cruza con otra clase que ya tenga el docente.
    const existeSolapamiento = //[REQ. FRONT #13]
      await existsHorarioSolapado(
        connection,
        horario
      );

    // Si hay un cruce de horarios:
    if (existeSolapamiento) {
      const err = new Error("El docente ya tiene una clase en ese horario"); // Crea un error informando la situación.
      err.code = "HORARIO_SOLAPADO"; // Asigna el código identificador de cruce de horario.
      throw err; // Interrumpe la tarea y lanza el error.
    }

    // Ejecuta la instrucción SQL para insertar el nuevo horario.
    const [result] = await connection.execute(
      `INSERT INTO horarios_docentes (
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

    // Busca y retorna el horario recién creado utilizando el ID generado por la base de datos ('result.insertId').
    return await findHorarioById(
      connection,
      result.insertId
    );
  });
}

/**
 * Función para actualizar o modificar los datos de un horario existente.
 * - 'connection': Conexión activa a la base de datos.
 * - 'idHorario': El ID del horario que queremos modificar.
 * - 'horario': Los nuevos datos que queremos guardar.
 */
async function updateHorario(
  connection,
  idHorario,
  horario
) {
  // Ejecuta la modificación de forma segura bloqueando la tabla temporalmente.
  return withWriteLock(connection, async () => {
    validarHorario(horario); // Valida los nuevos datos enviados.

    // Busca si realmente existe el horario que queremos modificar.
    const actual =
      await findHorarioById(
        connection,
        idHorario
      );

    // Si el horario no existe en la base de datos:
    if (!actual) {
      const err = new Error("Horario no encontrado"); // Crea y lanza un error de no encontrado.
      err.code = "NOT_FOUND";
      throw err;
    }

    // Verifica si los nuevos datos de hora y fecha chocan con otra clase del mismo docente (excluyendo el ID actual, ya que el docente puede mantener el mismo horario).
    const existeSolapamiento = //[REQ. FRONT #13]
      await existsHorarioSolapado(
        connection,
        horario,
        {
          excludeIdHorario: idHorario
        }
      );

    // Si el nuevo horario choca con otra clase del docente:
    if (existeSolapamiento) {
      const err = new Error("El docente ya tiene una clase en ese horario"); // Crea y lanza un error indicando el cruce.
      err.code = "HORARIO_SOLAPADO";
      throw err;
    }

    // Ejecuta la instrucción SQL para actualizar los datos en el registro correspondiente.
    await connection.execute(
      `UPDATE horarios_docentes
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
        idHorario // Especifica cuál registro se va a modificar mediante su ID.
      ]
    );

    // Retorna el horario modificado con sus datos actualizados.
    return await findHorarioById(
      connection,
      idHorario
    );
  });
}

/**
 * Función para eliminar un horario registrado.
 * - 'connection': Conexión activa a la base de datos.
 * - 'idHorario': El ID único del horario a eliminar.
 */
async function deleteHorario(
  connection,
  idHorario
) {
  // Ejecuta la eliminación de manera segura bloqueando la tabla temporalmente.
  return withWriteLock(connection, async () => {
    // Verifica si el horario existe antes de intentar borrarlo.
    const actual =
      await findHorarioById(
        connection,
        idHorario
      );

    // Si no existe:
    if (!actual) {
      const err = new Error("Horario no encontrado"); // Crea y lanza un error.
      err.code = "NOT_FOUND";
      throw err;
    }

    // Ejecuta la instrucción SQL para eliminar permanentemente el registro que coincida con el ID.
    await connection.execute(
      `DELETE FROM horarios_docentes
        WHERE idHorario = ?
        LIMIT 1
      `,
      [idHorario]
    );
    return actual; // Devuelve los datos del horario que acaba de ser eliminado (útil para mostrar notificaciones).
  });
}

/**
 * Función para listar todos los horarios de docentes guardados en la base de datos.
 * - 'connection': Conexión activa a la base de datos.
 */
async function listHorarios(connection) {
  // Ejecuta la consulta SQL para traer todos los registros.
  const [rows] = await connection.execute(
    `SELECT idHorario, docente, facultad, carrera, materia, fechaClase, horaIniciaClase, horaTerminaClase
      FROM horarios_docentes
      ORDER BY fechaClase ASC, horaIniciaClase ASC
    ` // Los ordena cronológicamente: primero por fecha y luego por hora de inicio.
  );

  return rows; // Devuelve la lista completa de filas (registros) encontrados.
}

// Exporta todas las funciones de este repositorio para que el servidor pueda usarlas.
module.exports = {
  createHorario,
  updateHorario,
  deleteHorario,
  findHorarioById,
  listHorarios
};