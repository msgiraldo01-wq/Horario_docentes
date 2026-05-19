/**
 * Validaciones backend para horarios docentes.
 *
 * Seguridad:
 * - Defensa en profundidad contra SQL Injection.
 * - Reduce riesgo de XSS persistente.
 * - Garantiza integridad lógica de horarios.
 */

// Letras, espacios y algunos caracteres comunes.
const TEXT_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]{2,80}$/;

// Formato YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Formato HH:MM (24 horas)
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizeString(value) {
  return String(value ?? "").trim();
}

function validateHorarioPayload(payload) {
  const docente = normalizeString(payload.docente);
  const facultad = normalizeString(payload.facultad);
  const carrera = normalizeString(payload.carrera);
  const materia = normalizeString(payload.materia);
  const fechaClase = normalizeString(payload.fechaClase);
  const horaIniciaClase = normalizeString(payload.horaIniciaClase);
  const horaTerminaClase = normalizeString(payload.horaTerminaClase);

  const errors = [];

  if (!TEXT_REGEX.test(docente)) {
    errors.push("docente inválido");
  }
  if (!TEXT_REGEX.test(facultad)) {
    errors.push("facultad inválida");
  }
  if (!TEXT_REGEX.test(carrera)) {
    errors.push("carrera inválida");
  }
  if (!TEXT_REGEX.test(materia)) {
    errors.push("materia inválida");
  }

  /* =========================
     VALIDACIÓN FECHA
  ========================= */

  if (!DATE_REGEX.test(fechaClase)) {
    errors.push("fechaClase inválida (YYYY-MM-DD)");
  } else {

    // Verifica que sea una fecha real
    const fecha = new Date(fechaClase);

    if (isNaN(fecha.getTime())) {
      errors.push("fechaClase no válida");
    }
  }

  /* =========================
     VALIDACIÓN HORAS
  ========================= */

  if (!TIME_REGEX.test(horaIniciaClase)) {
    errors.push("hora de inicio inválida, cambie la hora de inicio (HH:MM)");
  }
  if (!TIME_REGEX.test(horaTerminaClase)) {
    errors.push("hora de finalizacion inválida, cambie la hora de finalización (HH:MM)");
  }

  /* =========================
     VALIDACIÓN LÓGICA
  ========================= */

  if (
    TIME_REGEX.test(horaIniciaClase) &&
    TIME_REGEX.test(horaTerminaClase)
  ) {

    // Convierte horas a minutos
    const [h1, m1] = horaIniciaClase.split(":").map(Number);
    const [h2, m2] = horaTerminaClase.split(":").map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    // La hora final debe ser mayor
    if (fin <= inicio) {
      errors.push(
        "horaTerminaClase debe ser mayor que horaIniciaClase"
      );
    }
  }

  /* =========================
     RETORNO
  ========================= */

  return {
    ok: errors.length === 0,
    errors,
    value: {
      docente,
      facultad,
      carrera,
      materia,
      fechaClase,
      horaIniciaClase,
      horaTerminaClase
    }
  };
}

module.exports = {
  validateHorarioPayload
};