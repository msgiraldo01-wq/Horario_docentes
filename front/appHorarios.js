/**
 * Archivo principal del Frontend (Código del lado del cliente).
 * Controla por completo la interfaz visual (botones, tablas, formularios, menús)
 * e interactúa con el servidor (Backend) mediante peticiones por internet.
 */

// Usamos una función autoejecutable (IIFE) para envolver todo nuestro código.
// Esto sirve para proteger nuestras variables y funciones para que no se mezclen ni choquen
// con códigos de otras librerías externas que use la página.
(function () {
    // Busca en la página HTML el contenedor principal con el ID "serverApplication".
    // Aquí es donde pintaremos dinámicamente toda la interfaz visual.
    const mainContainer = document.getElementById("serverApplication");

    // ── 1. CARGA DE TIPOGRAFÍA (LETRA) ──────────────────────────────────
    // Creamos una etiqueta <link> en el documento para cargar la fuente de letra "Outfit" desde Google Fonts.
    const fontElement = document.createElement("link");
    fontElement.rel = "stylesheet"; // Indica que es una hoja de estilos.
    fontElement.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"; // Enlace de la tipografía.
    document.head.appendChild(fontElement); // Agrega la etiqueta <link> dentro del <head> de la página.

    // ── 2. ESTILOS VISUALES EN CSS (DISEÑO) ──────────────────────────────────
    // Creamos una etiqueta <style> para definir el diseño visual, colores, botones y animaciones del aplicativo.
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        /* Reseteo básico: quita márgenes y rellenos por defecto, y define el tamaño de caja de manera uniforme */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Definición de variables de colores del tema institucional (paleta de colores moderna) */
        :root {
            --bg: rgb(210, 210, 210); /* Color de fondo general de la página */
            --surface:    #ffffff;    /* Color de fondo para paneles y tarjetas (blanco) */
            --sidebar-bg: #1c1917;    /* Color de fondo del menú lateral (gris muy oscuro) */
            --border:     #e7e5e4;    /* Color para las líneas divisoras o bordes */
            --text:       #1c1917;    /* Color de los textos principales (casi negro) */
            --muted:      #78716c;    /* Color para textos secundarios o explicaciones (gris apagado) */
            --c-crear:    #16a34a;    /* Color verde para acciones de registro o éxito */
            --c-editar:   #d97706;    /* Color naranja para acciones de edición */
            --c-borrar:   #dc2626;    /* Color rojo para acciones de eliminación o peligro */
            --c-listar:   #2563eb;    /* Color azul para visualización de listas o información */
            --radius:     10px;       /* Esquinas redondeadas estándar */
            --shadow:     0 1px 3px rgba(0,0,0,.07), 0 6px 20px rgba(0,0,0,.06); /* Sombreado suave de tarjetas */
        }

        /* Estilo general para el cuerpo del sitio web */
        body {
            font-family: 'Outfit', sans-serif; /* Aplica la fuente Outfit cargada de Google Fonts */
            background: var(--bg); /* Usa el fondo gris */
            background-image: radial-gradient(circle, #d6d3d1 1px, transparent 1px); /* Crea un patrón de puntos sutil en el fondo */
            background-size: 24px 24px; /* Tamaño del patrón de puntos */
            color: var(--text); /* Color de texto predeterminado */
            min-height: 100vh; /* Altura mínima de toda la pantalla */
        }

        /* Barra de navegación superior */
        .ciaf-header {
            position: sticky; top: 0; z-index: 100; /* Permanece fija arriba al hacer scroll */
            background: var(--surface); /* Fondo blanco */
            border-bottom: 1px solid var(--border); /* Línea divisora inferior */
            height: 60px; padding: 0 2rem;
            display: flex; align-items: center; justify-content: space-between; /* Distribuye elementos a los extremos */
        }

        /* Título del aplicativo en la barra superior */
        .ciaf-brand {
            display: flex; align-items: center; gap: .6rem;
            font-size: .95rem; font-weight: 700; letter-spacing: -.02em;
        }
        /* Icono de la marca */
        .ciaf-brand-icon {
            width: 30px; height: 30px; border-radius: 7px;
            background: var(--c-listar); /* Fondo azul */
            display: grid; place-items: center;
            color: #fff; font-size: .85rem; font-weight: 800;
            flex-shrink: 0;
        }

        /* Área de información del usuario arriba a la derecha */
        .ciaf-user-area {
            display: flex; align-items: center; gap: 1rem;
            font-size: .85rem; color: var(--muted);
        }

        /* Botón de salir de la aplicación */
        .ciaf-btn-exit {
            display: flex; align-items: center; gap: .4rem;
            padding: .38rem .9rem;
            border: 1.5px solid var(--border); border-radius: 6px;
            background: transparent; color: var(--muted);
            font-family: 'Outfit', sans-serif; font-size: .8rem; font-weight: 500;
            cursor: pointer; transition: all .15s;
        }
        /* Efecto al pasar el cursor sobre el botón de salir */
        .ciaf-btn-exit:hover { background: #fef2f2; border-color: #fca5a5; color: var(--c-borrar); }

        /* Contenedor o cuadrícula principal de la aplicación */
        .ciaf-layout {
            display: grid;
            grid-template-columns: 240px 1fr; /* Columna izquierda para menú y derecha para contenido */
            gap: 1.5rem;
            padding: 1.5rem 2rem 2rem;
            max-width: 1200px;
            margin: 0 auto; /* Centra el contenido en pantallas grandes */
        }
        /* Ajuste para pantallas pequeñas (Celulares) */
        @media (max-width: 768px) {
            .ciaf-layout { grid-template-columns: 1fr; padding: 1rem; }
        }

        /* Menú lateral (Sidebar) */
        .ciaf-sidebar {
            background: var(--sidebar-bg); /* Fondo oscuro */
            border-radius: var(--radius);
            padding: 1.25rem;
            height: fit-content;
            position: sticky; top: 76px; /* Se queda fijo al hacer scroll vertical */
        }

        /* Título de la sección del menú lateral */
        .ciaf-sidebar-title {
            font-size: .62rem; font-weight: 700;
            letter-spacing: .12em; text-transform: uppercase;
            color: #57534e; margin-bottom: .8rem; padding: 0 .25rem;
        }

        /* Lista de botones de navegación */
        .ciaf-nav { display: flex; flex-direction: column; gap: .2rem; }

        /* Botón individual del menú lateral */
        .ciaf-nav-item {
            display: flex; align-items: center; gap: .65rem;
            width: 100%; padding: .65rem .8rem;
            border: none; border-radius: 7px;
            background: transparent; color: #a8a29e;
            font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 400;
            cursor: pointer; text-align: left;
            transition: all .15s;
        }
        /* Efecto al pasar el cursor sobre los botones del menú */
        .ciaf-nav-item:hover { background: rgba(255,255,255,.07); color: #e7e5e4; }
        /* Estilo especial cuando el botón está activo/seleccionado */
        .ciaf-nav-item.active { font-weight: 600; }

        /* Colores específicos de estado activo para cada botón */
        .ciaf-nav-item.active-crear  { background: rgba(22,163,74,.18);  color: #86efac; }
        .ciaf-nav-item.active-editar { background: rgba(217,119,6,.18);  color: #fcd34d; }
        .ciaf-nav-item.active-borrar { background: rgba(220,38,38,.18);  color: #fca5a5; }
        .ciaf-nav-item.active-listar { background: rgba(37,99,235,.18);  color: #93c5fd; }

        /* Icono dentro del botón de navegación */
        .ciaf-nav-icon {
            font-size: .95rem; width: 1.1rem;
            text-align: center; flex-shrink: 0;
        }

        /* Pie de página dentro del menú lateral */
        .ciaf-sidebar-footer {
            margin-top: 1.25rem; padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,.07);
            font-size: .7rem; color: #57534e;
            display: flex; align-items: center; gap: .4rem;
        }

        /* Panel o espacio principal donde se pintan los módulos (Derecha) */
        .ciaf-panel {
            background: var(--surface); /* Fondo blanco */
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 2rem; min-height: 420px;
        }
        /* Animación de entrada suave para el contenido del panel */
        .ciaf-panel > * { animation: fadeUp .22s ease-out; }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* Vista de Bienvenida por defecto */
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

        /* Alertas y avisos en pantalla */
        .ciaf-alerts { min-height: .5rem; margin-bottom: 1rem; }
        .ciaf-alert {
            padding: .7rem 1rem; border-radius: 7px;
            font-size: .875rem; font-weight: 500;
            border: 1px solid transparent;
        }
        /* Alerta de éxito (verde) */
        .ciaf-alert-success { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        /* Alerta de error (rojo) */
        .ciaf-alert-error   { background: #fef2f2; color: #991b1b; border-color: #fecaca; }

        /* Títulos de los formularios */
        .ciaf-form-title {
            font-size: 1.2rem; font-weight: 700;
            letter-spacing: -.02em; margin-bottom: 1.25rem;
        }

        /* Barra para buscar un registro por ID */
        .ciaf-search-bar { display: flex; gap: .5rem; margin-bottom: 1.5rem; }

        /* Cuadrícula o distribución del formulario en dos columnas */
        .ciaf-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.1rem;
        }
        @media (max-width: 600px) { .ciaf-form-grid { grid-template-columns: 1fr; } }

        /* Fila de botones de acción en el formulario */
        .ciaf-form-actions {
            grid-column: 1 / -1;
            display: flex; gap: .7rem; margin-top: .5rem;
        }

        /* Contenedor de etiqueta + campo de entrada */
        .ciaf-field { display: flex; flex-direction: column; gap: .35rem; }

        /* Etiquetas de texto de los campos de entrada */
        .ciaf-label {
            font-size: .7rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: .06em; color: var(--muted);
        }

        /* Campos de texto y entradas normales */
        .ciaf-input {
            width: 100%; padding: .6rem .8rem;
            border: 1.5px solid var(--border); border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .9rem; color: var(--text);
            background: var(--surface); outline: none;
            transition: border-color .15s, box-shadow .15s;
        }
        /* Efecto al hacer clic/foco en una entrada */
        .ciaf-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        /* Entrada deshabilitada */
        .ciaf-input:disabled { background: #fafaf9; color: var(--muted); cursor: not-allowed; }

        /* Diseño de botones generales */
        .ciaf-btn {
            padding: .58rem 1.4rem;
            border: none; border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .875rem; font-weight: 600;
            cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .ciaf-btn:disabled { opacity: .45; cursor: not-allowed; }

        /* Botón verde para guardar */
        .ciaf-btn-success { background: var(--c-crear); color: #fff; }
        .ciaf-btn-success:hover:not(:disabled) { background: #15803d; }

        /* Botón naranja para editar */
        .ciaf-btn-warning { background: var(--c-editar); color: #fff; }
        .ciaf-btn-warning:hover:not(:disabled) { background: #b45309; }

        /* Botón rojo para borrar */
        .ciaf-btn-danger { background: var(--c-borrar); color: #fff; }
        .ciaf-btn-danger:hover:not(:disabled) { background: #b91c1c; }

        /* Botón azul principal */
        .ciaf-btn-primary { background: var(--c-listar); color: #fff; }
        .ciaf-btn-primary:hover:not(:disabled) { background: #1d4ed8; }

        /* Botón de cancelar */
        .ciaf-btn-ghost {
            background: #f5f5f4; color: var(--muted);
            border: 1.5px solid var(--border);
        }
        .ciaf-btn-ghost:hover { background: #e7e5e4; color: var(--text); }

        /* Botón transparente con bordes */
        .ciaf-btn-outline {
            background: transparent; color: var(--muted);
            border: 1.5px solid var(--border);
        }
        .ciaf-btn-outline:hover { background: var(--bg); }

        /* Elementos de la lista y tablas */
        .ciaf-list-title {
            font-size: 1.2rem; font-weight: 700;
            letter-spacing: -.02em; margin-bottom: 1.25rem;
        }

        /* Sección de filtros arriba de las listas */
        .ciaf-filters { display: flex; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }

        /* Selectores normales en CSS */
        .ciaf-select {
            padding: .5rem .75rem;
            border: 1.5px solid var(--border); border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .85rem;
            background: var(--surface); color: var(--text);
            outline: none; cursor: pointer;
        }
        .ciaf-select:focus  { border-color: #93c5fd; }
        .ciaf-select:disabled { opacity: .5; }

        /* Caja de búsqueda pequeña */
        .ciaf-input-sm {
            flex: 1; min-width: 150px;
            padding: .5rem .75rem;
            border: 1.5px solid var(--border); border-radius: 7px;
            font-family: 'Outfit', sans-serif; font-size: .85rem; color: var(--text);
            background: var(--surface); outline: none;
        }
        .ciaf-input-sm:focus   { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .ciaf-input-sm:disabled { opacity: .5; }

        /* Envoltura para poder hacer scroll horizontal en tablas en celulares */
        .ciaf-table-wrap {
            overflow-x: auto;
            border: 1.5px solid var(--border); border-radius: var(--radius);
        }

        /* Tabla de registros */
        .ciaf-table { width: 100%; border-collapse: collapse; font-size: .84rem; }

        /* Encabezado de la tabla */
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
        /* Celdas de datos */
        .ciaf-table td {
            padding: .7rem 1rem;
            border-bottom: 1px solid #f5f5f4; color: var(--text);
        }
        .ciaf-table tbody tr:hover { background: #fafaf9; }
        .ciaf-table tbody tr:last-child td { border-bottom: none; }

        .ciaf-td-id { font-weight: 700; color: var(--c-listar); }

        /* Pie de la tabla (Paginación/Resumen) */
        .ciaf-table-footer {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 1rem;
        }
        /* Globo con el conteo de registros */
        .ciaf-count {
            font-size: .78rem; font-weight: 600; color: var(--muted);
            background: #f5f5f4; padding: .28rem .75rem; border-radius: 20px;
        }
        /* Mensaje de tabla vacía */
        .ciaf-empty {
            text-align: center; color: var(--muted);
            padding: 2.5rem 1rem; font-size: .9rem;
        }

        /* Vista de pantalla de salida */
        .ciaf-exit {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            text-align: center; padding: 4rem 2rem; gap: 1rem;
        }
        .ciaf-exit-icon     { font-size: 2.5rem; opacity: .25; }
        .ciaf-exit-title    { font-size: 1.2rem; font-weight: 700; color: var(--c-borrar); }
        .ciaf-exit-subtitle { font-size: .9rem; color: var(--muted); }

        /* ── Menú Desplegable Personalizado (Custom Select) ── */
        .cs-wrapper {
            position: relative;
            user-select: none;
        }
        /* Botón visible del menú desplegable */
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
        /* Estado abierto del menú desplegable */
        .cs-display.cs-open {
            border-color: #93c5fd;
            box-shadow: 0 0 0 3px rgba(37,99,235,.1);
        }
        /* Desplegable deshabilitado */
        .cs-display.cs-disabled {
            background: #fafaf9;
            color: var(--muted);
            cursor: not-allowed;
            pointer-events: none;
        }
        .cs-placeholder { color: var(--muted); }
        /* Flecha indicadora de apertura */
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
        /* Rota la flecha al abrirse */
        .cs-display.cs-open .cs-chevron {
            transform: rotate(180deg);
            background: var(--c-listar);
            color: #fff;
        }
        /* Contenedor de opciones ocultas */
        .cs-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0; right: 0;
            background: var(--surface);
            border: 1.5px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,.10);
            z-index: 9999;
            max-height: 0; /* Empieza oculto sin ocupar espacio */
            overflow: hidden;
            opacity: 0;
            transition: max-height .28s cubic-bezier(.4,0,.2,1), opacity .2s; /* Animación suave al desplegar */
        }
        /* Contenedor abierto */
        .cs-dropdown.cs-dropdown-open {
            max-height: 220px;
            opacity: 1;
            overflow-y: auto; /* Permite scroll vertical si hay muchas opciones */
        }
        /* Personalización de la barra de scroll del desplegable */
        .cs-dropdown::-webkit-scrollbar { width: 4px; }
        .cs-dropdown::-webkit-scrollbar-thumb { background: var(--c-listar); border-radius: 4px; }
        
        /* Opción individual de la lista desplegable */
        .cs-option {
            padding: 9px 14px;
            font-family: 'Outfit', sans-serif;
            font-size: .875rem;
            color: var(--text);
            cursor: pointer;
            transition: background .15s, color .15s, padding-left .15s;
            display: flex; align-items: center; gap: 8px;
        }
        /* Efecto al pasar cursor por una opción */
        .cs-option:hover {
            background: #eff6ff;
            color: var(--c-listar);
            padding-left: 20px; /* Desplaza el texto ligeramente a la derecha */
        }
        /* Opción que se encuentra actualmente seleccionada */
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
        /* Punto decorativo al lado de cada opción */
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
        /* ── Toast superior ──────────────────────────── */
        .ciaf-toast-container {
            position: fixed;
            top: 1.2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            align-items: center;
            pointer-events: none;
        }

        .ciaf-toast {
            min-width: 280px;
            max-width: 420px;
            padding: .85rem 1.4rem;
            border-radius: 10px;
            font-family: 'Outfit', sans-serif;
            font-size: .9rem;
            font-weight: 600;
            color: #fff;
            box-shadow: 0 8px 24px rgba(0,0,0,.18);
            display: flex;
            align-items: center;
            gap: .65rem;
            animation: toastEntrada .3s ease-out forwards;
        }

        .ciaf-toast-crear  { background: #16a34a; }
        .ciaf-toast-editar { background: #d97706; }
        .ciaf-toast-borrar { background: #dc2626; }
        .ciaf-toast-listar { background: #2563eb; }

        @keyframes toastEntrada {
            from { opacity: 0; transform: translateY(-16px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes toastSalida {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(-16px); }
        }
        `;
    // Añade el bloque de código CSS dentro del <head> de la página.
    document.head.appendChild(styleElement);

    // ── 3. ESTADO GLOBAL DE LA APLICACIÓN ──────────────────────────────────
    const moduloEstado = {
        vistaActiva: "inicio",
        idSeleccionado: null,
        filtrosTable: {
            ordenador: "idHorario",
            buscarTermino: ""
        }
    };

    // ── 4. DICCIONARIO DE DATOS INSTITUCIONALES (CIAF) ──────────────────────────────────
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

    // ── 5. CONSTRUCTOR DE SELECTORES PERSONALIZADOS (Custom Selects) ──────────────────────────────────
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
        wrapper._setValor = function (val) { seleccionarValor(val); };
        wrapper._reset = function (nuevoPlaceholder) { resetValor(nuevoPlaceholder); };
        wrapper._getValue = function () { return valorActual; };

        return wrapper;
    }

    // ══════════════════════════════════════════════════════════════
    // TOAST — alerta superior animada sin librerías
    // ══════════════════════════════════════════════════════════════
    function mostrarToast(mensaje, tipo) {
        const iconos = { crear: "✅", editar: "✏️", borrar: "🗑️", listar: "🔍" };

        let contenedor = document.getElementById("ciaf-toast-container");

        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.id = "ciaf-toast-container";
            contenedor.className = "ciaf-toast-container";
            document.body.appendChild(contenedor);
        }

        const toast = document.createElement("div");
        toast.className = "ciaf-toast ciaf-toast-" + tipo;

        const icono = document.createElement("span");
        icono.textContent = iconos[tipo] || "ℹ️";

        const texto = document.createElement("span");
        texto.textContent = mensaje;

        toast.appendChild(icono);
        toast.appendChild(texto);

        contenedor.appendChild(toast);

        setTimeout(function () {
            toast.style.animation = "toastSalida .3s ease-in forwards";
            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // ── 6. UTILIDADES PARA EL MANEJO DEL DISEÑO VISUAL (DOM) ──────────────────────────────────

    // Función de ayuda rápida para crear elementos HTML sin tener que escribir código repetitivo.
    function crearNodo(tag, atributos = {}) {
        const elemento = document.createElement(tag);
        for (const [prop, valor] of Object.entries(atributos)) {
            if (prop === "text") elemento.textContent = String(valor);
            else if (prop === "html") elemento.innerHTML = sanitizarTexto(valor);
            else if (prop === "value") elemento.value = String(valor);
            else if (prop === "disabled" && valor) elemento.setAttribute("disabled", "true");
            else elemento.setAttribute(prop, String(valor));
        }
        return elemento;
    }

    // Función rápida para borrar todos los elementos que están dentro de una caja HTML.
    function limpiarElemento(nodo) {
        while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
    }

    // ── 7. LIMPIEZA Y SEGURIDAD DE ENTRADAS (Sanitización) ──────────────────────────────────
    // [Req. Gral #3] Todas las entradas de usuario deben ser sanitizadas.

    // Convierte el texto a mayúsculas y borra caracteres que puedan dañar la página.
    function sanitizarTexto(valor = "") {
        return String(valor)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[<>$%{}[\]|\\^~`]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
    }

    // Limpia el texto ingresado en la barra de búsqueda (lo convierte a minúsculas y quita códigos).
    function sanitizarBusqueda(valor = "") {
        return String(valor)
            .replace(/[<>$%{}[\]|\\^~`]/g, "")
            .trim()
            .toLowerCase();
    }

    // Elimina cualquier letra o símbolo del texto, dejando únicamente los números enteros.
    function sanitizarNumero(valor = "") {
        return String(valor).replace(/\D/g, "");
    }

    // Cambia la vista o pantalla activa de la aplicación y vuelve a dibujar el diseño básico.
    function transicionarModulo(nombreVista) {
        moduloEstado.vistaActiva = nombreVista;
        moduloEstado.idSeleccionado = null;
        renderizarEstructuraBase();
    }

    // ── 8. ENVIAR Y RECIBIR DATOS DEL SERVIDOR (Cliente API) ──────────────────────────────────
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

    // Muestra un cartel visual de aviso en una sección específica del formulario.
    function lanzarMensajeFeedback(zona, texto, esError = false) {
        limpiarElemento(zona);
        if (!texto) return;
        zona.appendChild(crearNodo("div", {
            class: `ciaf-alert ${esError ? "ciaf-alert-error" : "ciaf-alert-success"}`,
            text: texto
        }));
    }

    // ==========================================
    // ── 9. COMPONENTES VISUALES DINÁMICOS ──
    // ==========================================

    // Genera la vista de bienvenida por defecto cuando se abre la aplicación.
    function vistaBienvenida() {
        const caja = crearNodo("div", { class: "ciaf-welcome" });
        caja.appendChild(crearNodo("div", { class: "ciaf-welcome-icon", text: "◈" }));
        caja.appendChild(crearNodo("h1", { class: "ciaf-welcome-title", text: "Bienvenido al Sistema de Horarios CIAF" }));
        caja.appendChild(crearNodo("p", { class: "ciaf-welcome-subtitle", text: "Seleccione una opción del menú lateral para comenzar." }));
        return caja;
    }

    // Genera la vista del formulario. Esta misma función sirve para CREAR, EDITAR o ELIMINAR un horario.
    function componenteFormulario(modo) {
        const contenedorForm = crearNodo("div", {});

        // Define el título de la pantalla según el modo elegido.
        const titulos = { crear: "Crear horario", editar: "Editar horario", borrar: "Borrar horario" };
        contenedorForm.appendChild(crearNodo("h3", { class: "ciaf-form-title", text: titulos[modo] }));

        // Bloque vacío donde se irán mostrando los mensajes de éxito o error.
        const bloqueAlertas = crearNodo("div", { class: "ciaf-alerts" });
        contenedorForm.appendChild(bloqueAlertas);

        // Variables vacías para guardar las referencias de nuestros selectores personalizados.
        let csF, csC, csM;

        // [Req. Front #18] [Req. Front #27] Si estamos en modo Editar o Eliminar, agregamos barra de búsqueda.
        if (modo === "editar" || modo === "borrar") {
            const controlBusqueda = crearNodo("div", { class: "ciaf-search-bar" });
            const inputId = crearNodo("input", {
                type: "number", class: "ciaf-input",
                id: "buscarIdHorario", placeholder: "Escriba el idHorario..."
            });
            // [Req. Front #19] En "Editar horario", el botón "Buscar" busca por el valor de "idHorario".
            const btnBuscar = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-outline", text: "Buscar" });

            controlBusqueda.appendChild(inputId);
            controlBusqueda.appendChild(btnBuscar);
            contenedorForm.appendChild(controlBusqueda);

            // Al hacer clic en "Buscar":
            btnBuscar.addEventListener("click", async () => {
                const idValue = sanitizarNumero(inputId.value);
                // [Req. Front #20] Si el usuario presiona "Buscar" sin digitar idHorario.
                if (!idValue) { lanzarMensajeFeedback(bloqueAlertas, "Debe digitar el ID a buscar.", true); return; }

                try {
                    const registro = await realizarLlamadoAPI("GET", `/api/horarios/byidHorario?idHorario=${idValue}`);
                    // [Req. Front #22] Si la búsqueda no encuentra el registro.
                    if (!registro) { lanzarMensajeFeedback(bloqueAlertas, "El horario no existe.", true); return; }

                    moduloEstado.idSeleccionado = idValue;

                    document.getElementById("formDocente").value = registro.docente || "";
                    document.getElementById("formFecha").value = registro.fechaClase
                        ? registro.fechaClase.split("T")[0] : "";
                    document.getElementById("formHoraInicia").value = registro.horaIniciaClase || "";
                    document.getElementById("formHoraTermina").value = registro.horaTerminaClase || "";

                    // Carga los selectores encadenados (Facultad -> Carrera -> Materia).
                    if (csF && csC && csM) {
                        const fac = registro.facultad || "";
                        const car = registro.carrera || "";
                        const mat = registro.materia || "";

                        const carrerasDisp = fac && DATOS_CIAF[fac] ? Object.keys(DATOS_CIAF[fac]) : [];
                        const materiasDisp = fac && car && DATOS_CIAF[fac] && DATOS_CIAF[fac][car]
                            ? DATOS_CIAF[fac][car] : [];

                        csF._setValor(fac);
                        csC._setPoblacion(carrerasDisp, "-- Seleccione carrera --");
                        if (car) csC._setValor(car);
                        csM._setPoblacion(materiasDisp, "-- Seleccione materia --");
                        if (mat) csM._setValor(mat);
                    }

                    // [Req. Front #21] Si la búsqueda encuentra un registro.
                    lanzarMensajeFeedback(bloqueAlertas, "Horario cargado.", false);
                } catch (e) { lanzarMensajeFeedback(bloqueAlertas, e.message, true); }
            });
        }

        // Creamos la etiqueta <form> con la cuadrícula de campos.
        // [Req. Front #6] El formulario muestra los campos: docente, facultad, carrera, materia, fechaClase, horaInicioClase, horaTerminaClase
        const formTag = crearNodo("form", { class: "ciaf-form-grid" });

        // ── Campo de Texto: Docente ──
        const divDocente = crearNodo("div", { class: "ciaf-field" });
        divDocente.appendChild(crearNodo("label", { class: "ciaf-label", text: "Docente", for: "formDocente" }));
        const inputDocente = crearNodo("input", { type: "text", class: "ciaf-input", id: "formDocente" });
        // [Req. Front #28] En "Borrar horario", los campos están deshabilitados.
        if (modo === "borrar") inputDocente.setAttribute("disabled", "true");
        divDocente.appendChild(inputDocente);
        formTag.appendChild(divDocente);

        // ── Selector de Facultad ──
        const divFacultad = crearNodo("div", { class: "ciaf-field" });
        divFacultad.appendChild(crearNodo("label", { class: "ciaf-label", text: "Facultad" }));
        // [Req. Front #7] El campo "facultad" es una lista de las facultades de CIAF.
        csF = crearCustomSelect({
            id: "formFacultad",
            placeholder: "-- Seleccione facultad --",
            opciones: Object.keys(DATOS_CIAF),
            deshabilitado: modo === "borrar",
            onChange: function (val) {
                // Cuando cambie la facultad, actualiza el selector de carreras.
                const carreras = val && DATOS_CIAF[val] ? Object.keys(DATOS_CIAF[val]) : [];
                csC._setPoblacion(carreras, "-- Seleccione carrera --");
                csM._setPoblacion([], "-- Seleccione materia --");
            }
        });
        divFacultad.appendChild(csF);
        formTag.appendChild(divFacultad);

        // ── Selector de Carrera ──
        const divCarrera = crearNodo("div", { class: "ciaf-field" });
        divCarrera.appendChild(crearNodo("label", { class: "ciaf-label", text: "Carrera" }));
        // [Req. Front #8] El campo "carrera" es una lista de las carreras por facultad de CIAF.
        csC = crearCustomSelect({
            id: "formCarrera",
            placeholder: "-- Seleccione carrera --",
            opciones: [],
            deshabilitado: modo === "borrar",
            onChange: function (val) {
                // Al elegir una carrera, carga las materias correspondientes.
                const fac = csF._getValue();
                const materias = fac && val && DATOS_CIAF[fac] && DATOS_CIAF[fac][val]
                    ? DATOS_CIAF[fac][val] : [];
                csM._setPoblacion(materias, "-- Seleccione materia --");
            }
        });
        divCarrera.appendChild(csC);
        formTag.appendChild(divCarrera);

        // ── Selector de Materia ──
        const divMateria = crearNodo("div", { class: "ciaf-field" });
        divMateria.appendChild(crearNodo("label", { class: "ciaf-label", text: "Materia" }));
        // [Req. Front #9] El campo "materia" es una lista de las materias por carrera de CIAF.
        csM = crearCustomSelect({
            id: "formMateria",
            placeholder: "-- Seleccione materia --",
            opciones: [],
            deshabilitado: modo === "borrar"
        });
        divMateria.appendChild(csM);
        formTag.appendChild(divMateria);

        // ── Campos de Fecha y Horas ──
        [
            { id: "formFecha", label: "Fecha Clase", type: "date" },
            { id: "formHoraInicia", label: "Hora Inicia Clase", type: "time" },
            { id: "formHoraTermina", label: "Hora Termina Clase", type: "time" }
        ].forEach(campo => {
            const divCol = crearNodo("div");
            divCol.appendChild(
                crearNodo("label", {
                    class: "ciaf-label",
                    text: campo.label,
                    for: campo.id
                })
            );

            const inputCampo = crearNodo("input", {
                type: campo.type,
                class: "ciaf-input",
                id: campo.id
            });

            // Apaga el campo si estamos en modo borrar.
            if (modo === "borrar") inputCampo.setAttribute("disabled", "true");

            // Configura que no se puedan seleccionar días del pasado en el calendario.
            if (campo.id === "formFecha") {
                const hoy = new Date();
                // Ajusta la diferencia horaria local para calcular correctamente el día actual.
                hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
                // Define la fecha mínima elegible (el día de hoy en formato Año-Mes-Día).
                inputCampo.min = hoy.toISOString().split("T")[0];
            }

            divCol.appendChild(inputCampo);
            formTag.appendChild(divCol);
        });

        // ── Botones del Formulario ──
        const colores = { crear: "ciaf-btn-success", editar: "ciaf-btn-warning", borrar: "ciaf-btn-danger" };
        const textos = { crear: "Guardar", editar: "Editar", borrar: "Eliminar" };

        // [Req. Front #10] Botón principal y botón "Cancelar".
        const divBotones = crearNodo("div", { class: "ciaf-form-actions" });
        const btnSubmit = crearNodo("button", { type: "button", class: `ciaf-btn ${colores[modo]}`, text: textos[modo] });
        const btnCancel = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost", text: "Cancelar" });

        divBotones.appendChild(btnSubmit);
        divBotones.appendChild(btnCancel);
        formTag.appendChild(divBotones);
        contenedorForm.appendChild(formTag);

        // ── CONTROLADORES DE EVENTOS DE LOS BOTONES ──

        // Al hacer clic en "Cancelar":
        // [Req. Front #17] Al presionar "Cancelar", limpia y regresa al menú.
        btnCancel.addEventListener("click", () => {
            limpiarElemento(bloqueAlertas);
            transicionarModulo("inicio");
        });

        // Al hacer clic en el botón principal (Guardar, Editar o Eliminar):
        btnSubmit.addEventListener("click", async () => {

            // ── CASO: ELIMINAR ──
            if (modo === "borrar") {
                // [Req. Front #29, #30] Si intenta eliminar sin haber cargado un registro.
                if (!moduloEstado.idSeleccionado) {
                    lanzarMensajeFeedback(bloqueAlertas, "Debe buscar una identificación existente antes de eliminar.", true);
                    return;
                }

                // Muestra un aviso de confirmación. [Req. Front #31]
                const confirmado = confirm("¿Eliminar horario?\n\nEsta acción no se puede deshacer. ¿Está seguro de borrar el registro?");

                if (confirmado) {
                    try {
                        await realizarLlamadoAPI("DELETE", "/api/horarios/byidHorario", { idHorario: moduloEstado.idSeleccionado });
                        lanzarMensajeFeedback(bloqueAlertas, "Horario borrado.", false); //[Req. Front #33]
                        btnSubmit.setAttribute("disabled", "true");
                        mostrarToast("El horario fue borrado correctamente.", "borrar"); //[Req. Front #32]
                        transicionarModulo("inicio");
                    } catch (err) {
                        lanzarMensajeFeedback(bloqueAlertas, err.message, true);
                        mostrarToast(err.message, "borrar");
                    }
                }
                return;
            }

            // ── CASO: EDITAR sin haber buscado antes un registro ──
            if (modo === "editar" && !moduloEstado.idSeleccionado) { //[REQ. FRONT #23]
                lanzarMensajeFeedback(bloqueAlertas, "Debe buscar un horario existente para editar.", true);
                return;
            }

            // Recoge toda la información ingresada por el usuario en el formulario.
            const payload = {
                docente: sanitizarTexto(document.getElementById("formDocente").value),
                facultad: document.getElementById("formFacultad").value, // Lee valor del input oculto.
                carrera: document.getElementById("formCarrera").value,  // Lee valor del input oculto.
                materia: document.getElementById("formMateria").value,  // Lee valor del input oculto.
                fechaClase: sanitizarTexto(document.getElementById("formFecha").value),
                horaIniciaClase: sanitizarTexto(document.getElementById("formHoraInicia").value),
                horaTerminaClase: sanitizarTexto(document.getElementById("formHoraTermina").value)
            };

            // VALIDACIÓN: Comprueba si falta algún dato. [REQ. FRONT #11]
            if (Object.values(payload).some(v => !v)) {
                lanzarMensajeFeedback(bloqueAlertas, "Debes completar los datos del formulario.", true); //[REQ. FRONT #12]
                mostrarToast("Por favor completa todos los campos antes de continuar.", "editar");
                return;
            }

            // Helper para convertir formato de hora "HH:MM" a minutos del día.
            const convertirMinutos = (hora) => {
                const [h, m] = hora.split(":").map(Number);
                return (h * 60) + m;
            };

            const inicio = convertirMinutos(payload.horaIniciaClase);
            const fin = convertirMinutos(payload.horaTerminaClase);
            const duracion = fin - inicio;

            // VALIDACIÓN: Hora de inicio debe ser anterior a la hora de término.
            if (inicio >= fin) {
                lanzarMensajeFeedback(bloqueAlertas, "La hora de inicio debe ser menor que la hora de finalización.", true);
                return;
            }

            // VALIDACIÓN: La fecha seleccionada no debe ser anterior al día de hoy.
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Ajusta a medianoche para comparar solo días.
            const fechaSeleccionada = new Date(payload.fechaClase + "T00:00:00");
            if (fechaSeleccionada < hoy) {
                lanzarMensajeFeedback(bloqueAlertas, "No puedes registrar horarios en fechas anteriores.", true);
                return;
            }

            // VALIDACIÓN: Si la fecha es hoy, la hora de inicio no puede ser menor o igual a la hora actual.
            if (fechaSeleccionada.getTime() === hoy.getTime()) {
                const ahora = new Date(); // Obtiene la hora actual del sistema.
                const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes(); // Convierte la hora actual a minutos.
                if (inicio <= minutosAhora) {
                    lanzarMensajeFeedback(bloqueAlertas, "No puedes registrar una clase con una hora que ya pasó hoy.", true);
                    return;
                }
            }

            // VALIDACIÓN: Duración mínima de 45 minutos.
            if (duracion < 45) {
                lanzarMensajeFeedback(bloqueAlertas, "La clase debe durar mínimo 45 minutos.", true);
                return;
            }

            // VALIDACIÓN: Duración máxima de 6 horas (360 minutos).
            if (duracion > 360) {
                lanzarMensajeFeedback(bloqueAlertas, "La clase no puede durar más de 6 horas.", true);
                return;
            }

            // Si está en modo editar, pide confirmación antes de guardar. [REQ. FRONT #24]
            if (modo === "editar") {
                const confirmado = confirm("¿Editar horario?\n\nSe actualizarán los datos del horario seleccionado.");
                if (!confirmado) return; // Si cancela, no hace nada. [REQ. FRONT #25]
            }

            // Intenta guardar o editar enviando los datos al servidor.
            try {
                if (modo === "crear") {
                    await realizarLlamadoAPI("POST", "/api/horarios", payload);
                    lanzarMensajeFeedback(bloqueAlertas, "Registro creado.", false); //[REQ. FRONT #16]
                    btnSubmit.setAttribute("disabled", "true");
                    mostrarToast("El horario fue registrado exitosamente.", "crear");

                } else if (modo === "editar") {
                    await realizarLlamadoAPI("PUT", `/api/horarios/${moduloEstado.idSeleccionado}`, payload);
                    lanzarMensajeFeedback(bloqueAlertas, "Horario editado.", false); //[REQ. FRONT #26]
                    btnSubmit.setAttribute("disabled", "true");
                    mostrarToast("El horario fue editado correctamente.", "editar");
                }

                transicionarModulo("inicio");

            } catch (ex) { //[REQ. FRONT #15]
                const msg = ex.detalles?.errors ? ex.detalles.errors.join(", ") : ex.message;
                lanzarMensajeFeedback(bloqueAlertas, msg, true);
                mostrarToast(msg, "borrar");
            }
        });

        return contenedorForm;
    }

    // Genera el componente de la pantalla que lista los horarios en una tabla.
    function componenteTablaListado() { //[Req. Front #34]
        const moduloListado = crearNodo("div", {});
        moduloListado.appendChild(crearNodo("h3", { class: "ciaf-list-title", text: "Listado de horarios" }));

        // ── Elementos de Filtros y Ordenamiento (Arriba de la tabla) ──
        const filaFiltros = crearNodo("div", { class: "ciaf-filters" });

        // Selector para ordenar los registros por diferentes criterios.
        const selectOrd = crearNodo("select", { class: "ciaf-select" });
        [["idHorario", "Ordenar por ID"], ["docente", "Ordenar por Docente"], ["materia", "Ordenar por Materia"]].forEach(([v, t]) => { //[Req. Front #35]
            selectOrd.appendChild(crearNodo("option", { value: v, text: t }));
        });
        selectOrd.value = moduloEstado.filtrosTable.ordenador;

        // Campo de entrada de texto para buscar registros.
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

        // ── Creación de la Tabla Visual ──
        const divTabla = crearNodo("div", { class: "ciaf-table-wrap" });
        const tablaHTML = crearNodo("table", { class: "ciaf-table" });
        const thead = crearNodo("thead", {});
        const trh = crearNodo("tr");

        // Agrega los encabezados de columna a la tabla. //[Req. Front #38]
        ["ID", "Docente", "Facultad", "Carrera", "Materia", "Fecha", "Inicia", "Termina"].forEach(t => {
            trh.appendChild(crearNodo("th", { text: t }));
        });
        thead.appendChild(trh);
        tablaHTML.appendChild(thead);

        // Cuerpo de la tabla (donde se pintarán los horarios de forma dinámica).
        const tbody = crearNodo("tbody", {});
        tablaHTML.appendChild(tbody);
        divTabla.appendChild(tablaHTML);
        moduloListado.appendChild(divTabla);

        // ── Pie de la tabla (Botón Cerrar y Conteo de Horarios) ──
        const footerListado = crearNodo("div", { class: "ciaf-table-footer" });
        const txtConteo = crearNodo("span", { class: "ciaf-count", id: "lblConteo", text: "Registros: 0" }); //[Req. Front #39]
        const btnCerrar = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost", text: "Cerrar" }); //[Req. Front #40]
        footerListado.appendChild(txtConteo);
        footerListado.appendChild(btnCerrar);
        moduloListado.appendChild(footerListado);

        btnCerrar.addEventListener("click", () => transicionarModulo("inicio")); //[Req. Front #40]

        // Función interna para solicitar los datos al servidor y rellenar las filas de la tabla.
        async function cargarDatos() {
            // Desactiva los controles de búsqueda mientras cargan los datos. //[Req. Front #37]
            [selectOrd, inputBusq, btnFiltrar].forEach(el => el.setAttribute("disabled", "true"));

            try {
                const resList = await realizarLlamadoAPI("GET", "/api/horarios/list");
                limpiarElemento(tbody);

                let arr = Array.isArray(resList?.horarios) ? [...resList.horarios] : [];

                // FILTRO DE BÚSQUEDA: Si el usuario escribió un texto, filtra la lista.
                const terminoBusqueda = moduloEstado.filtrosTable.buscarTermino.trim().toLowerCase();
                if (terminoBusqueda) {
                    arr = arr.filter(item =>
                        Object.values(item).some(valor =>
                            String(valor ?? "").toLowerCase().includes(terminoBusqueda)
                        )
                    );
                }

                // ORDENAMIENTO DE DATOS: Ordena el arreglo según el criterio elegido.
                const campoOrden = moduloEstado.filtrosTable.ordenador;
                arr = arr.sort((a, b) => {
                    if (campoOrden === "idHorario") {
                        return (parseInt(a.idHorario) || 0) - (parseInt(b.idHorario) || 0);
                    }
                    const tA = String(a[campoOrden] || "").trim().toLowerCase();
                    const tB = String(b[campoOrden] || "").trim().toLowerCase();
                    return tA < tB ? -1 : tA > tB ? 1 : 0;
                });

                // Escribe el total de registros encontrados en el contador. //[Req. Front #39]
                txtConteo.textContent = `Registros: ${arr.length}`;

                if (arr.length === 0) {
                    const trV = crearNodo("tr");
                    trV.appendChild(crearNodo("td", { class: "ciaf-empty", text: "No hay registros para mostrar.", colspan: "8" }));
                    tbody.appendChild(trV);
                } else {
                    // Crea una fila en HTML por cada horario.
                    arr.forEach(item => {
                        const tr = crearNodo("tr");
                        tr.appendChild(crearNodo("td", { text: item.idHorario, class: "ciaf-td-id" }));
                        tr.appendChild(crearNodo("td", { text: item.docente }));
                        tr.appendChild(crearNodo("td", { text: item.facultad }));
                        tr.appendChild(crearNodo("td", { text: item.carrera }));
                        tr.appendChild(crearNodo("td", { text: item.materia }));
                        tr.appendChild(crearNodo("td", { text: item.fechaClase }));
                        // Corta las horas a formato básico de 5 caracteres ("HH:MM").
                        tr.appendChild(crearNodo("td", { text: item.horaIniciaClase ? item.horaIniciaClase.substring(0, 5) : "" }));
                        tr.appendChild(crearNodo("td", { text: item.horaTerminaClase ? item.horaTerminaClase.substring(0, 5) : "" }));
                        tbody.appendChild(tr);
                    });
                }

                mostrarToast("Se encontraron " + arr.length + " registro(s).", "listar");

            } catch (err) {
                console.error(err);
                mostrarToast("No se pudo obtener el listado de horarios.", "borrar");
            } finally {
                // Vuelve a encender los botones y selectores al terminar la carga.
                [selectOrd, inputBusq, btnFiltrar].forEach(el => el.removeAttribute("disabled"));
            }
        }

        // CONTROLADORES DE EVENTOS DE FILTROS

        // Al hacer clic en "Buscar": [Req. Front #36]
        btnFiltrar.addEventListener("click", () => {
            moduloEstado.filtrosTable.ordenador = selectOrd.value;
            moduloEstado.filtrosTable.buscarTermino = sanitizarBusqueda(inputBusq.value);
            cargarDatos();
        });

        // Al cambiar la columna de ordenación:
        selectOrd.addEventListener("change", () => {
            moduloEstado.filtrosTable.ordenador = selectOrd.value;
            cargarDatos();
        });

        // Al presionar la tecla Enter dentro de la barra de búsqueda:
        inputBusq.addEventListener("keyup", e => {
            if (e.key === "Enter") {
                moduloEstado.filtrosTable.ordenador = selectOrd.value;
                moduloEstado.filtrosTable.buscarTermino = sanitizarBusqueda(inputBusq.value);
                cargarDatos();
            }
        });

        cargarDatos();
        return moduloListado;
    }

    // Genera la vista visual de la sesión de salida finalizada.
    function componenteVistaSalida() {
        const divExit = crearNodo("div", { class: "ciaf-exit" });
        divExit.appendChild(crearNodo("div", { class: "ciaf-exit-icon", text: "⊗" }));
        divExit.appendChild(crearNodo("h4", { class: "ciaf-exit-title", text: "Sesión Finalizada" }));
        divExit.appendChild(crearNodo("p", { class: "ciaf-exit-subtitle", text: "Puede cerrar esta pestaña/ventana del navegador para finalizar." })); //[Req. Front #41]

        const btnRegresar = crearNodo("button", { type: "button", class: "ciaf-btn ciaf-btn-ghost", text: "Volver al menú" }); //[Req. Front #42]
        btnRegresar.addEventListener("click", () => transicionarModulo("inicio"));
        divExit.appendChild(btnRegresar);
        return divExit;
    }

    // =========================================================================
    // ── 10. ORQUESTADOR DE PÁGINA ÚNICA (SPA Central Architecture) ── (REQ. FRONT #1)
    // =========================================================================
    function renderizarEstructuraBase() {
        limpiarElemento(mainContainer);

        // ── Creación del Header (Barra Superior) ──
        const header = crearNodo("header", { class: "ciaf-header" });

        const brand = crearNodo("div", { class: "ciaf-brand" });
        brand.appendChild(crearNodo("div", { class: "ciaf-brand-icon", text: "H" }));
        brand.appendChild(crearNodo("span", { text: "Administración de Horarios" }));
        header.appendChild(brand);

        const userArea = crearNodo("div", { class: "ciaf-user-area" });
        userArea.appendChild(crearNodo("span", { html: "Bienvenido, Docente" }));

        // Botón de salir colocado arriba a la derecha.
        const btnNavSalir = crearNodo("button", { class: "ciaf-btn-exit" });
        btnNavSalir.appendChild(crearNodo("span", { text: "⟶" }));
        btnNavSalir.appendChild(crearNodo("span", { text: " Salir" }));
        btnNavSalir.addEventListener("click", () => transicionarModulo("salir"));
        userArea.appendChild(btnNavSalir);

        header.appendChild(userArea);
        mainContainer.appendChild(header);

        // ── Creación del Layout (Contenedor de dos columnas) ──
        const layout = crearNodo("div", { class: "ciaf-layout" });

        // ── Columna 1: Menú Lateral (Sidebar) ──
        const sidebar = crearNodo("div", { class: "ciaf-sidebar" });
        sidebar.appendChild(crearNodo("h6", { class: "ciaf-sidebar-title", text: "Menú Principal" }));

        const nav = crearNodo("div", { class: "ciaf-nav" });
        const rutasMenu = [ // [REQ. FRONT #4]
            { clave: "crear", etiqueta: "Crear horario", iconChar: "+" },
            { clave: "editar", etiqueta: "Editar horario", iconChar: "✏" },
            { clave: "borrar", etiqueta: "Borrar horario", iconChar: "✕" },
            { clave: "listar", etiqueta: "Listado de horarios", iconChar: "≡" }
        ];

        // Crea cada botón del menú lateral.
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
        sidebarFooter.appendChild(document.createTextNode(" Selecciona una opción del menú.")); //[REQ. FRONT #5]
        sidebar.appendChild(sidebarFooter);

        layout.appendChild(sidebar);

        // ── Columna 2: Panel de Módulos (Central) ──
        const panel = crearNodo("div", { class: "ciaf-panel" });

        const vistas = {
            inicio: vistaBienvenida,
            crear: () => componenteFormulario("crear"),
            editar: () => componenteFormulario("editar"),
            borrar: () => componenteFormulario("borrar"),
            listar: componenteTablaListado,
            salir: componenteVistaSalida
        };

        panel.appendChild((vistas[moduloEstado.vistaActiva] ?? vistaBienvenida)());

        layout.appendChild(panel);
        mainContainer.appendChild(layout);
    }

    // Inicia el dibujo de la interfaz en la carga de la página por primera vez.
    renderizarEstructuraBase();
})();
