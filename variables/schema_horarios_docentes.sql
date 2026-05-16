CREATE DATABASE IF NOT EXISTS `horarios_docentes` -- Crea la base de datos si no existe; evita error al re-ejecutar el script (idempotencia).
  CHARACTER SET utf8mb4 -- Define charset utf8mb4 para soportar todo Unicode (incluye emojis y caracteres extendidos).
  COLLATE utf8mb4_0900_ai_ci; -- Collation: comparaciones case-insensitive y acento-insensitive según configuración 0900 (MySQL 8).

USE `horarios_docentes`; -- Selecciona la base para que las instrucciones siguientes se apliquen ahí.

CREATE TABLE IF NOT EXISTS `horarios_docentes` ( -- Crea la tabla principal si no existe; permite re-ejecutar el script sin fallar.
  `idHorario` int NOT NULL AUTO_INCREMENT, -- PK surrogate; AUTO_INCREMENT genera IDs únicos.
  `docente` varchar(45) NOT NULL, -- Nombre completo del docente; se valida en backend y se usa como clave de negocio.
  `facultad` varchar(45) NOT NULL, -- Nombre completo de la facultad; longitud limitada para evitar almacenamiento excesivo y alinear con validación.
  `carrera` varchar(45) NOT NULL, -- Nombre completo de la carrera; límite de longitud.
  `materia` varchar(45) NOT NULL, -- Nombre completo de la materia; límite de longitud.
  `fechaClase` date NOT NULL, -- fecha con tipo de dato date, que no esté vacía.
  `horaIniciaClase` time NOT NULL, -- Hora con tipo de dato time.
  `horaTerminaClase` time NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Hora con tipo de dato time.
  PRIMARY KEY (`idHorario`), -- Define la llave primaria para indexar y garantizar unicidad del id.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; -- InnoDB: transacciones/locks; charset/collation coherentes con la BD.
