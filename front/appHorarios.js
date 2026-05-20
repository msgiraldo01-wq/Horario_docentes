/**
 * Cliente web - Sistema de Gestión de Horarios CIAF
 * Arquitectura SPA con Distribución Dashboard (Sidebar Lateral + Contenedor Dinámico)
 */

(function () {
    const mainContainer = document.getElementById("serverApplication");

    // ── 1. Fuente ──────────────────────────────────────────────────
    const fontElement = document.createElement("link");
    fontElement.rel  = "stylesheet";
    fontElement.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(fontElement);

    // ── 2. Estilos embebidos ───────────────────────────────────────
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg:rgb(210, 210, 210);
            --surface:    #ffffff;
            --sidebar-bg: #1c1917;
            --border:     #e7e5e4;
            --text:       #1c1917;
            --muted:      #78716c;
            --c-crear:    #16a34a;
            --c-editar:   #d97706;
            --c-borrar:   #dc2626;
            --c-listar:   #2563eb;
            --radius:     10px;
            --shadow:     0 1px 3px rgba(0,0,0,.07), 0 6px 20px rgba(0,0,0,.06);
        }

        body {
            font-family: 'Outfit', sans-serif;
            background: var(--bg);
            background-image: radial-gradient(circle, #d6d3d1 1px, transparent 1px);
            background-size: 24px 24px;
            color: var(--text);
            min-height: 100vh;
        }

        /* ── Header ────────────────────────────────── */
        .ciaf-header {
            position: sticky; top: 0; z-index: 100;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            height: 60px; padding: 0 2rem;
            display: flex; align-items: center; justify-content: space-between;
        }

        .ciaf-brand {
            display: flex; align-items: center; gap: .6rem;
            font-size: .95rem; font-weight: 700; letter-spacing: -.02em;
        }
        .ciaf-brand-icon {
            width: 30px; height: 30px; border-radius: 7px;
            background: var(--c-listar);
            display: grid; place-items: center;
            color: #fff; font-size: .85rem; font-weight: 800;
            flex-shrink: 0;
        }

        .ciaf-user-area {
            display: flex; align-items: center; gap: 1rem;
            font-size: .85rem; color: var(--muted);
        }

        .ciaf-btn-exit {
            display: flex; align-items: center; gap: .4rem;
            padding: .38rem .9rem;
            border: 1.5px solid var(--border); border-radius: 6px;
            background: transparent; color: var(--muted);
            font-family: 'Outfit', sans-serif; font-size: .8rem; font-weight: 500;
            cursor: pointer; transition: all .15s;
        }
        .ciaf-btn-exit:hover { background: #fef2f2; border-color: #fca5a5; color: var(--c-borrar); }

        /* ── Layout ─────────────────────────────────── */
        .ciaf-layout {
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 1.5rem;
            padding: 1.5rem 2rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        @media (max-width: 768px) {
            .ciaf-layout { grid-template-columns: 1fr; padding: 1rem; }
        }

        /* ── Sidebar ─────────────────────────────────── */
        .ciaf-sidebar {
            background: var(--sidebar-bg);
            border-radius: var(--radius);
            padding: 1.25rem;
            height: fit-content;
            position: sticky; top: 76px;
        }

        .ciaf-sidebar-title {
            font-size: .62rem; font-weight: 700;
            letter-spacing: .12em; text-transform: uppercase;
            color: #57534e; margin-bottom: .8rem; padding: 0 .25rem;
        }

        .ciaf-nav { display: flex; flex-direction: column; gap: .2rem; }

        .ciaf-nav-item {
            display: flex; align-items: center; gap: .65rem;
            width: 100%; padding: .65rem .8rem;
            border: none; border-radius: 7px;
            background: transparent; color: #a8a29e;
            font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 400;
            cursor: pointer; text-align: left;
            transition: all .15s;
        }
        .ciaf-nav-item:hover { background: rgba(255,255,255,.07); color: #e7e5e4; }
        .ciaf-nav-item.active { font-weight: 600; }

        .ciaf-nav-item.active-crear  { background: rgba(22,163,74,.18);  color: #86efac; }
        .ciaf-nav-item.active-editar { background: rgba(217,119,6,.18);  color: #fcd34d; }
        .ciaf-nav-item.active-borrar { background: rgba(220,38,38,.18);  color: #fca5a5; }
        .ciaf-nav-item.active-listar { background: rgba(37,99,235,.18);  color: #93c5fd; }

        .ciaf-nav-icon {
            font-size: .95rem; width: 1.1rem;
            text-align: center; flex-shrink: 0;
        }

        .ciaf-sidebar-footer {
            margin-top: 1.25rem; padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,.07);
            font-size: .7rem; color: #57534e;
            display: flex; align-items: center; gap: .4rem;
        }

        /* ── Panel principal ─────────────────────────── */
        .ciaf-panel {
            background: var(--surface);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 2rem; min-height: 420px;
        }
        .ciaf-panel > * { animation: fadeUp .22s ease-out; }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Welcome ─────────────────────────────────── */
        .ciaf-welcome {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            text-align: center; padding: 4rem 2rem; gap: 1rem;
        }
        .ciaf-welcome-icon { font-size: 2.8rem; opacity: .2; margin-bottom: .25rem; }
        .ciaf-welcome-title {
            font-size: 1.6rem; font-weight: 700; letter-spacing: -.03em;
        }
        .ciaf-welcome-subtitle {
            font-size: .9rem; color: var(--muted); max-width: 360px; line-height: 1.6;
        }

        /* ── Alertas ─────────────────────────────────── */
        .ciaf-alerts { min-height: .5rem; margin-bottom: 1rem; }
        .ciaf-alert {
            padding: .7rem 1rem; border-radius: 7px;
            font-size: .875rem; font-weight: 500;
            border: 1px solid transparent;
        }
        .ciaf-alert-success { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        .ciaf-alert-error   { background: #fef2f2; color: #991b1b; border-color: #fecaca; }

        /* ── Formulario ──────────────────────────────── */
        .ciaf-form-title {
            font-size: 1.2rem; font-weight: 700;
            letter-spacing: -.02em; margin-bottom: 1.25rem;
        }

        .ciaf-search-bar { display: flex; gap: .5rem; margin-bottom: 1.5rem; }

        .ciaf-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.1rem;
        }
        @media (max-width: 600px) { .ciaf-form-grid { grid-template-columns: 1fr; } }

        .ciaf-form-actions {
            grid-column: 1 / -1;
            display: flex; gap: .7rem; margin-top: .5rem;
        }

        .ciaf-field { display: flex; flex-direction: column; gap: .35rem; }

        .ciaf-label {
            font-size: .7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: .06em; color: var(--muted);
        }

        .ciaf-input {
            width: 100%; padding: .6rem .8rem;
            border: 1.5px solid var(--border); border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .9rem; color: var(--text);
            background: var(--surface); outline: none;
            transition: border-color .15s, box-shadow .15s;
        }
        .ciaf-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .ciaf-input:disabled { background: #fafaf9; color: var(--muted); cursor: not-allowed; }

        /* ── Botones ─────────────────────────────────── */
        .ciaf-btn {
            padding: .58rem 1.4rem;
            border: none; border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 600;
            cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .ciaf-btn:disabled { opacity: .45; cursor: not-allowed; }

        .ciaf-btn-success { background: var(--c-crear); color: #fff; }
        .ciaf-btn-success:hover:not(:disabled) { background: #15803d; }

        .ciaf-btn-warning { background: var(--c-editar); color: #fff; }
        .ciaf-btn-warning:hover:not(:disabled) { background: #b45309; }

        .ciaf-btn-danger { background: var(--c-borrar); color: #fff; }
        .ciaf-btn-danger:hover:not(:disabled) { background: #b91c1c; }

        .ciaf-btn-primary { background: var(--c-listar); color: #fff; }
        .ciaf-btn-primary:hover:not(:disabled) { background: #1d4ed8; }

        .ciaf-btn-ghost {
            background: #f5f5f4; color: var(--muted);
            border: 1.5px solid var(--border);
        }
        .ciaf-btn-ghost:hover { background: #e7e5e4; color: var(--text); }

        .ciaf-btn-outline {
            background: transparent; color: var(--muted);
            border: 1.5px solid var(--border);
        }
        .ciaf-btn-outline:hover { background: var(--bg); }

        /* ── Tabla ───────────────────────────────────── */
        .ciaf-list-title {
            font-size: 1.2rem; font-weight: 700;
            letter-spacing: -.02em; margin-bottom: 1.25rem;
        }

        .ciaf-filters { display: flex; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }

        .ciaf-select {
            padding: .5rem .75rem;
            border: 1.5px solid var(--border); border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .85rem;
            background: var(--surface); color: var(--text);
            outline: none; cursor: pointer;
        }
        .ciaf-select:focus  { border-color: #93c5fd; }
        .ciaf-select:disabled { opacity: .5; }

        .ciaf-input-sm {
            flex: 1; min-width: 150px;
            padding: .5rem .75rem;
            border: 1.5px solid var(--border); border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .85rem; color: var(--text);
            background: var(--surface); outline: none;
        }
        .ciaf-input-sm:focus   { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .ciaf-input-sm:disabled { opacity: .5; }

        .ciaf-table-wrap {
            overflow-x: auto;
            border: 1.5px solid var(--border); border-radius: var(--radius);
        }

        .ciaf-table { width: 100%; border-collapse: collapse; font-size: .84rem; }

        .ciaf-table thead tr {
            background: #fafaf9;
            border-bottom: 2px solid var(--border);
        }
        .ciaf-table th {
            padding: .75rem 1rem; text-align: left;
            font-size: .68rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: .06em;
            color: var(--muted); white-space: nowrap;
        }
        .ciaf-table td {
            padding: .7rem 1rem;
            border-bottom: 1px solid #f5f5f4; color: var(--text);
        }
        .ciaf-table tbody tr:hover { background: #fafaf9; }
        .ciaf-table tbody tr:last-child td { border-bottom: none; }

        .ciaf-td-id { font-weight: 700; color: var(--c-listar); }

        .ciaf-table-footer {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 1rem;
        }
        .ciaf-count {
            font-size: .78rem; font-weight: 600; color: var(--muted);
            background: #f5f5f4; padding: .28rem .75rem; border-radius: 20px;
        }
        .ciaf-empty {
            text-align: center; color: var(--muted);
            padding: 2.5rem 1rem; font-size: .9rem;
        }

        /* ── Salida ──────────────────────────────────── */
        .ciaf-exit {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            text-align: center; padding: 4rem 2rem; gap: 1rem;
        }
        .ciaf-exit-icon     { font-size: 2.5rem; opacity: .25; }
        .ciaf-exit-title    { font-size: 1.2rem; font-weight: 700; color: var(--c-borrar); }
        .ciaf-exit-subtitle { font-size: .9rem; color: var(--muted); }
    `;
    document.head.appendChild(styleElement);

    // ── Estado global ──────────────────────────────────────────────
    const moduloEstado = {
        vistaActiva: "inicio",
        idSeleccionado: null,
        filtrosTable: {
            ordenador: "idHorario",
            buscarTermino: ""
        }
    };

    // ── Utilidades DOM ─────────────────────────────────────────────
    function crearNodo(tag, atributos = {}) {
        const elemento = document.createElement(tag);
        for (const [prop, valor] of Object.entries(atributos)) {
            if      (prop === "text")              elemento.textContent = String(valor);
            else if (prop === "html")              elemento.innerHTML = sanitizarTexto(valor);
            else if (prop === "value")             elemento.value       = String(valor);
            else if (prop === "disabled" && valor) elemento.setAttribute("disabled", "true");
            else                                   elemento.setAttribute(prop, String(valor));
        }
        return elemento;
    }

    function limpiarElemento(nodo) {
        while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
    }

    // ── Sanitización ─────────────────────────────────────────────

    function sanitizarTexto(valor = "") {
        return String(valor)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // quitar acentos raros
            .replace(/[<>$%{}[\]|\\^~`]/g, "") // caracteres peligrosos
            .replace(/\s+/g, " ") // espacios dobles
            .trim()
            .toUpperCase();
    }

    function sanitizarBusqueda(valor = "") {
        return String(valor)
            .replace(/[<>$%{}[\]|\\^~`]/g, "")
            .trim()
            .toLowerCase();
    }

    function sanitizarNumero(valor = "") {
        return String(valor)
            .replace(/\D/g, "");
    }

    function transicionarModulo(nombreVista) {
        moduloEstado.vistaActiva  = nombreVista;
        moduloEstado.idSeleccionado = null;
        renderizarEstructuraBase();
    }

    // ── Cliente API ────────────────────────────────────────────────
    async function realizarLlamadoAPI(metodo, endpoint, cuerpo) {
        const cfg = { method: metodo, headers: { "Content-Type": "application/json" } };
        if (cuerpo !== undefined) cfg.body = JSON.stringify(cuerpo);
        const resp = await fetch(endpoint, cfg);
        const json = await resp.json().catch(() => null);
        if (!resp.ok) {
            const err = new Error(json?.message ?? "Error en comunicación con el servidor");
            err.detalles = json;
            throw err;
        }
        return json;
    }

    // ── Feedback ───────────────────────────────────────────────────
    function lanzarMensajeFeedback(zona, texto, esError = false) {
        limpiarElemento(zona);
        if (!texto) return;
        zona.appendChild(crearNodo("div", {
            class: `ciaf-alert ${esError ? "ciaf-alert-error" : "ciaf-alert-success"}`,
            text: texto
        }));
    }

    // ==========================================
    // COMPONENTES DINÁMICOS
    // ==========================================

    function vistaBienvenida() {
        const caja = crearNodo("div", { class: "ciaf-welcome" });
        caja.appendChild(crearNodo("div", { class: "ciaf-welcome-icon", text: "◈" }));
        caja.appendChild(crearNodo("h1", { class: "ciaf-welcome-title", text: "Bienvenido al Sistema de Horarios CIAF" }));
        caja.appendChild(crearNodo("p",  { class: "ciaf-welcome-subtitle", text: "Seleccione una opción del menú lateral para comenzar." }));
        return caja;
    }

    function componenteFormulario(modo) {
        const contenedorForm = crearNodo("div", {});

        const titulos = { crear: "Crear horario", editar: "Editar horario", borrar: "Borrar horario" };
        contenedorForm.appendChild(crearNodo("h3", { class: "ciaf-form-title", text: titulos[modo] }));

        const bloqueAlertas = crearNodo("div", { class: "ciaf-alerts" });
        contenedorForm.appendChild(bloqueAlertas);

        // Barra de búsqueda para editar / borrar
        if (modo === "editar" || modo === "borrar") {
            const controlBusqueda = crearNodo("div", { class: "ciaf-search-bar" });
            const inputId = crearNodo("input", {
                type: "number", class: "ciaf-input",
                id: "buscarIdHorario", placeholder: "Escriba el idHorario..."
            });
            const btnBuscar = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-outline", text: "Buscar" });

            controlBusqueda.appendChild(inputId);
            controlBusqueda.appendChild(btnBuscar);
            contenedorForm.appendChild(controlBusqueda);

            btnBuscar.addEventListener("click", async () => {
                const idValue = sanitizarNumero(inputId.value);
                if (!idValue) { lanzarMensajeFeedback(bloqueAlertas, "Debe digitar el ID a buscar.", true); return; }
                try {
                    const registro = await realizarLlamadoAPI("GET", `/api/horarios/byidHorario?idHorario=${idValue}`);
                    if (!registro) { lanzarMensajeFeedback(bloqueAlertas, "El horario no existe.", true); return; }
                    moduloEstado.idSeleccionado = idValue;
                    document.getElementById("formDocente").value     = registro.docente    || "";
                    document.getElementById("formFacultad").value    = registro.facultad   || "";
                    document.getElementById("formCarrera").value     = registro.carrera    || "";
                    document.getElementById("formMateria").value     = registro.materia    || "";
                    document.getElementById("formFecha").value       = registro.fechaClase
                        ? registro.fechaClase.split("T")[0] : "";
                    document.getElementById("formHoraInicia").value  = registro.horaIniciaClase  || "";
                    document.getElementById("formHoraTermina").value = registro.horaTerminaClase || "";
                    lanzarMensajeFeedback(bloqueAlertas, "Horario cargado.", false);
                } catch (e) { lanzarMensajeFeedback(bloqueAlertas, e.message, true); }
            });
        }

        // Estructura del formulario
        const formTag = crearNodo("form", { class: "ciaf-form-grid" });

        const campos = [
            { id: "formDocente",     label: "Docente",            type: "text", disabled: modo === "borrar" },
            { id: "formFacultad",    label: "Facultad",           type: "text", disabled: modo === "borrar" },
            { id: "formCarrera",     label: "Carrera",            type: "text", disabled: modo === "borrar" },
            { id: "formMateria",     label: "Materia",            type: "text", disabled: modo === "borrar" },
            { id: "formFecha",       label: "Fecha Clase",        type: "date", disabled: modo === "borrar" },
            { id: "formHoraInicia",  label: "Hora Inicia Clase",  type: "time", disabled: modo === "borrar" },
            { id: "formHoraTermina", label: "Hora Termina Clase", type: "time", disabled: modo === "borrar" }
        ];

        campos.forEach(c => {
            const divCol = crearNodo("div", { class: "ciaf-field" });
            divCol.appendChild(crearNodo("label", { class: "ciaf-label", text: c.label, for: c.id }));
            const paramsInput = { type: c.type, class: "ciaf-input", id: c.id };
            if (c.disabled) paramsInput.disabled = "true";
            divCol.appendChild(crearNodo("input", paramsInput));
            formTag.appendChild(divCol);
        });

        // Botones de acción
        const colores = { crear: "ciaf-btn-success", editar: "ciaf-btn-warning", borrar: "ciaf-btn-danger" };
        const textos  = { crear: "Guardar",          editar: "Editar",           borrar: "Eliminar" };

        const divBotones = crearNodo("div", { class: "ciaf-form-actions" });
        const btnSubmit  = crearNodo("button", { type: "button", class: `ciaf-btn ${colores[modo]}`, text: textos[modo] });
        const btnCancel  = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost",   text: "Cancelar" });

        divBotones.appendChild(btnSubmit);
        divBotones.appendChild(btnCancel);
        formTag.appendChild(divBotones);
        contenedorForm.appendChild(formTag);

        // Controladores de eventos
        btnCancel.addEventListener("click", () => {
            formTag.reset();
            limpiarElemento(bloqueAlertas);
            transicionarModulo("inicio");
        });

        btnSubmit.addEventListener("click", async () => {
            if (modo === "borrar") {
                if (!moduloEstado.idSeleccionado) {
                    lanzarMensajeFeedback(bloqueAlertas, "Debe buscar una identificación existente antes de eliminar.", true);
                    return;
                }
                if (confirm("¿Está seguro de Borrar el registro?")) {
                    try {
                        await realizarLlamadoAPI("DELETE", "/api/horarios/by-idHorario", { idHorario: moduloEstado.idSeleccionado });
                        lanzarMensajeFeedback(bloqueAlertas, "Horario borrado.", false);
                        btnSubmit.setAttribute("disabled", "true");
                        setTimeout(() => transicionarModulo("inicio"), 1500);
                    } catch (err) { lanzarMensajeFeedback(bloqueAlertas, err.message, true); }
                }
                return;
            }

            if (modo === "editar" && !moduloEstado.idSeleccionado) {
                lanzarMensajeFeedback(bloqueAlertas, "Debe buscar un horario existente para editar.", true);
                return;
            }

            const payload = {
                docente: sanitizarTexto(
                    document.getElementById("formDocente").value
                ),

                facultad: sanitizarTexto(
                    document.getElementById("formFacultad").value
                ),

                carrera: sanitizarTexto(
                    document.getElementById("formCarrera").value
                ),

                materia: sanitizarTexto(
                    document.getElementById("formMateria").value
                ),

                fechaClase: sanitizarTexto(
                    document.getElementById("formFecha").value
                ),

                horaIniciaClase: sanitizarTexto(
                    document.getElementById("formHoraInicia").value
                ),

                horaTerminaClase: sanitizarTexto(
                    document.getElementById("formHoraTermina").value
                )
            };

            if (Object.values(payload).some(v => !v)) {
                lanzarMensajeFeedback(bloqueAlertas, "Debes completar los datos del formulario.", true);
                return;
            }

            if (modo === "editar" && !confirm("¿Está seguro de Editar el registro?")) { formTag.reset(); return; }

            try {
                if (modo === "crear") {
                    await realizarLlamadoAPI("POST", "/api/horarios", payload);
                    lanzarMensajeFeedback(bloqueAlertas, "Registro creado.", false);
                } else {
                    await realizarLlamadoAPI("PUT", `/api/horarios/${moduloEstado.idSeleccionado}`, payload);
                    lanzarMensajeFeedback(bloqueAlertas, "Horario editado.", false);
                }
                btnSubmit.setAttribute("disabled", "true");
                setTimeout(() => transicionarModulo("inicio"), 1500);
            } catch (ex) {
                const msg = ex.detalles?.errors ? ex.detalles.errors.join(", ") : ex.message;
                lanzarMensajeFeedback(bloqueAlertas, msg, true);
            }
        });

        return contenedorForm;
    }

    function componenteTablaListado() {
        const moduloListado = crearNodo("div", {});
        moduloListado.appendChild(crearNodo("h3", { class: "ciaf-list-title", text: "Listado de horarios" }));

        // Filtros
        const filaFiltros = crearNodo("div", { class: "ciaf-filters" });

        const selectOrd = crearNodo("select", { class: "ciaf-select" });
        [["idHorario","Ordenar por ID"], ["docente","Ordenar por Docente"], ["materia","Ordenar por Materia"]].forEach(([v, t]) => {
            selectOrd.appendChild(crearNodo("option", { value: v, text: t }));
        });
        selectOrd.value = moduloEstado.filtrosTable.ordenador;

        const inputBusq = crearNodo("input", {
            type: "text", class: "ciaf-input-sm",
            placeholder: "Buscar...",
            value: moduloEstado.filtrosTable.buscarTermino
        });
        const btnFiltrar = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-primary", text: "Buscar" });

        filaFiltros.appendChild(selectOrd);
        filaFiltros.appendChild(inputBusq);
        filaFiltros.appendChild(btnFiltrar);
        moduloListado.appendChild(filaFiltros);

        // Tabla
        const divTabla  = crearNodo("div", { class: "ciaf-table-wrap" });
        const tablaHTML = crearNodo("table", { class: "ciaf-table" });
        const thead     = crearNodo("thead", {});
        const trh       = crearNodo("tr");

        ["ID","Docente","Facultad","Carrera","Materia","Fecha","Inicia","Termina"].forEach(t => {
            trh.appendChild(crearNodo("th", { text: t }));
        });
        thead.appendChild(trh);
        tablaHTML.appendChild(thead);

        const tbody = crearNodo("tbody", {});
        tablaHTML.appendChild(tbody);
        divTabla.appendChild(tablaHTML);
        moduloListado.appendChild(divTabla);

        // Footer
        const footerListado = crearNodo("div", { class: "ciaf-table-footer" });
        const txtConteo     = crearNodo("span", { class: "ciaf-count", id: "lblConteo", text: "Registros: 0" });
        const btnCerrar     = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost", text: "Cerrar" });
        footerListado.appendChild(txtConteo);
        footerListado.appendChild(btnCerrar);
        moduloListado.appendChild(footerListado);

        btnCerrar.addEventListener("click", () => transicionarModulo("inicio"));

        async function cargarDatos() {
            [selectOrd, inputBusq, btnFiltrar].forEach(el =>
                el.setAttribute("disabled", "true")
            );

            try {
                // Obtener todos los registros
                const resList = await realizarLlamadoAPI(
                    "GET",
                    "/api/horarios/list"
                );

                limpiarElemento(tbody);

                let arr = Array.isArray(resList?.horarios)
                    ? [...resList.horarios]
                    : [];

                // =========================
                // BUSCADOR
                // =========================
                const terminoBusqueda = moduloEstado.filtrosTable.buscarTermino
                    .trim()
                    .toLowerCase();

                if (terminoBusqueda) {
                    arr = arr.filter(item =>
                        Object.values(item).some(valor =>
                            String(valor ?? "")
                                .toLowerCase()
                                .includes(terminoBusqueda)
                        )
                    );
                }

                // =========================
                // ORDENAMIENTO
                // =========================
                const campoOrden = moduloEstado.filtrosTable.ordenador;

                arr = arr.sort((a, b) => {

                    // ORDEN POR ID
                    if (campoOrden === "idHorario") {

                        const idA = parseInt(a.idHorario) || 0;
                        const idB = parseInt(b.idHorario) || 0;

                        return idA - idB;
                    }

                    // ORDEN ALFABÉTICO
                    const textoA = String(a[campoOrden] || "")
                        .trim()
                        .toLowerCase();

                    const textoB = String(b[campoOrden] || "")
                        .trim()
                        .toLowerCase();

                    if (textoA < textoB) return -1;
                    if (textoA > textoB) return 1;

                    return 0;
                });

                // Actualizar contador real de registros
                txtConteo.textContent = `Registros: ${arr.length}`;

                // =========================
                // TABLA VACÍA
                // =========================
                if (arr.length === 0) {
                    const trV = crearNodo("tr");

                    trV.appendChild(
                        crearNodo("td", {
                            class: "ciaf-empty",
                            text: "No hay registros para mostrar.",
                            colspan: "8"
                        })
                    );

                    tbody.appendChild(trV);

                } else {

                    // =========================
                    // PINTAR TABLA
                    // =========================
                    arr.forEach(item => {

                        const tr = crearNodo("tr");

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.idHorario,
                                class: "ciaf-td-id"
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.docente
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.facultad
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.carrera
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.materia
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.fechaClase
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.horaIniciaClase
                                    ? item.horaIniciaClase.substring(0, 5)
                                    : ""
                            })
                        );

                        tr.appendChild(
                            crearNodo("td", {
                                text: item.horaTerminaClase
                                    ? item.horaTerminaClase.substring(0, 5)
                                    : ""
                            })
                        );

                        tbody.appendChild(tr);
                    });
                }

            } catch (err) {

                console.error(err);

            } finally {

                [selectOrd, inputBusq, btnFiltrar].forEach(el =>
                    el.removeAttribute("disabled")
                );
            }
        }

        btnFiltrar.addEventListener("click", () => {
            moduloEstado.filtrosTable.ordenador     = selectOrd.value;
            moduloEstado.filtrosTable.buscarTermino =
                sanitizarBusqueda(inputBusq.value);
            cargarDatos();
        });

        selectOrd.addEventListener("change", () => {

            moduloEstado.filtrosTable.ordenador = selectOrd.value;

            cargarDatos();
        });

        inputBusq.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                moduloEstado.filtrosTable.ordenador     = selectOrd.value;
                moduloEstado.filtrosTable.buscarTermino =
                    sanitizarBusqueda(inputBusq.value);
                cargarDatos();
            }
        });

        cargarDatos();
        return moduloListado;
    }

    function componenteVistaSalida() {
        const divExit = crearNodo("div", { class: "ciaf-exit" });
        divExit.appendChild(crearNodo("div", { class: "ciaf-exit-icon",     text: "⊗" }));
        divExit.appendChild(crearNodo("h4",  { class: "ciaf-exit-title",    text: "Sesión Finalizada" }));
        divExit.appendChild(crearNodo("p",   { class: "ciaf-exit-subtitle", text: "Puede cerrar esta pestaña/ventana del navegador para finalizar." }));

        const btnRegresar = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost", text: "Volver al menú" });
        btnRegresar.addEventListener("click", () => transicionarModulo("inicio"));
        divExit.appendChild(btnRegresar);
        return divExit;
    }

    // ==========================================
    // ORQUESTADOR SPA
    // ==========================================

    function renderizarEstructuraBase() {
        limpiarElemento(mainContainer);

        // Header
        const header = crearNodo("header", { class: "ciaf-header" });

        const brand = crearNodo("div", { class: "ciaf-brand" });
        brand.appendChild(crearNodo("div", { class: "ciaf-brand-icon", text: "H" }));
        brand.appendChild(crearNodo("span", { text: "Administración de Horarios" }));
        header.appendChild(brand);

        const userArea = crearNodo("div", { class: "ciaf-user-area" });
        userArea.appendChild(crearNodo("span", { html: "Bienvenido, Docente" }));

        const btnNavSalir = crearNodo("button", { class: "ciaf-btn-exit" });
        btnNavSalir.appendChild(crearNodo("span", { text: "⟶" }));
        btnNavSalir.appendChild(crearNodo("span", { text: " Salir" }));
        btnNavSalir.addEventListener("click", () => transicionarModulo("salir"));
        userArea.appendChild(btnNavSalir);
        header.appendChild(userArea);
        mainContainer.appendChild(header);

        // Layout principal
        const layout = crearNodo("div", { class: "ciaf-layout" });

        // — Sidebar —
        const sidebar = crearNodo("div", { class: "ciaf-sidebar" });
        sidebar.appendChild(crearNodo("h6", { class: "ciaf-sidebar-title", text: "Menú Principal" }));

        const nav = crearNodo("div", { class: "ciaf-nav" });
        const rutasMenu = [
            { clave: "crear",  etiqueta: "Crear horario",      iconChar: "+" },
            { clave: "editar", etiqueta: "Editar horario",     iconChar: "✏" },
            { clave: "borrar", etiqueta: "Borrar horario",     iconChar: "✕" },
            { clave: "listar", etiqueta: "Listado de horarios",iconChar: "≡" }
        ];

        rutasMenu.forEach(item => {
            const esActivo = moduloEstado.vistaActiva === item.clave;
            const btn = crearNodo("button", {
                type: "button",
                class: `ciaf-nav-item${esActivo ? ` active active-${item.clave}` : ""}`
            });
            btn.appendChild(crearNodo("span", { class: "ciaf-nav-icon", text: item.iconChar }));
            btn.appendChild(crearNodo("span", { text: item.etiqueta }));
            btn.addEventListener("click", () => transicionarModulo(item.clave));
            nav.appendChild(btn);
        });
        sidebar.appendChild(nav);

        const sidebarFooter = crearNodo("p", { class: "ciaf-sidebar-footer" });
        sidebarFooter.appendChild(crearNodo("span", { text: "ⓘ" }));
        sidebarFooter.appendChild(document.createTextNode(" Selecciona una opción del menú."));
        sidebar.appendChild(sidebarFooter);
        layout.appendChild(sidebar);

        // — Panel central —
        const panel = crearNodo("div", { class: "ciaf-panel" });

        const vistas = {
            inicio: vistaBienvenida,
            crear:  () => componenteFormulario("crear"),
            editar: () => componenteFormulario("editar"),
            borrar: () => componenteFormulario("borrar"),
            listar: componenteTablaListado,
            salir:  componenteVistaSalida
        };
        panel.appendChild((vistas[moduloEstado.vistaActiva] ?? vistaBienvenida)());

        layout.appendChild(panel);
        mainContainer.appendChild(layout);
    }

    renderizarEstructuraBase();
})();