/**
 * Aplicativo básico CRUD: Creación de horarios docentes
 *
 * Backend:
 * - Node.js + mysql2
 *
 * Seguridad:
 * - Prepared statements
 * - Validaciones backend
 * - Protección básica de headers
 * - Defensa contra directory traversal
 */

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const { pool } = require("./db");

const {sendJson, sendText, readJsonBody} = require("./httpUtils");

const {validateHorarioPayload} = require("./validation");

const {createHorario, updateHorario, deleteHorario, findHorarioById, listHorarios} = require("./horariosDocentesRepository");

/* =========================================
   PATHS
========================================= */

const PROJECT_ROOT = path.resolve(__dirname, "..");
const FRONT_DIR = path.join(PROJECT_ROOT, "front");

/* =========================================
   CONTENT TYPES
========================================= */

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") {
    return "text/html; charset=utf-8";
  }
  if (ext === ".js") {
    return "application/javascript; charset=utf-8";
  }
  if (ext === ".css") {
    return "text/css; charset=utf-8";
  }
  return "application/octet-stream";
}

/* =========================================
   STATIC FILES
========================================= */

async function serveStatic(req, res, pathname) {
  const target =
    pathname === "/"
      ? "/index.html"
      : pathname;

  const normalizedUrlPath =
    path.posix.normalize(target);

  const safeRelativePath =
    normalizedUrlPath.replace(/^\/+/, "");

  const filePath =
    path.resolve(FRONT_DIR, safeRelativePath);

  const relativeToFront =
    path.relative(FRONT_DIR, filePath);

  // Protección contra directory traversal
  if (
    relativeToFront.startsWith("..") ||
    path.isAbsolute(relativeToFront)
  ) {

    sendText(res, 400, "Ruta inválida");

    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });

    res.end(data);

  } catch {
    sendText(res, 404, "No encontrado");
  }
}

/* =========================================
   PARSE ID
========================================= */

function parseIdFromPathname(pathname, prefix) {
  if (!pathname.startsWith(prefix)) {
    return null;
  }
  const rest = pathname.slice(prefix.length);
  if (!rest) {
    return null;
  }
  const parts =
    rest.split("/").filter(Boolean);
  if (parts.length !== 1) {
    return null;
  }
  const n = Number(parts[0]);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

/* =========================================
   MYSQL ERROR MAP
========================================= */

function mapMysqlError(err) {
  if (err && err.code === "ER_DUP_ENTRY") {
    return {
      statusCode: 409,
      message: "Registro duplicado"
    };
  }

  if (err && err.code === "HORARIO_SOLAPADO") {
    return {
      statusCode: 409,
      message: err.message
    };
  }

  if (err && err.code === "NOT_FOUND") {
    return {
      statusCode: 404,
      message: err.message
    };
  }

  return {
    statusCode: 500,
    message: "Error interno"
  };
}

/* =========================================
   SERVER
========================================= */

const server = http.createServer(async (req, res) => {
  try {

    /* =========================================
       SECURITY HEADERS
    ========================================= */

    res.setHeader(
      "X-Frame-Options",
      "DENY"
    );

    res.setHeader(
      "Referrer-Policy",
      "no-referrer"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'"
    );

    req.setTimeout(15_000);

    const url =
      new URL(req.url || "/", "http://localhost");

    const pathname = url.pathname;

    /* =========================================
       STATIC FILES
    ========================================= */

    if (
      req.method === "GET" &&
      (
        pathname === "/" ||
        pathname.endsWith(".html") ||
        pathname.endsWith(".js") ||
        pathname.endsWith(".css")
      )
    ) {

      await serveStatic(req, res, pathname);

      return;
    }

    /* =========================================
       HEALTH
    ========================================= */

    if (
      req.method === "GET" &&
      pathname === "/api/health"
    ) {

      try {
        const conn =
          await pool.getConnection();

        try {
          await conn.query("SELECT 1");

        } finally {

          conn.release();
        }

        sendJson(res, 200, {
          ok: true
        });

      } catch {
        sendJson(res, 500, {
          ok: false
        });
      }

      return;
    }

    /* =========================================
       LISTAR HORARIOS
    ========================================= */

    if (
      req.method === "GET" && pathname === "/api/horarios_docentes"
    ) {

      const docente =
        String(
          url.searchParams.get("docente") || ""
        ).trim();

      const fechaClase =
        String(
          url.searchParams.get("fechaClase") || ""
        ).trim();

      const conn =
        await pool.getConnection();

      try {
        const horarios =
          await listHorarios(conn, {docente, fechaClase});

        sendJson(res, 200, {
          ok: true,
          horarios
        });

      } catch (err) {

        const mapped =
          mapMysqlError(err);

        sendJson(
          res,
          mapped.statusCode,
          {
            ok: false,
            message: mapped.message
          }
        );

      } finally {

        conn.release();
      }

      return;
    }

    /* =========================================
       OBTENER HORARIO POR ID
    ========================================= */

    const getId = req.method === "GET" ? parseIdFromPathname(pathname, "/api/horarios_docentes/") : null;

    if (req.method === "GET" && getId) {
      const conn =
        await pool.getConnection();

      try {
        const horario =
          await findHorarioById(conn, getId);

        if (!horario) {
          sendJson(res, 404, {
            ok: false,
            message: "Horario no encontrado"
          });

          return;
        }

        sendJson(res, 200, {
          ok: true,
          horario
        });

      } catch (err) {

        const mapped =
          mapMysqlError(err);

        sendJson(
          res,
          mapped.statusCode,
          {
            ok: false,
            message: mapped.message
          }
        );

      } finally {

        conn.release();
      }

      return;
    }

    /* =========================================
       CREAR HORARIO
    ========================================= */

    if (
      req.method === "POST" &&
      pathname === "/api/horarios_docentes"
    ) {

      // Validar content-type
      if (
        !req.headers["content-type"]?.includes(
          "application/json"
        )
      ) {

        sendJson(res, 400, {
          ok: false,
          message:
            "Content-Type debe ser application/json"
        });

        return;
      }

      let payload;

      try {

        payload =
          await readJsonBody(req, {
            maxBytes: 10_000
          });

      } catch (err) {

        sendJson(
          res,
          err.statusCode || 400,
          {
            ok: false,
            message: err.message
          }
        );

        return;
      }

      const validation =
        validateHorarioPayload(
          payload || {}
        );

      if (!validation.ok) {

        sendJson(res, 400, {
          ok: false,
          message: "Validación falló",
          errors: validation.errors
        });

        return;
      }

      const conn =
        await pool.getConnection();

      try {

        const creado =
          await createHorario(
            conn,
            validation.value
          );

        sendJson(res, 201, {
          ok: true,
          horario: creado
        });

      } catch (err) {

        const mapped =
          mapMysqlError(err);

        sendJson(
          res,
          mapped.statusCode,
          {
            ok: false,
            message: mapped.message
          }
        );

      } finally {

        conn.release();
      }

      return;
    }

    /* =========================================
       ACTUALIZAR HORARIO
    ========================================= */

    const updateId =
      req.method === "PUT"
        ? parseIdFromPathname(
            pathname,
            "/api/horarios_docentes/"
          )
        : null;

    if (req.method === "PUT" && updateId) {

      let payload;

      try {

        payload =
          await readJsonBody(req, {
            maxBytes: 10_000
          });

      } catch (err) {

        sendJson(
          res,
          err.statusCode || 400,
          {
            ok: false,
            message: err.message
          }
        );

        return;
      }

      const validation =
        validateHorarioPayload(
          payload || {}
        );

      if (!validation.ok) {

        sendJson(res, 400, {
          ok: false,
          message: "Validación falló",
          errors: validation.errors
        });

        return;
      }

      const conn =
        await pool.getConnection();

      try {

        const actualizado =
          await updateHorario(
            conn,
            updateId,
            validation.value
          );

        sendJson(res, 200, {
          ok: true,
          horario: actualizado
        });

      } catch (err) {

        const mapped =
          mapMysqlError(err);

        sendJson(
          res,
          mapped.statusCode,
          {
            ok: false,
            message: mapped.message
          }
        );

      } finally {

        conn.release();
      }

      return;
    }

    /* =========================================
       ELIMINAR HORARIO
    ========================================= */

    const deleteId =
      req.method === "DELETE"
        ? parseIdFromPathname(
            pathname,
            "/api/horarios_docentes/"
          )
        : null;

    if (req.method === "DELETE" && deleteId) {

      const conn =
        await pool.getConnection();

      try {

        const eliminado =
          await deleteHorario(
            conn,
            deleteId
          );

        sendJson(res, 200, {
          ok: true,
          horario: eliminado
        });

      } catch (err) {

        const mapped =
          mapMysqlError(err);

        sendJson(
          res,
          mapped.statusCode,
          {
            ok: false,
            message: mapped.message
          }
        );

      } finally {

        conn.release();
      }

      return;
    }

    /* =========================================
       404
    ========================================= */

    sendText(res, 404, "No encontrado");

  } catch (err) {

    console.error(err);

    sendJson(res, 500, {
      ok: false,
      message: "Error interno"
    });
  }
});

/* =========================================
   TIMEOUTS
========================================= */

server.headersTimeout = 15_000;

server.requestTimeout = 15_000;

server.keepAliveTimeout = 5_000;

/* =========================================
   START SERVER
========================================= */

const PORT = 8080;

server.listen(PORT, "127.0.0.1", () => {

  process.stdout.write(
    `Servidor iniciado en http://127.0.0.1:${PORT}/\n`
  );
});