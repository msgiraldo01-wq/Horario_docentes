/**
 * Archivo principal del servidor (Backend).
 * Aquí configuramos e iniciamos nuestro servidor web (usando Express) para que escuche
 * las peticiones del navegador web (Frontend) y se conecte de forma segura a MySQL.
 */

const express = require("express"); // Importa la librería 'express', que nos ayuda a crear rutas web y un servidor de forma muy sencilla.
const { pool } = require("./db"); // Importa el grupo de conexiones a la base de datos ('pool') desde el archivo './db'.

// Importa las funciones del repositorio que realizan las operaciones en la base de datos.
const {
    createHorario,      // Para guardar un nuevo horario.
    updateHorario,      // Para modificar un horario existente.
    deleteHorario,      // Para borrar un horario.
    findHorarioById,    // Para buscar un horario específico por su ID.
    listHorarios        // Para traer todos los horarios registrados.
} = require("./horariosDocentesRepository");

// Importa la función de validación para verificar que los datos cumplan con las reglas institucionales.
const {
    validateHorarioPayload
} = require("./validation");

const path = require("path"); // Importa la librería 'path', útil para manejar rutas de archivos y carpetas dentro de la maquina.

const cors = require("cors"); // Importa la librería 'cors', que permite que el frontend y el backend se comuniquen de forma segura aunque provengan de puertos o direcciones ligeramente distintas.
const app = express(); // Crea la aplicación o servidor web llamando a la función express().

app.use(cors()); // Activa el sistema CORS en el servidor para permitir conexiones desde el navegador de manera segura.

app.use(express.json()); // Configura el servidor para que pueda entender y procesar información enviada en formato JSON (que es el formato estándar para enviar datos desde formularios en la web).

// SERVIR FRONTEND: Compartir los archivos visuales del aplicativo //
// [Req. Back #3] Servir la página del front al abrir GET / y los archivos de JS/CSS estáticos
app.use(express.static(path.join(__dirname, "../front"))); // Le indica al servidor que la carpeta '../front' contiene los archivos visuales (HTML, JS, CSS) y que los exponga de manera pública para que cualquier navegador pueda verlos.

// RUTA PRINCIPAL: Pagina de inicio //

// Cuando un usuario entra a la dirección principal (ej. http://localhost:8080/), el servidor responde enviando el archivo de la interfaz visual 'index.html'.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../front/index.html"));
});


// API HEALTH (Comprobación de funcionamiento del servidor) //

// [Req. Back #4] Endpoint de verificación del sistema: GET /api/health (verifica conexión a la base de datos)
app.get("/api/health", async (req, res) => {
    try {
        const connection = await pool.getConnection();
        // Simple ping query
        await connection.query("SELECT 1");
        connection.release();
        res.json({ ok: true, message: "Servidor funcionando y DB conectada" });
    } catch (error) {
        console.error("Health check DB error:", error);
        res.status(500).json({ ok: false, message: "Error de conexión a la base de datos" });
    }
});

// API: CREAR HORARIO (Guardar una nueva clase) //

// [Req. Back #15] Permitir crear un Horario usando: POST /api/horarios.
// [Req. Gral #1] Realizar CRUD desde el front a la base de datos.
app.post("/api/horarios", async (req, res) => { 

    // [Req. Back #16] El backend debe validar los datos obligatorios del Horario antes de guardarlos.
    const validation = validateHorarioPayload(req.body); // Valida que la información de la clase sea correcta usando las reglas de validación.

    // Si la validación detectó algún error (como datos incompletos o nombres incorrectos):
    if (!validation.ok) {
        // [Req. Back #17] Si la validación falla, el backend debe devolver una lista de errores para que el front los muestre.
        return res.status(400).json({
            errors: validation.errors
        });
    }

    // Solicita una conexión libre del grupo de conexiones a la base de datos ('pool').
    const connection = await pool.getConnection();
    try {
        // Intenta guardar el nuevo horario usando los datos ya validados y limpios.
        const horario = await createHorario(
            connection,
            validation.value
        );

        // [Req. Back #18] Si el Horario se crea correctamente, el backend debe responder confirmando la creación ("Registro creado.").
        res.json({
            message: "Registro creado.",
            horario
        });

    } catch (error) {
        // [Req. Back #19] Si se intenta crear un Horario duplicado/solapado, responde con conflicto.
        if (error.code === "HORARIO_SOLAPADO") {
            // Responde con un código 409 (Conflicto) y el mensaje de error correspondiente.
            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error); // Si es otro tipo de error inesperado, lo muestra en la consola del servidor para que el programador lo revise.

        // [Req. Back #27] Responder con un mensaje general de "Error interno" (sin detalles técnicos) en cualquier operación con error inesperado.
        res.status(500).json({
            message: "Error interno"
        });

    } finally {
        connection.release(); // Importante: Libera y devuelve la conexión al grupo para que otras personas puedan usarla.
    }
});

// API: LISTAR HORARIOS (Ver todas las clases registradas) //

// [Req. Back #13] 
app.get("/api/horarios/list", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const horarios = await listHorarios(connection);
        res.json({ horarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno" });
    } finally {
        connection.release();
    }
});

// [Req. Back #14] Endpoint básico de listado sin filtros avanzados
app.get("/api/horarios/list-basic", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const horarios = await listHorarios(connection);
        // Return only essential fields
        const basic = horarios.map(h => ({
            idHorario: h.idHorario,
            docente: h.docente,
            fechaClase: h.fechaClase,
            horaIniciaClase: h.horaIniciaClase,
            horaTerminaClase: h.horaTerminaClase
        }));
        res.json({ horarios: basic });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno" });
    } finally {
        connection.release();
    }
});

// [Req. Back #9, #19] Endpoint para validar solapamiento de horarios sin crear/editar
app.get("/api/horarios/check", async (req, res) => { 
    const { docente, fechaClase, horaIniciaClase, horaTerminaClase, excludeIdHorario } = req.query;
    if (!docente || !fechaClase || !horaIniciaClase || !horaTerminaClase) { //[Req. Back #10]
        return res.status(400).json({ message: "Parámetros incompletos" });
    }
    const horario = { docente, fechaClase, horaIniciaClase, horaTerminaClase };
    const connection = await pool.getConnection();
    try {
        const exists = await existsHorarioSolapado(connection, horario, { excludeIdHorario });
        res.json({ overlap: exists }); //[Req. Back #11]
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno" });
    } finally {
        connection.release();
    }
});

// API: BUSCAR HORARIO POR ID (Obtener detalles de una clase específica) //

// [Req. Back #5] Consultar un Horario por idHorario 
app.get("/api/horarios/byidHorario", async (req, res) => {
    const { idHorario } = req.query;
    if (!idHorario) {
        return res.status(400).json({ message: "idHorario inválido" }); //[Req. Back #6]
    }
    const connection = await pool.getConnection();
    try {
        const horario = await findHorarioById(connection, idHorario);
        if (!horario) {
            return res.status(404).json({ message: "Horario No existe" }); //[Req. Back #7]
        }
        res.json(horario);//[Req. Back #8]
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno" });
    } finally {
        connection.release();
    }
});

// API: EDITAR HORARIO (Modificar una clase existente) //

// [Req. Back #20] El sistema debe permitir editar un Horario usando: PUT /api/horarios/:id.
app.put("/api/horarios/:id", async (req, res) => {

    // [Req. Back #22] El backend debe validar nuevamente los datos antes de actualizar.
    const validation = validateHorarioPayload(req.body);

    // Si la validación falla:
    if (!validation.ok) {
        return res.status(400).json({
            errors: validation.errors
        });
    }

    const connection = await pool.getConnection(); // Obtiene una conexión a la base de datos.

    try {
        // Intenta actualizar los datos usando el ID proporcionado en la URL y los nuevos datos validados.
        const horario = await updateHorario(
            connection,
            req.params.id,
            validation.value
        );

        // [Req. Back #23] Si la edición es correcta, el backend debe responder confirmando la actualización ("Horario editado.").
        res.json({
            message: "Horario editado.",
            horario
        });

    } catch (error) {
        // [Req. Back #21] Si el Horario a editar no existe, el backend debe responder que no fue encontrado (status 404).
        if (error.code === "NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        // Si los nuevos horarios chocan con otra clase del docente:
        if (error.code === "HORARIO_SOLAPADO") {
            return res.status(409).json({
                message: error.message
            });
        }

        // [Req. Back #27] Responder con un mensaje general de "Error interno" (sin detalles técnicos) en cualquier operación con error inesperado.
        console.error(error);
        res.status(500).json({
            message: "Error interno"
        });

    } finally {
        connection.release(); // Libera la conexión de la base de datos.
    }
});

// API: BORRAR HORARIO (Eliminar una clase) //

// [Req. Back #24] El sistema debe permitir eliminar un Horario usando: DELETE /api/horarios/by-idHorario enviando un JSON con el dato de búsqueda.
app.delete("/api/horarios/byidHorario", async (req, res) => {

    const { idHorario } = req.body; // Extrae el ID del horario que se quiere borrar.

    // Si no se especificó un ID:
    if (!idHorario) {
        return res.status(400).json({
            message: "idHorario inválido"
        });
    }

    const connection = await pool.getConnection(); // Obtiene una conexión a la base de datos.

    try {
        // Llama a la función del repositorio para eliminar el horario de la base de datos.
        await deleteHorario(
            connection,
            idHorario
        );

        // [Req. Back #26] Si se elimina correctamente, el backend debe responder confirmando el borrado ("Horario borrado.").
        res.json({
            message: "Horario borrado."
        });

    } catch (error) {
        // [Req. Back #25] Si el Horario no existe, el backend debe responder que no existe (status 404).
        if (error.code === "NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        // [Req. Back #27] Responder con un mensaje general de "Error interno" (sin detalles técnicos) en cualquier operación con error inesperado.
        console.error(error);
        res.status(500).json({
            message: "Error interno"
        });

    } finally {
        connection.release(); // Libera la conexión de la base de datos.
    }
});

// INICIAR EL SERVIDOR (Poner el backend en escucha) //

// [Req. Back #1] El servidor debe iniciar en http://127.0.0.1:8080/ (solo loopback/local).
app.listen(8080, "127.0.0.1", async () => {

    // Muestra un mensaje en consola indicando que el servidor arrancó con éxito.
    console.log("Servidor iniciado:");
    console.log("http://127.0.0.1:8080");

    try {
        const connection = await pool.getConnection(); // Intenta obtener una conexión a la base de datos nada más iniciar, para comprobar que MySQL está activo.

        console.log("✅ MYSQL CONECTADO CORRECTAMENTE"); // Si se conecta con éxito, muestra un mensaje de verificación verde.
        connection.release(); // Libera la conexión de prueba de inmediato.

    } catch (error) {
        console.error("❌ ERROR MYSQL:"); // Si MySQL no responde o las credenciales están mal, muestra un mensaje de error detallado.
        console.error(error.message);
    }
});