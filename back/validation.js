/**
 * Archivo de validaciones.
 * Aquí revisamos que los datos que envía el usuario (como nombres, materias, fechas y horas)
 * cumplan con las reglas del negocio antes de guardarlos en la base de datos.
 */

// Expresión regular para validar texto.
const TEXT_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]{2,80}$/; // Permite letras (con y sin tilde), la eñe, espacios, puntos, comas, apóstrofes y guiones. El texto debe tener entre 2 y 80 caracteres de largo.

// Expresión regular para validar fechas.
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // Debe cumplir con el formato Año-Mes-Día (4 dígitos para año, 2 para mes, 2 para día).

// Expresión regular para validar horas.
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // Debe cumplir con el formato de 24 horas (de 00:00 a 23:59).

// Diccionario (estructura de datos) con la información oficial de la institución (CIAF).
// Organiza las facultades, dentro de ellas las carreras, y dentro de cada carrera sus materias.
const DATOS_CIAF = {
  "Facultad de Ingeniería": {
    "Ingeniería de Sistemas": [
      "Programación y Servicios WEB", "Bases de Datos", "Redes y Comunicaciones",
      "Ingeniería de Software", "Sistemas Operativos", "Algoritmos y Programación"
    ],
    "Ingeniería Electrónica": [
      "Circuitos Eléctricos", "Electrónica Analógica", "Electrónica Digital",
      "Microcontroladores", "Telecomunicaciones"
    ]
  },
  "Facultad de Ciencias Económicas": {
    "Administración de Empresas": [
      "Fundamentos de Administración", "Contabilidad General", "Economía General",
      "Marketing Empresarial", "Gestión Humana"
    ],
    "Contaduría Pública": [
      "Contabilidad Financiera", "Auditoría", "Tributaria",
      "Costos y Presupuestos", "Revisoría Fiscal"
    ]
  },
  "Facultad de Ciencias Jurídicas": {
    "Derecho": [
      "Derecho Civil", "Derecho Comercial", "Derecho Laboral",
      "Derecho Penal", "Derecho Constitucional"
    ]
  },
  "Facultad de Ciencias de la Salud": {
    "Instrumentación Quirúrgica": [
      "Anatomía Humana", "Fisiología", "Técnicas Quirúrgicas", "Esterilización", "Bioseguridad"
    ],
    "Regencia de Farmacia": [
      "Farmacología", "Química Orgánica", "Legislación Farmacéutica",
      "Farmacovigilancia", "Atención Farmacéutica"
    ]
  }
};

/**
 * Función para limpiar y normalizar los textos ingresados.
 * Elimina espacios de más, caracteres invisibles problemáticos y limita el tamaño.
 */
function normalizeString(value) {
  return String(value ?? "") // Convierte el valor a texto. Si es nulo o indefinido, usa un texto vacío "".
    .normalize("NFC") // Normaliza el texto para que caracteres como las tildes se guarden de forma estándar.
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Elimina caracteres invisibles o de control que puedan causar errores ocultos.
    .trim() // Quita los espacios vacíos sobrantes al principio y al final del texto.
    .replace(/\s+/g, " ") // Reemplaza múltiples espacios consecutivos por un solo espacio.
    .slice(0, 80); // Recorta el texto para que no supere los 80 caracteres.
}

/**
 * Función principal para validar toda la información de un horario.
 * Recibe un objeto 'payload' con los datos enviados desde el formulario.
 */
function validateHorarioPayload(payload) {
  // Limpia y estandariza cada uno de los campos de texto recibidos.
  const docente = normalizeString(payload.docente);
  const facultad = normalizeString(payload.facultad);
  const carrera = normalizeString(payload.carrera);
  const materia = normalizeString(payload.materia);
  const fechaClase = normalizeString(payload.fechaClase);
  const horaIniciaClase = normalizeString(payload.horaIniciaClase);
  const horaTerminaClase = normalizeString(payload.horaTerminaClase);

  const errors = []; // Crea una lista vacía para ir guardando los errores que encontremos.

  // Valida que el nombre del docente tenga el formato de texto permitido.
  if (!TEXT_REGEX.test(docente)) {
    errors.push("docente inválido"); // Si falla, agrega un mensaje a la lista de errores.
  }

  // Valida que la facultad ingresada exista en nuestro diccionario institucional.
  if (!DATOS_CIAF[facultad]) {
    errors.push("Facultad inválida"); // Si no existe, agrega el error.
  }

  // Valida que la carrera ingresada exista dentro de la facultad seleccionada.
  if (!DATOS_CIAF[facultad] || !DATOS_CIAF[facultad][carrera]) {
    errors.push("Carrera inválida"); // Si no existe, agrega el error.
  }

  // Valida que la materia ingresada pertenezca a la carrera y facultad seleccionadas.
  if (!DATOS_CIAF[facultad] || !DATOS_CIAF[facultad][carrera] || !DATOS_CIAF[facultad][carrera].includes(materia)) {
    errors.push("Materia inválida"); // Si no pertenece, agrega el error.
  }

  // VALIDACION DE FECHA //
  // Verifica si la fecha tiene el formato correcto (Año-Mes-Día).
  if (!DATE_REGEX.test(fechaClase)) {
    errors.push("fechaClase inválida (YYYY-MM-DD)"); // Agrega error si el formato es incorrecto.
  } else {
    const fecha = new Date(fechaClase); // Si el formato es correcto, crea un objeto de fecha en JavaScript.

    const hoy = new Date(); // Obtiene la fecha y hora actuales.

    hoy.setHours(0, 0, 0, 0); // Ajusta la hora actual a las 00:00:00 (medianoche) para comparar solo los días sin importar las horas.
    fecha.setHours(0, 0, 0, 0); // Ajusta la hora de la clase a las 00:00:00 (medianoche).

    // Si la fecha elegida es menor que el día de hoy, significa que es una fecha pasada.
    if (fecha < hoy) {
      errors.push("No se pueden registrar horarios en fechas anteriores");
    }

    // Comprueba si el objeto de fecha es válido (por ejemplo, evita fechas imposibles como 30 de febrero).
    if (isNaN(fecha.getTime())) {
      errors.push("fechaClase no válida");
    }
  }

  // VALIDACION DE HORAS //
  // Verifica que tanto la hora de inicio como la de fin tengan el formato de hora correcto (HH:MM).
  if (
    TIME_REGEX.test(horaIniciaClase) &&
    TIME_REGEX.test(horaTerminaClase)
  ) {
    // Separa las horas y los minutos y los convierte a números. Ejemplo: "08:30" se convierte en [8, 30].
    const [h1, m1] = horaIniciaClase.split(":").map(Number);
    const [h2, m2] = horaTerminaClase.split(":").map(Number);

    const inicio = h1 * 60 + m1; // Convierte el tiempo total de inicio a minutos transcurridos desde el inicio del día.
    const fin = h2 * 60 + m2; // Convierte el tiempo total de fin a minutos transcurridos desde el inicio del día.

    // Si la hora de inicio es igual o mayor a la hora de fin, hay un error lógico.
    if (inicio >= fin) {
      errors.push("La hora de inicio debe ser menor que la hora de finalización.");
    }

    const duracion = fin - inicio; // Calcula la duración total de la clase restando el fin menos el inicio (en minutos).

    // Si la clase dura menos de 45 minutos, es muy corta y agrega un error.
    if (duracion < 45) {
      errors.push("La duración mínima de una clase es de 45 minutos");
    }

    // Si la clase dura más de 360 minutos (6 horas), es demasiado larga y agrega un error.
    if (duracion > 360) {
      errors.push("La duración máxima de una clase es de 6 horas");
    }

    // Re-verifica si la hora final no es menor o igual al inicio (doble validación por seguridad).
    if (fin <= inicio) {
      errors.push("La hora en que finaliza la clase no puede ser menor o igual a la hora de inicio.");
    }
  }

  // RETORNO //
  // Retorna un objeto indicando si la validación pasó con éxito y los datos limpios.
  return {
    // 'ok' será verdadero (true) si no se encontró ningún error en la lista.
    ok: errors.length === 0,
    errors, // Lista de mensajes de error encontrados (estará vacía si todo está correcto).
    value: { // Objeto con los datos ya limpios y normalizados para ser guardados con seguridad.
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

// Exporta la función de validación para que pueda usarse al recibir peticiones en el servidor.
module.exports = {
  validateHorarioPayload
};