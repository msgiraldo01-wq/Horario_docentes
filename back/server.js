const express = require("express");
const { pool } = require("./db");

const {
    createHorario,
    updateHorario,
    deleteHorario,
    findHorarioById,
    listHorarios
} = require("./horariosDocentesRepository");

const {
    validateHorarioPayload
} = require("./validation");

const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SERVIR FRONTEND
========================= */

app.use(express.static(path.join(__dirname, "../front")));

/* =========================
   RUTA PRINCIPAL
========================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../front/index.html"));
});

/* =========================
   API HEALTH
========================= */

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        message: "Servidor funcionando correctamente"
    });
});

/* =========================
   LISTA TEMPORAL
========================= */

/*let horarios = [];

/* =========================
   CREAR HORARIO
========================= */

app.post("/api/horarios", async (req, res) => {

    const validation =
        validateHorarioPayload(req.body);

    if (!validation.ok) {

        return res.status(400).json({
            errors: validation.errors
        });
    }

    const connection = await pool.getConnection();

    try {

        const horario =
            await createHorario(
                connection,
                validation.value
            );

        res.json({
            message: "Registro creado.",
            horario
        });

    } catch (error) {

        if (error.code === "HORARIO_SOLAPADO") {

            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error interno"
        });

    } finally {

        connection.release();

    }

});

/* =========================
   LISTAR
========================= */

app.get("/api/horarios/list", async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const horarios =
            await listHorarios(connection);

        res.json({
            horarios
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error interno"
        });

    } finally {

        connection.release();

    }

});

/* =========================
   BUSCAR POR ID
========================= */

app.get("/api/horarios/byidHorario", async (req, res) => {

    const { idHorario } = req.query;

    if (!idHorario) {

        return res.status(400).json({
            message: "idHorario inválido"
        });
    }

    const connection = await pool.getConnection();

    try {

        const horario =
            await findHorarioById(
                connection,
                idHorario
            );

        if (!horario) {

            return res.status(404).json({
                message: "Horario No existe"
            });
        }

        res.json(horario);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error interno"
        });

    } finally {

        connection.release();

    }

});

/* =========================
   EDITAR
========================= */

app.put("/api/horarios/:id", async (req, res) => {

    const validation =
        validateHorarioPayload(req.body);

    if (!validation.ok) {

        return res.status(400).json({
            errors: validation.errors
        });
    }

    const connection = await pool.getConnection();

    try {

        const horario =
            await updateHorario(
                connection,
                req.params.id,
                validation.value
            );

        res.json({
            message: "Horario editado.",
            horario
        });

    } catch (error) {

        if (error.code === "NOT_FOUND") {

            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "HORARIO_SOLAPADO") {

            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error interno"
        });

    } finally {

        connection.release();

    }

});

/* =========================
   BORRAR
========================= */

app.delete("/api/horarios/by-idHorario", async (req, res) => {

    const { idHorario } = req.body;

    if (!idHorario) {

        return res.status(400).json({
            message: "idHorario inválido"
        });
    }

    const connection = await pool.getConnection();

    try {

        await deleteHorario(
            connection,
            idHorario
        );

        res.json({
            message: "Horario borrado."
        });

    } catch (error) {

        if (error.code === "NOT_FOUND") {

            return res.status(404).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Error interno"
        });

    } finally {

        connection.release();

    }

});

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(8080, "127.0.0.1", async () => {

    console.log("Servidor iniciado:");
    console.log("http://127.0.0.1:8080");

    try {

        const connection = await pool.getConnection();

        console.log("✅ MYSQL CONECTADO CORRECTAMENTE");

        connection.release();

    } catch (error) {

        console.error("❌ ERROR MYSQL:");
        console.error(error.message);

    }

});