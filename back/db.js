// Importa la librería 'mysql2' en su versión que utiliza promesas. Esto nos permite utilizar 'async/await' para esperar la respuesta de la base de datos de manera limpia y ordenada.
const mysql = require("mysql2/promise");

// Importa los datos de configuración (como el servidor, usuario, contraseña y base de datos) desde el archivo centralizado de configuración de variables.
const dbConfig = require("../variables/dbConfig");

// Creamos un "pool" o grupo de conexiones a la base de datos.
// Esto permite reutilizar conexiones existentes en lugar de abrir y cerrar una nueva conexión cada vez que el usuario hace una petición, haciendo que el sistema sea mucho más rápido.
const pool = mysql.createPool({
  host: dbConfig.host, // Establece la dirección del servidor de la base de datos (por ejemplo, '127.0.0.1' que es la propia maquina).
  port: dbConfig.port, // Establece el puerto de comunicación que utiliza MySQL (por defecto es el puerto 3306).
  user: dbConfig.user, // Establece el nombre de usuario de la base de datos que tiene permisos para acceder.
  password: dbConfig.password, // Establece la contraseña del usuario de la base de datos.
  database: dbConfig.database, // Especifica el nombre de la base de datos con la que vamos a interactuar ('horariosdocentes').
  ssl: dbConfig.ssl, // Configuración de seguridad SSL para proteger la información transmitida (si está activa).
  connectionLimit: 10, // Limita a un máximo de 10 conexiones activas simultáneamente para evitar que la base de datos colapse.
  waitForConnections: true, // Si no hay conexiones libres en el momento, el sistema esperará a que una se desocupe en lugar de fallar.
  queueLimit: 0, // Define el número máximo de peticiones esperando conexión. El valor 0 significa sin límite.
  namedPlaceholders: false // Si está en false, indica que usaremos el signo '?' para colocar los valores dentro de las consultas SQL de forma ordenada.
});

// Exporta el grupo de conexiones ('pool') para que pueda ser utilizado por otros archivos del servidor que necesiten consultar, insertar, modificar o eliminar datos de los horarios.
module.exports = { pool }; 