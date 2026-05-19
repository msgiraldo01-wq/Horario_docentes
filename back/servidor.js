const express = require("express");
const { connectionPool } = require("./conectorDb");

const { registerSchedule, editSchedule, removeSchedule, searchScheduleById, fetchSchedules } = require("./repositorioHorarios");

const { checkSchedulePayload } = require("./validadorInput");

const path = require("path");
const cors = require("cors");

const serverApplication = express();

serverApplication.use(cors());
serverApplication.use(express.json());

/* =========================
   SERVIR FRONTEND
========================= */

serverApplication.use(express.static(path.join(__dirname, "../front")));

/* =========================
   RUTA PRINCIPAL
========================= */

serverApplication.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../front/home.html"));
});

/* =========================
   API HEALTH
========================= */

serverApplication.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        message: "Servidor funcionando correctamente"
    });
});

/* =========================
   CREAR HORARIO
========================= */

serverApplication.post("/api/horarios", async (req, res) => {

    const validation =
        checkSchedulePayload(req.body);

    if (!validation.ok) {

        return res.status(400).json({
            errors: validation.errors
        });
    }

    const connection = await connectionPool.getConnection();

    try {
        const horario =
            await registerSchedule(
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

serverApplication.get("/api/horarios/list", async (req, res) => {

    const connection = await connectionPool.getConnection();

    try {
        const horarios =
            await fetchSchedules(connection);

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

serverApplication.get("/api/horarios/byidHorario", async (req, res) => {

    const { idHorario } = req.query;

    if (!idHorario) {

        return res.status(400).json({
            message: "idHorario inválido"
        });
    }

    const connection = await connectionPool.getConnection();

    try {

        const horario =
            await searchScheduleById(
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
serverApplication.put("/api/horarios/:id", async (req, res) => {

    const validation =
        checkSchedulePayload(req.body);

    if (!validation.ok) {

        return res.status(400).json({
            errors: validation.errors
        });
    }

    const connection = await connectionPool.getConnection();

    try {

        const horario =
            await editSchedule(
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

serverApplication.delete("/api/horarios/by-idHorario", async (req, res) => {

    const { idHorario } = req.body;

    if (!idHorario) {

        return res.status(400).json({
            message: "idHorario inválido"
        });
    }

    const connection = await connectionPool.getConnection();

    try {

        await removeSchedule(
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

serverApplication.listen(8080, "127.0.0.1", async () => {

    console.log("Servidor iniciado:");
    console.log("http://127.0.0.1:8080");

    try {

        const connection = await connectionPool.getConnection();

        console.log("✅ MYSQL CONECTADO CORRECTAMENTE");

        connection.release();

    } catch (error) {

        console.error("❌ ERROR MYSQL:");
        console.error(error.message);

    }

});