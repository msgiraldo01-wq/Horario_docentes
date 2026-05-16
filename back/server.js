const express = require("express");
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

let horarios = [];

/* =========================
   CREAR HORARIO
========================= */

app.post("/api/horarios", (req, res) => {

    const {
        docente,
        facultad,
        carrera,
        materia,
        fechaClase,
        horaIniciaClase,
        horaTerminaClase
    } = req.body;

    let errores = [];

    if (!docente) errores.push("Docente requerido");
    if (!facultad) errores.push("Facultad requerida");
    if (!carrera) errores.push("Carrera requerida");
    if (!materia) errores.push("Materia requerida");
    if (!fechaClase) errores.push("Fecha requerida");

    if (errores.length > 0) {
        return res.status(400).json({
            errors: errores
        });
    }

    const existe = horarios.find(h =>
        h.docente === docente &&
        h.facultad === facultad &&
        h.carrera === carrera &&
        h.materia === materia
    );

    if (existe) {
        return res.status(409).json({
            message: "El horario ya existe."
        });
    }

    const nuevo = {
        idHorario: horarios.length + 1,
        docente,
        facultad,
        carrera,
        materia,
        fechaClase,
        horaIniciaClase,
        horaTerminaClase
    };

    horarios.push(nuevo);

    res.json({
        message: "Registro creado."
    });
});

/* =========================
   LISTAR
========================= */

app.get("/api/horarios/list", (req, res) => {

    const { orderBy, q } = req.query;

    let lista = [...horarios];

    if (q) {
        lista = lista.filter(h =>
            h.docente.toLowerCase().includes(q.toLowerCase()) ||
            h.materia.toLowerCase().includes(q.toLowerCase())
        );
    }

    if (orderBy) {
        lista.sort((a, b) =>
            String(a[orderBy]).localeCompare(String(b[orderBy]))
        );
    }

    res.json({
        horarios: lista
    });
});

/* =========================
   BUSCAR POR ID
========================= */

app.get("/api/horarios/byidHorario", (req, res) => {

    const { idHorario } = req.query;

    const horario = horarios.find(
        h => h.idHorario == idHorario
    );

    if (!horario) {
        return res.status(404).json({
            message: "Horario No existe"
        });
    }

    res.json(horario);
});

/* =========================
   EDITAR
========================= */

app.put("/api/horarios/:id", (req, res) => {

    const id = req.params.id;

    const index = horarios.findIndex(
        h => h.idHorario == id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Horario no encontrado"
        });
    }

    horarios[index] = {
        ...horarios[index],
        ...req.body
    };

    res.json({
        message: "Horario editado."
    });
});

/* =========================
   BORRAR
========================= */

app.delete("/api/horarios/by-idHorario", (req, res) => {

    const { idHorario } = req.body;

    const index = horarios.findIndex(
        h => h.idHorario == idHorario
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Horario no existe"
        });
    }

    horarios.splice(index, 1);

    res.json({
        message: "Horario borrado."
    });
});

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(8080, "127.0.0.1", () => {
    console.log("Servidor iniciado:");
    console.log("http://127.0.0.1:8080");
});