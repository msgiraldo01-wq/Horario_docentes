/**
 * Cliente web - Sistema de Gestión de Horarios CIAF
 * Arquitectura SPA con Distribución Dashboard (Sidebar Lateral + Contenedor Dinámico)
 * v3 — Custom Selects animados + SweetAlerts pro acordes al diseño institucional
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

        /* ── Custom Select ── */
        .cs-wrapper {
            position: relative;
            user-select: none;
        }
        .cs-display {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: .6rem .8rem;
            border: 1.5px solid var(--border);
            border-radius: 7px;
            background: var(--surface);
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
            font-size: .9rem;
            color: var(--text);
            transition: border-color .15s, box-shadow .15s;
            min-height: 38px;
            width: 100%;
        }
        .cs-display:hover { border-color: #93c5fd; }
        .cs-display.cs-open {
            border-color: #93c5fd;
            box-shadow: 0 0 0 3px rgba(37,99,235,.1);
        }
        .cs-display.cs-disabled {
            background: #fafaf9;
            color: var(--muted);
            cursor: not-allowed;
            pointer-events: none;
        }
        .cs-placeholder { color: var(--muted); }
        .cs-chevron {
            display: flex; align-items: center; justify-content: center;
            width: 20px; height: 20px;
            border-radius: 4px;
            background: #f5f5f4;
            color: var(--text);
            transition: transform .25s, background .15s;
            flex-shrink: 0;
            margin-left: 8px;
        }
        .cs-display.cs-open .cs-chevron {
            transform: rotate(180deg);
            background: var(--c-listar);
            color: #fff;
        }
        .cs-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0; right: 0;
            background: var(--surface);
            border: 1.5px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,.10);
            z-index: 9999;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height .28s cubic-bezier(.4,0,.2,1), opacity .2s;
        }
        .cs-dropdown.cs-dropdown-open {
            max-height: 220px;
            opacity: 1;
            overflow-y: auto;
        }
        .cs-dropdown::-webkit-scrollbar { width: 4px; }
        .cs-dropdown::-webkit-scrollbar-thumb { background: var(--c-listar); border-radius: 4px; }
        .cs-option {
            padding: 9px 14px;
            font-family: 'Outfit', sans-serif;
            font-size: .875rem;
            color: var(--text);
            cursor: pointer;
            transition: background .15s, color .15s, padding-left .15s;
            display: flex; align-items: center; gap: 8px;
        }
        .cs-option:hover {
            background: #eff6ff;
            color: var(--c-listar);
            padding-left: 20px;
        }
        .cs-option.cs-selected {
            background: var(--c-listar);
            color: #fff;
            font-weight: 600;
        }
        .cs-option.cs-selected:hover {
            background: #1d4ed8;
            color: #fff;
            padding-left: 14px;
        }
        .cs-option-dot {
            width: 5px; height: 5px;
            border-radius: 50%;
            background: currentColor;
            flex-shrink: 0; opacity: .5;
        }
        .cs-empty {
            padding: 12px 14px;
            font-size: .82rem; color: var(--muted);
            font-style: italic; text-align: center;
        }

        /* ── SweetAlert2 overrides CIAF ── */
        .swal2-popup.ciaf-swal {
            border-radius: 14px !important;
            font-family: 'Outfit', sans-serif !important;
            padding: 2rem 2rem 1.8rem !important;
            box-shadow: 0 20px 60px rgba(0,0,0,.14) !important;
        }
        .swal2-popup.ciaf-swal .swal2-title {
            font-size: 1.1rem !important; font-weight: 700 !important;
            color: #1c1917 !important; margin-bottom: .4rem !important;
        }
        .swal2-popup.ciaf-swal .swal2-html-container {
            font-size: .88rem !important; color: #57534e !important;
            margin: .3rem 0 0 !important;
        }
        .swal2-popup.ciaf-swal .swal2-icon.swal2-success { border-color: #16a34a !important; color: #16a34a !important; }
        .swal2-popup.ciaf-swal .swal2-icon.swal2-success [class^=swal2-success-line] { background-color: #16a34a !important; }
        .swal2-popup.ciaf-swal .swal2-icon.swal2-success .swal2-success-ring { border-color: rgba(22,163,74,.25) !important; }
        .swal2-popup.ciaf-swal .swal2-icon.swal2-error   { border-color: #dc2626 !important; color: #dc2626 !important; }
        .swal2-popup.ciaf-swal .swal2-icon.swal2-warning { border-color: #d97706 !important; color: #d97706 !important; }
        .swal2-popup.ciaf-swal .swal2-icon.swal2-question{ border-color: #2563eb !important; color: #2563eb !important; }
        .swal2-popup.ciaf-swal .swal2-confirm {
            background: var(--c-listar) !important;
            border: none !important; border-radius: 7px !important;
            font-family: 'Outfit', sans-serif !important;
            font-weight: 600 !important; font-size: .875rem !important;
            padding: .58rem 1.4rem !important;
            box-shadow: none !important;
        }
        .swal2-popup.ciaf-swal .swal2-confirm:hover { background: #1d4ed8 !important; }
        .swal2-popup.ciaf-swal .swal2-cancel {
            background: #f5f5f4 !important; color: #78716c !important;
            border: 1.5px solid #e7e5e4 !important; border-radius: 7px !important;
            font-family: 'Outfit', sans-serif !important;
            font-weight: 600 !important; font-size: .875rem !important;
            padding: .58rem 1.4rem !important;
        }
        .swal2-popup.ciaf-swal .swal2-cancel:hover { background: #e7e5e4 !important; }
        .swal2-popup.ciaf-swal .swal2-timer-progress-bar { background: var(--c-listar) !important; }
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

    // ── Datos institucionales CIAF ─────────────────────────────────
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

    // ── Custom Select constructor ──────────────────────────────────
    function crearCustomSelect({ id, placeholder, opciones, deshabilitado, onChange }) {
        let valorActual = "";
        let abierto = false;

        const wrapper = document.createElement("div");
        wrapper.className = "cs-wrapper";

        const display = document.createElement("div");
        display.className = "cs-display" + (deshabilitado ? " cs-disabled" : "");
        display.setAttribute("tabindex", deshabilitado ? "-1" : "0");
        display.setAttribute("role", "combobox");
        display.setAttribute("aria-expanded", "false");
        display.setAttribute("id", id + "_display");

        const txtSpan = document.createElement("span");
        txtSpan.className = "cs-placeholder";
        txtSpan.textContent = placeholder;

        const chevron = document.createElement("span");
        chevron.className = "cs-chevron";
        chevron.innerHTML = `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        display.appendChild(txtSpan);
        display.appendChild(chevron);

        const dropdown = document.createElement("div");
        dropdown.className = "cs-dropdown";
        dropdown.setAttribute("role", "listbox");

        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.id = id;
        hiddenInput.value = "";

        wrapper.appendChild(display);
        wrapper.appendChild(dropdown);
        wrapper.appendChild(hiddenInput);

        function poblarOpciones(lista) {
            while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);
            valorActual = "";
            hiddenInput.value = "";
            txtSpan.textContent = placeholder;
            txtSpan.className = "cs-placeholder";

            if (!lista || lista.length === 0) {
                const empty = document.createElement("div");
                empty.className = "cs-empty";
                empty.textContent = "Sin opciones disponibles";
                dropdown.appendChild(empty);
                return;
            }

            lista.forEach(function (opcion) {
                const opt = document.createElement("div");
                opt.className = "cs-option";
                opt.setAttribute("role", "option");
                opt.dataset.value = opcion;

                const dot = document.createElement("span");
                dot.className = "cs-option-dot";
                const lbl = document.createElement("span");
                lbl.textContent = opcion;

                opt.appendChild(dot);
                opt.appendChild(lbl);

                opt.addEventListener("click", function (e) {
                    e.stopPropagation();
                    seleccionarValor(opcion);
                    cerrar();
                });

                dropdown.appendChild(opt);
            });
        }

        function seleccionarValor(val) {
            valorActual = val;
            hiddenInput.value = val;
            txtSpan.textContent = val;
            txtSpan.className = "";
            dropdown.querySelectorAll(".cs-option").forEach(function (o) {
                o.classList.toggle("cs-selected", o.dataset.value === val);
            });
            if (onChange) onChange(val);
        }

        function resetValor(nuevoPlaceholder) {
            valorActual = "";
            hiddenInput.value = "";
            txtSpan.textContent = nuevoPlaceholder || placeholder;
            txtSpan.className = "cs-placeholder";
            dropdown.querySelectorAll(".cs-option").forEach(function (o) {
                o.classList.remove("cs-selected");
            });
        }

        function abrir() {
            if (deshabilitado) return;
            abierto = true;
            display.classList.add("cs-open");
            display.setAttribute("aria-expanded", "true");
            dropdown.classList.add("cs-dropdown-open");
        }

        function cerrar() {
            abierto = false;
            display.classList.remove("cs-open");
            display.setAttribute("aria-expanded", "false");
            dropdown.classList.remove("cs-dropdown-open");
        }

        function toggleAbrir() { abierto ? cerrar() : abrir(); }

        display.addEventListener("click", function (e) { e.stopPropagation(); toggleAbrir(); });
        display.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAbrir(); }
            if (e.key === "Escape") cerrar();
        });
        document.addEventListener("click", function () { cerrar(); });

        poblarOpciones(opciones || []);

        wrapper._setPoblacion = function (lista, nuevoPlaceholder) {
            poblarOpciones(lista);
            if (nuevoPlaceholder) { placeholder = nuevoPlaceholder; resetValor(nuevoPlaceholder); }
        };
        wrapper._setValor   = function (val) { seleccionarValor(val); };
        wrapper._reset      = function (nuevoPlaceholder) { resetValor(nuevoPlaceholder); };
        wrapper._getValue   = function () { return valorActual; };

        return wrapper;
    }

    // ── SweetAlert2 helpers ────────────────────────────────────────
    const Swal2 = window.Swal || window.Sweetalert2;

    function ciafAlert({ tipo, titulo, mensaje, timer }) {
        if (!Swal2) return Promise.resolve();
        const iconMap = { success: "success", error: "error", warning: "warning", question: "question", info: "info" };
        return Swal2.fire({
            customClass: { popup: "ciaf-swal" },
            icon: iconMap[tipo] || "info",
            title: titulo,
            html: mensaje || "",
            timer: timer || undefined,
            timerProgressBar: !!timer,
            showConfirmButton: !timer,
            confirmButtonText: "Aceptar"
        });
    }

    function ciafConfirm({ titulo, mensaje, textoConfirm, textoCancel }) {
        if (!Swal2) return Promise.resolve({ isConfirmed: window.confirm(mensaje || titulo) });
        return Swal2.fire({
            customClass: { popup: "ciaf-swal" },
            icon: "question",
            title: titulo,
            html: mensaje || "",
            showCancelButton: true,
            confirmButtonText: textoConfirm || "Sí, continuar",
            cancelButtonText:  textoCancel  || "Cancelar",
            reverseButtons: true
        });
    }

    // ── Utilidades DOM ─────────────────────────────────────────────
    function crearNodo(tag, atributos = {}) {
        const elemento = document.createElement(tag);
        for (const [prop, valor] of Object.entries(atributos)) {
            if      (prop === "text")              elemento.textContent = String(valor);
            else if (prop === "html")              elemento.innerHTML   = sanitizarTexto(valor);
            else if (prop === "value")             elemento.value       = String(valor);
            else if (prop === "disabled" && valor) elemento.setAttribute("disabled", "true");
            else                                   elemento.setAttribute(prop, String(valor));
        }
        return elemento;
    }

    function limpiarElemento(nodo) {
        while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
    }

    // ── Sanitización ──────────────────────────────────────────────
    function sanitizarTexto(valor = "") {
        return String(valor)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[<>$%{}[\]|\\^~`]/g, "")
            .replace(/\s+/g, " ")
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
        return String(valor).replace(/\D/g, "");
    }

    function transicionarModulo(nombreVista) {
        moduloEstado.vistaActiva   = nombreVista;
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
        caja.appendChild(crearNodo("h1", { class: "ciaf-welcome-title",    text: "Bienvenido al Sistema de Horarios CIAF" }));
        caja.appendChild(crearNodo("p",  { class: "ciaf-welcome-subtitle", text: "Seleccione una opción del menú lateral para comenzar." }));
        return caja;
    }

    function componenteFormulario(modo) {
        const contenedorForm = crearNodo("div", {});

        const titulos = { crear: "Crear horario", editar: "Editar horario", borrar: "Borrar horario" };
        contenedorForm.appendChild(crearNodo("h3", { class: "ciaf-form-title", text: titulos[modo] }));

        const bloqueAlertas = crearNodo("div", { class: "ciaf-alerts" });
        contenedorForm.appendChild(bloqueAlertas);

        // Referencias a custom selects
        let csF, csC, csM;

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
                    document.getElementById("formFecha").value       = registro.fechaClase
                        ? registro.fechaClase.split("T")[0] : "";
                    document.getElementById("formHoraInicia").value  = registro.horaIniciaClase  || "";
                    document.getElementById("formHoraTermina").value = registro.horaTerminaClase || "";

                    // Cargar custom selects encadenados
                    if (csF && csC && csM) {
                        const fac = registro.facultad || "";
                        const car = registro.carrera  || "";
                        const mat = registro.materia  || "";

                        const carrerasDisp = fac && DATOS_CIAF[fac] ? Object.keys(DATOS_CIAF[fac]) : [];
                        const materiasDisp = fac && car && DATOS_CIAF[fac] && DATOS_CIAF[fac][car]
                            ? DATOS_CIAF[fac][car] : [];

                        csF._setValor(fac);
                        csC._setPoblacion(carrerasDisp, "-- Seleccione carrera --");
                        if (car) csC._setValor(car);
                        csM._setPoblacion(materiasDisp, "-- Seleccione materia --");
                        if (mat) csM._setValor(mat);
                    }

                    lanzarMensajeFeedback(bloqueAlertas, "Horario cargado.", false);
                } catch (e) { lanzarMensajeFeedback(bloqueAlertas, e.message, true); }
            });
        }

        // Estructura del formulario
        const formTag = crearNodo("form", { class: "ciaf-form-grid" });

        // ── Docente ──
        const divDocente = crearNodo("div", { class: "ciaf-field" });
        divDocente.appendChild(crearNodo("label", { class: "ciaf-label", text: "Docente", for: "formDocente" }));
        const inputDocente = crearNodo("input", { type: "text", class: "ciaf-input", id: "formDocente" });
        if (modo === "borrar") inputDocente.setAttribute("disabled", "true");
        divDocente.appendChild(inputDocente);
        formTag.appendChild(divDocente);

        // ── Facultad — Custom Select ──
        const divFacultad = crearNodo("div", { class: "ciaf-field" });
        divFacultad.appendChild(crearNodo("label", { class: "ciaf-label", text: "Facultad" }));
        csF = crearCustomSelect({
            id: "formFacultad",
            placeholder: "-- Seleccione facultad --",
            opciones: Object.keys(DATOS_CIAF),
            deshabilitado: modo === "borrar",
            onChange: function (val) {
                const carreras = val && DATOS_CIAF[val] ? Object.keys(DATOS_CIAF[val]) : [];
                csC._setPoblacion(carreras, "-- Seleccione carrera --");
                csM._setPoblacion([], "-- Seleccione materia --");
            }
        });
        divFacultad.appendChild(csF);
        formTag.appendChild(divFacultad);

        // ── Carrera — Custom Select ──
        const divCarrera = crearNodo("div", { class: "ciaf-field" });
        divCarrera.appendChild(crearNodo("label", { class: "ciaf-label", text: "Carrera" }));
        csC = crearCustomSelect({
            id: "formCarrera",
            placeholder: "-- Seleccione carrera --",
            opciones: [],
            deshabilitado: modo === "borrar",
            onChange: function (val) {
                const fac = csF._getValue();
                const materias = fac && val && DATOS_CIAF[fac] && DATOS_CIAF[fac][val]
                    ? DATOS_CIAF[fac][val] : [];
                csM._setPoblacion(materias, "-- Seleccione materia --");
            }
        });
        divCarrera.appendChild(csC);
        formTag.appendChild(divCarrera);

        // ── Materia — Custom Select ──
        const divMateria = crearNodo("div", { class: "ciaf-field" });
        divMateria.appendChild(crearNodo("label", { class: "ciaf-label", text: "Materia" }));
        csM = crearCustomSelect({
            id: "formMateria",
            placeholder: "-- Seleccione materia --",
            opciones: [],
            deshabilitado: modo === "borrar"
        });
        divMateria.appendChild(csM);
        formTag.appendChild(divMateria);

        // ── Fecha y horas ──
        [
            { id: "formFecha",       label: "Fecha Clase",        type: "date" },
            { id: "formHoraInicia",  label: "Hora Inicia Clase",  type: "time" },
            { id: "formHoraTermina", label: "Hora Termina Clase", type: "time" }
        ].forEach(c => {
            const divCol = crearNodo("div", { class: "ciaf-field" });
            divCol.appendChild(crearNodo("label", { class: "ciaf-label", text: c.label, for: c.id }));
            const paramsInput = { type: c.type, class: "ciaf-input", id: c.id };
            if (modo === "borrar") paramsInput.disabled = "true";
            divCol.appendChild(crearNodo("input", paramsInput));
            formTag.appendChild(divCol);
        });

        // ── Botones ──
        const colores = { crear: "ciaf-btn-success", editar: "ciaf-btn-warning", borrar: "ciaf-btn-danger" };
        const textos  = { crear: "Guardar",          editar: "Editar",           borrar: "Eliminar" };

        const divBotones = crearNodo("div", { class: "ciaf-form-actions" });
        const btnSubmit  = crearNodo("button", { type: "button", class: `ciaf-btn ${colores[modo]}`, text: textos[modo] });
        const btnCancel  = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost",   text: "Cancelar" });

        divBotones.appendChild(btnSubmit);
        divBotones.appendChild(btnCancel);
        formTag.appendChild(divBotones);
        contenedorForm.appendChild(formTag);

        // ── Eventos ──
        btnCancel.addEventListener("click", () => {
            limpiarElemento(bloqueAlertas);
            transicionarModulo("inicio");
        });

        btnSubmit.addEventListener("click", async () => {

            // ── BORRAR ──
            if (modo === "borrar") {
                if (!moduloEstado.idSeleccionado) {
                    lanzarMensajeFeedback(bloqueAlertas, "Debe buscar una identificación existente antes de eliminar.", true);
                    return;
                }
                const res = await ciafConfirm({
                    titulo: "¿Eliminar horario?",
                    mensaje: "Esta acción <b>no se puede deshacer</b>. ¿Está seguro de borrar el registro?",
                    textoConfirm: "Sí, eliminar",
                    textoCancel: "Cancelar"
                });
                if (res.isConfirmed) {
                    try {
                        await realizarLlamadoAPI("DELETE", "/api/horarios/by-idHorario", { idHorario: moduloEstado.idSeleccionado });
                        lanzarMensajeFeedback(bloqueAlertas, "Horario borrado.", false);
                        btnSubmit.setAttribute("disabled", "true");
                        await ciafAlert({ tipo: "success", titulo: "¡Eliminado!", mensaje: "El horario fue borrado correctamente.", timer: 1800 });
                        transicionarModulo("inicio");
                    } catch (err) {
                        lanzarMensajeFeedback(bloqueAlertas, err.message, true);
                        ciafAlert({ tipo: "error", titulo: "Error", mensaje: err.message });
                    }
                }
                return;
            }

            // ── EDITAR sin cargar ──
            if (modo === "editar" && !moduloEstado.idSeleccionado) {
                lanzarMensajeFeedback(bloqueAlertas, "Debe buscar un horario existente para editar.", true);
                return;
            }

            const payload = {
                docente:          sanitizarTexto(document.getElementById("formDocente").value),
                facultad:         document.getElementById("formFacultad").value,
                carrera:          document.getElementById("formCarrera").value,
                materia:          document.getElementById("formMateria").value,
                fechaClase:       sanitizarTexto(document.getElementById("formFecha").value),
                horaIniciaClase:  sanitizarTexto(document.getElementById("formHoraInicia").value),
                horaTerminaClase: sanitizarTexto(document.getElementById("formHoraTermina").value)
            };

            if (Object.values(payload).some(v => !v)) {
                lanzarMensajeFeedback(bloqueAlertas, "Debes completar los datos del formulario.", true);
                ciafAlert({ tipo: "warning", titulo: "Campos incompletos", mensaje: "Por favor completa todos los campos antes de continuar." });
                return;
            }

            if (modo === "editar") {
                const res = await ciafConfirm({
                    titulo: "¿Editar horario?",
                    mensaje: "Se actualizarán los datos del horario seleccionado.",
                    textoConfirm: "Sí, editar"
                });
                if (!res.isConfirmed) return;
            }

          try {
    if (modo === "crear") {
        await realizarLlamadoAPI("POST", "/api/horarios", payload);
        lanzarMensajeFeedback(bloqueAlertas, "Registro creado.", false);
        btnSubmit.setAttribute("disabled", "true");
        await ciafAlert({ tipo: "success", titulo: "¡Creado!", mensaje: "El horario fue registrado exitosamente.", timer: 1800 });
    } else if (modo === "editar") {
        await realizarLlamadoAPI("PUT", `/api/horarios/${moduloEstado.idSeleccionado}`, payload);
        lanzarMensajeFeedback(bloqueAlertas, "Horario editado.", false);
        btnSubmit.setAttribute("disabled", "true");
        await ciafAlert({ tipo: "success", titulo: "¡Actualizado!", mensaje: "El horario fue editado correctamente.", timer: 1800 });
    }

    transicionarModulo("inicio");

    } catch (ex) {

    console.error("ERROR COMPLETO:", ex);
    console.error("DETALLES:", ex.detalles);

    const msg = ex.detalles?.errors
        ? ex.detalles.errors.join(", ")
        : ex.message;

    lanzarMensajeFeedback(bloqueAlertas, msg, true);

    ciafAlert({
        tipo: "error",
        titulo: "Error al guardar",
        mensaje: msg
    });
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
            [selectOrd, inputBusq, btnFiltrar].forEach(el => el.setAttribute("disabled", "true"));

            try {
                const resList = await realizarLlamadoAPI("GET", "/api/horarios/list");
                limpiarElemento(tbody);

                let arr = Array.isArray(resList?.horarios) ? [...resList.horarios] : [];

                // Buscador
                const terminoBusqueda = moduloEstado.filtrosTable.buscarTermino.trim().toLowerCase();
                if (terminoBusqueda) {
                    arr = arr.filter(item =>
                        Object.values(item).some(valor =>
                            String(valor ?? "").toLowerCase().includes(terminoBusqueda)
                        )
                    );
                }

                // Ordenamiento
                const campoOrden = moduloEstado.filtrosTable.ordenador;
                arr = arr.sort((a, b) => {
                    if (campoOrden === "idHorario") {
                        return (parseInt(a.idHorario) || 0) - (parseInt(b.idHorario) || 0);
                    }
                    const tA = String(a[campoOrden] || "").trim().toLowerCase();
                    const tB = String(b[campoOrden] || "").trim().toLowerCase();
                    return tA < tB ? -1 : tA > tB ? 1 : 0;
                });

                txtConteo.textContent = `Registros: ${arr.length}`;

                if (arr.length === 0) {
                    const trV = crearNodo("tr");
                    trV.appendChild(crearNodo("td", { class: "ciaf-empty", text: "No hay registros para mostrar.", colspan: "8" }));
                    tbody.appendChild(trV);
                } else {
                    arr.forEach(item => {
                        const tr = crearNodo("tr");
                        tr.appendChild(crearNodo("td", { text: item.idHorario,    class: "ciaf-td-id" }));
                        tr.appendChild(crearNodo("td", { text: item.docente }));
                        tr.appendChild(crearNodo("td", { text: item.facultad }));
                        tr.appendChild(crearNodo("td", { text: item.carrera }));
                        tr.appendChild(crearNodo("td", { text: item.materia }));
                        tr.appendChild(crearNodo("td", { text: item.fechaClase }));
                        tr.appendChild(crearNodo("td", { text: item.horaIniciaClase  ? item.horaIniciaClase.substring(0,5)  : "" }));
                        tr.appendChild(crearNodo("td", { text: item.horaTerminaClase ? item.horaTerminaClase.substring(0,5) : "" }));
                        tbody.appendChild(tr);
                    });
                }

            } catch (err) {
                console.error(err);
                ciafAlert({ tipo: "error", titulo: "Error al cargar", mensaje: "No se pudo obtener el listado de horarios." });
            } finally {
                [selectOrd, inputBusq, btnFiltrar].forEach(el => el.removeAttribute("disabled"));
            }
        }

        btnFiltrar.addEventListener("click", () => {
            moduloEstado.filtrosTable.ordenador     = selectOrd.value;
            moduloEstado.filtrosTable.buscarTermino = sanitizarBusqueda(inputBusq.value);
            cargarDatos();
        });

        selectOrd.addEventListener("change", () => {
            moduloEstado.filtrosTable.ordenador = selectOrd.value;
            cargarDatos();
        });

        inputBusq.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                moduloEstado.filtrosTable.ordenador     = selectOrd.value;
                moduloEstado.filtrosTable.buscarTermino = sanitizarBusqueda(inputBusq.value);
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
        brand.appendChild(crearNodo("div",  { class: "ciaf-brand-icon", text: "H" }));
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
            { clave: "crear",  etiqueta: "Crear horario",       iconChar: "+" },
            { clave: "editar", etiqueta: "Editar horario",      iconChar: "✏" },
            { clave: "borrar", etiqueta: "Borrar horario",      iconChar: "✕" },
            { clave: "listar", etiqueta: "Listado de horarios", iconChar: "≡" }
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