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

const DATOS_CIAF = {
  "Facultad de Ingeniería": {
      "Ingeniería de Sistemas": [
          "Programación y Servicios WEB","Bases de Datos","Redes y Comunicaciones",
          "Ingeniería de Software","Sistemas Operativos","Algoritmos y Programación"
      ],
      "Ingeniería Electrónica": [
          "Circuitos Eléctricos","Electrónica Analógica","Electrónica Digital",
          "Microcontroladores","Telecomunicaciones"
      ]
  },
  "Facultad de Ciencias Económicas": {
      "Administración de Empresas": [
          "Fundamentos de Administración","Contabilidad General","Economía General",
          "Marketing Empresarial","Gestión Humana"
      ],
      "Contaduría Pública": [
          "Contabilidad Financiera","Auditoría","Tributaria",
          "Costos y Presupuestos","Revisoría Fiscal"
      ]
  },
  "Facultad de Ciencias Jurídicas": {
      "Derecho": [
          "Derecho Civil","Derecho Comercial","Derecho Laboral",
          "Derecho Penal","Derecho Constitucional"
      ]
  },
  "Facultad de Ciencias de la Salud": {
      "Instrumentación Quirúrgica": [
          "Anatomía Humana","Fisiología","Técnicas Quirúrgicas","Esterilización","Bioseguridad"
      ],
      "Regencia de Farmacia": [
          "Farmacología","Química Orgánica","Legislación Farmacéutica",
          "Farmacovigilancia","Atención Farmacéutica"
      ]
  }
};
// evita caracteres Unicode inconsistentes
// evita espacios duplicados
// mejora comparaciones
// evita problemas con acentos
function normalizeString(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
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
  if (!DATOS_CIAF[facultad]) {
    errors.push("Facultad inválida");
  }
  if (!DATOS_CIAF[facultad][carrera]) {
    errors.push("Carrera inválida");
  }
  if (!DATOS_CIAF[facultad][carrera].includes(materia)) {
    errors.push("Materia inválida");
  }

  /* =========================
     VALIDACIÓN FECHA
  ========================= */

  if (!DATE_REGEX.test(fechaClase)) {
    errors.push("fechaClase inválida (YYYY-MM-DD)");
  } else {

    // Verifica que sea una fecha real
    const fecha = new Date(fechaClase);

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      errors.push(
        "No se pueden registrar horarios en fechas anteriores"
      );
    }

    if (isNaN(fecha.getTime())) {
      errors.push("fechaClase no válida");
    }
  }

  /* =========================
     VALIDACIÓN LÓGICA HORAS
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

    // Validar hora inicio < hora fin

    if (inicio >= fin) {

        errors.push(
            "La hora de inicio debe ser menor que la hora de finalización."
        );
    }

// Calcular duración
    const duracion = fin - inicio;

    if (duracion < 45) {
      errors.push(
        "La duración mínima de una clase es de 45 minutos"
      );
    }

    if (duracion > 360) {
      errors.push(
        "La duración máxima de una clase es de 6 horas"
      );
    }

    // La hora final debe ser mayor
    if (fin <= inicio) {
      errors.push(
        "La hora en que finaliza la clase no puede ser menor o igual a la hora de inicio."
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