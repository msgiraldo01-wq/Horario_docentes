/**
 * Frontend - Sistema de Gestión de Horarios CIAF
 * Arquitectura SPA con Distribución Dashboard (Sidebar Lateral + Contenedor Dinámico)
 * v3 — Custom Selects animados + SweetAlerts pro acordes al diseño institucional
 */

(function () {
  const appContainer = document.getElementById("app");

  // ─────────────────────────────────────────
  // ESTILOS EXTRA: custom selects + sweet overrides
  // ─────────────────────────────────────────
  (function inyectarEstilos() {
    const s = document.createElement("style");
    s.textContent = `
      /* ── Custom Select ── */
      .cs-wrapper {
        position: relative;
        user-select: none;
      }
      .cs-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        font-size: 0.88rem;
        color: #2d3748;
        transition: border-color .2s, box-shadow .2s;
        min-height: 38px;
      }
      .cs-display:hover {
        border-color: #00c2cb;
      }
      .cs-display.cs-open {
        border-color: #00c2cb;
        box-shadow: 0 0 0 0.2rem rgba(0,194,203,0.18);
      }
      .cs-display.cs-disabled {
        background: #f8f9fa;
        color: #adb5bd;
        cursor: not-allowed;
        pointer-events: none;
      }
      .cs-placeholder { color: #adb5bd; }
      .cs-chevron {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 4px;
        background: #f0f4f8;
        color: #1a3a5a;
        transition: transform .25s, background .2s;
        flex-shrink: 0;
        margin-left: 8px;
      }
      .cs-display.cs-open .cs-chevron {
        transform: rotate(180deg);
        background: #00c2cb;
        color: #fff;
      }
      .cs-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0; right: 0;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(26,58,90,0.13);
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
      .cs-dropdown::-webkit-scrollbar-thumb { background: #00c2cb; border-radius: 4px; }
      .cs-option {
        padding: 9px 14px;
        font-size: 0.85rem;
        color: #2d3748;
        cursor: pointer;
        transition: background .15s, color .15s, padding-left .15s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cs-option:hover {
        background: #e8fafa;
        color: #00c2cb;
        padding-left: 20px;
      }
      .cs-option.cs-selected {
        background: #1a3a5a;
        color: #fff;
        font-weight: 600;
      }
      .cs-option.cs-selected:hover {
        background: #2c5282;
        color: #fff;
        padding-left: 14px;
      }
      .cs-option-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
        opacity: .5;
      }
      .cs-empty {
        padding: 12px 14px;
        font-size: 0.82rem;
        color: #a0aec0;
        font-style: italic;
        text-align: center;
      }

      /* ── SweetAlert2 overrides acordes al diseño CIAF ── */
      .swal2-popup.ciaf-swal {
        border-radius: 14px !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        padding: 2rem 2rem 1.8rem !important;
        box-shadow: 0 20px 60px rgba(26,58,90,0.18) !important;
      }
      .swal2-popup.ciaf-swal .swal2-title {
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        color: #1a3a5a !important;
        margin-bottom: .4rem !important;
      }
      .swal2-popup.ciaf-swal .swal2-html-container {
        font-size: 0.88rem !important;
        color: #4a5568 !important;
        margin: .3rem 0 0 !important;
      }
      /* Ícono circular con gradiente teal */
      .swal2-popup.ciaf-swal .swal2-icon.swal2-success {
        border-color: #00c2cb !important;
        color: #00c2cb !important;
      }
      .swal2-popup.ciaf-swal .swal2-icon.swal2-success [class^=swal2-success-line] {
        background-color: #00c2cb !important;
      }
      .swal2-popup.ciaf-swal .swal2-icon.swal2-success .swal2-success-ring {
        border-color: rgba(0,194,203,.25) !important;
      }
      .swal2-popup.ciaf-swal .swal2-icon.swal2-error {
        border-color: #e53e3e !important;
        color: #e53e3e !important;
      }
      .swal2-popup.ciaf-swal .swal2-icon.swal2-warning {
        border-color: #d69e2e !important;
        color: #d69e2e !important;
      }
      .swal2-popup.ciaf-swal .swal2-icon.swal2-question {
        border-color: #1a3a5a !important;
        color: #1a3a5a !important;
      }
      /* Botones */
      .swal2-popup.ciaf-swal .swal2-confirm {
        background: linear-gradient(135deg, #1a3a5a 0%, #2c5282 100%) !important;
        border: none !important;
        border-radius: 7px !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        padding: 8px 22px !important;
        letter-spacing: .3px !important;
        box-shadow: 0 3px 10px rgba(26,58,90,0.25) !important;
        transition: opacity .2s !important;
      }
      .swal2-popup.ciaf-swal .swal2-confirm:hover { opacity: .88 !important; }
      .swal2-popup.ciaf-swal .swal2-cancel {
        background: #edf2f7 !important;
        color: #4a5568 !important;
        border: none !important;
        border-radius: 7px !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        padding: 8px 22px !important;
      }
      .swal2-popup.ciaf-swal .swal2-cancel:hover { background: #e2e8f0 !important; }
      /* Barra de progreso teal */
      .swal2-popup.ciaf-swal .swal2-timer-progress-bar { background: #00c2cb !important; }
      /* Alerta inline dentro del formulario */
      .ciaf-inline-alert {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 0.84rem;
        font-weight: 500;
        animation: ciafSlideIn .22s ease;
        margin-top: 12px;
      }
      @keyframes ciafSlideIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ciaf-inline-alert.success {
        background: #e6fafa;
        border-left: 3px solid #00c2cb;
        color: #0d6e6e;
      }
      .ciaf-inline-alert.error {
        background: #fff5f5;
        border-left: 3px solid #e53e3e;
        color: #c53030;
      }
      .ciaf-inline-alert .ciaf-alert-icon {
        font-size: 1rem;
        flex-shrink: 0;
        margin-top: 1px;
      }
    `;
    document.head.appendChild(s);
  })();

  // ─────────────────────────────────────────
  // ESTADO GLOBAL
  // ─────────────────────────────────────────
  const moduloEstado = {
    vistaActiva: "inicio",
    idSeleccionado: null,
    filtrosTable: { ordenador: "idHorario", buscarTermino: "" }
  };

  // ─────────────────────────────────────────
  // DATOS INSTITUCIONALES CIAF
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // CUSTOM SELECT — constructor
  // ─────────────────────────────────────────
  function crearCustomSelect({ id, placeholder, opciones, deshabilitado, onChange }) {
    let valorActual = "";
    let abierto = false;

    const wrapper = document.createElement("div");
    wrapper.className = "cs-wrapper";

    // Display visible
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
    chevron.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    display.appendChild(txtSpan);
    display.appendChild(chevron);

    // Dropdown lista
    const dropdown = document.createElement("div");
    dropdown.className = "cs-dropdown";
    dropdown.setAttribute("role", "listbox");

    // Input oculto para leer el valor con .value
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.id = id;
    hiddenInput.value = "";

    wrapper.appendChild(display);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(hiddenInput);

    // Construir opciones en el dropdown
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
      // Marcar opción activa
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

    function toggleAbrir() {
      abierto ? cerrar() : abrir();
    }

    display.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleAbrir();
    });

    display.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAbrir(); }
      if (e.key === "Escape") cerrar();
    });

    // Cerrar al hacer click fuera
    document.addEventListener("click", function () { cerrar(); });

    // Poblar inicial
    poblarOpciones(opciones || []);

    // API pública
    wrapper._setPoblacion = function (lista, nuevoPlaceholder) {
      poblarOpciones(lista);
      if (nuevoPlaceholder) {
        placeholder = nuevoPlaceholder;
        resetValor(nuevoPlaceholder);
      }
    };
    wrapper._setValor = function (val) {
      seleccionarValor(val);
    };
    wrapper._reset = function (nuevoPlaceholder) {
      resetValor(nuevoPlaceholder);
    };
    wrapper._getValue = function () { return valorActual; };

    return wrapper;
  }

  // ─────────────────────────────────────────
  // SWEETALERT2 — helpers pro con diseño CIAF
  // ─────────────────────────────────────────
  const Swal2 = window.Swal || window.Sweetalert2;

  function ciafAlert({ tipo, titulo, mensaje, timer }) {
    if (!Swal2) return;
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

  function ciafConfirm({ titulo, mensaje, textoConfirm, textoCancel, colorConfirm }) {
    if (!Swal2) return Promise.resolve({ isConfirmed: window.confirm(mensaje || titulo) });
    return Swal2.fire({
      customClass: { popup: "ciaf-swal" },
      icon: "question",
      title: titulo,
      html: mensaje || "",
      showCancelButton: true,
      confirmButtonText: textoConfirm || "Sí, continuar",
      cancelButtonText: textoCancel || "Cancelar",
      reverseButtons: true
    });
  }

  // Alerta inline dentro del formulario (debajo del form, no modal)
  function lanzarMensajeFeedback(zona, texto, esError = false) {
    while (zona.firstChild) zona.removeChild(zona.firstChild);
    if (!texto) return;

    const div = document.createElement("div");
    div.className = "ciaf-inline-alert " + (esError ? "error" : "success");

    const ico = document.createElement("span");
    ico.className = "ciaf-alert-icon";
    ico.innerHTML = esError
      ? `<i class="bi bi-exclamation-circle-fill"></i>`
      : `<i class="bi bi-check-circle-fill"></i>`;

    const msg = document.createElement("span");
    msg.textContent = texto;

    div.appendChild(ico);
    div.appendChild(msg);
    zona.appendChild(div);
  }

  // ─────────────────────────────────────────
  // UTILIDADES DOM
  // ─────────────────────────────────────────
  function crearNodo(tag, atributos = {}) {
    const elemento = document.createElement(tag);
    for (const [prop, valor] of Object.entries(atributos)) {
      if (prop === "text") elemento.textContent = String(valor);
      else if (prop === "html") elemento.innerHTML = String(valor);
      else if (prop === "value") elemento.value = String(valor);
      else if (prop === "disabled" && valor) elemento.setAttribute("disabled", "true");
      else elemento.setAttribute(prop, String(valor));
    }
    return elemento;
  }

  function limpiarElemento(nodo) {
    while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
  }

  function transicionarModulo(nombreVista) {
    moduloEstado.vistaActiva = nombreVista;
    moduloEstado.idSeleccionado = null;
    renderizarEstructuraBase();
  }

  // ─────────────────────────────────────────
  // API FETCH
  // ─────────────────────────────────────────
  async function realizarLlamadoAPI(metodo, endpoint, cuerpo) {
    const configuracion = {
      method: metodo,
      headers: { "Content-Type": "application/json" }
    };
    if (cuerpo !== undefined) configuracion.body = JSON.stringify(cuerpo);
    const respuesta = await fetch(endpoint, configuracion);
    const json = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      const err = new Error(json && json.message ? json.message : "Error en comunicación con el servidor");
      err.detalles = json;
      throw err;
    }
    return json;
  }

  // ─────────────────────────────────────────
  // COMPONENTES DINÁMICOS
  // ─────────────────────────────────────────

  function vistaBienvenida() {
    const caja = crearNodo("div", { class: "text-center py-5" });
    caja.appendChild(crearNodo("h1", { class: "welcome-title", text: "Bienvenido al Sistema de Horarios CIAF" }));
    caja.appendChild(crearNodo("p", { class: "welcome-subtitle", text: "Seleccione una opción a la izquierda para comenzar." }));
    return caja;
  }

  function componenteFormulario(modo) {
    const contenedorForm = crearNodo("div", { class: "p-2" });
    const tituloForm = modo === "crear" ? "Crear horario" : modo === "editar" ? "Editar horario" : "Borrar horario";
    contenedorForm.appendChild(crearNodo("h3", { class: "fw-bold text-dark mb-4", text: tituloForm }));

    const bloqueAlertas = crearNodo("div", { class: "mb-3" });
    contenedorForm.appendChild(bloqueAlertas);

    // Referencias a custom selects (se asignan abajo)
    let csF, csC, csM;

    // ── Barra búsqueda (editar / borrar) ──
    if (modo === "editar" || modo === "borrar") {
      const controlBusqueda = crearNodo("div", { class: "input-group mb-4" });
      const inputId = crearNodo("input", { type: "number", class: "form-control", id: "buscarIdHorario", placeholder: "Escriba el idHorario..." });
      const btnBuscar = crearNodo("button", { type: "button", class: "btn btn-outline-secondary px-4", text: "Buscar" });
      controlBusqueda.appendChild(inputId);
      controlBusqueda.appendChild(btnBuscar);
      contenedorForm.appendChild(controlBusqueda);

      btnBuscar.addEventListener("click", async () => {
        const idValue = inputId.value.trim();
        if (!idValue) {
          lanzarMensajeFeedback(bloqueAlertas, "Debe digitar el ID a buscar.", true);
          return;
        }
        try {
          const registro = await realizarLlamadoAPI("GET", `/api/horarios/byidHorario?idHorario=${idValue}`);
          if (!registro) {
            lanzarMensajeFeedback(bloqueAlertas, "El horario no existe.", true);
            return;
          }
          moduloEstado.idSeleccionado = idValue;
          document.getElementById("formDocente").value = registro.docente || "";
          document.getElementById("formFecha").value = registro.fechaClase ? registro.fechaClase.split("T")[0] : "";
          document.getElementById("formHoraInicia").value = registro.horaIniciaClase || "";
          document.getElementById("formHoraTermina").value = registro.horaTerminaClase || "";

          // Cargar custom selects encadenados
          if (csF && csC && csM) {
            const fac = registro.facultad || "";
            const car = registro.carrera || "";
            const mat = registro.materia || "";

            const carrerasDisp = fac && DATOS_CIAF[fac] ? Object.keys(DATOS_CIAF[fac]) : [];
            const materiasDisp = fac && car && DATOS_CIAF[fac] && DATOS_CIAF[fac][car] ? DATOS_CIAF[fac][car] : [];

            csF._setValor(fac);
            csC._setPoblacion(carrerasDisp, "-- Seleccione carrera --");
            if (car) csC._setValor(car);
            csM._setPoblacion(materiasDisp, "-- Seleccione materia --");
            if (mat) csM._setValor(mat);
          }

          lanzarMensajeFeedback(bloqueAlertas, "Horario cargado.", false);
        } catch (e) {
          lanzarMensajeFeedback(bloqueAlertas, e.message, true);
        }
      });
    }

    // ── Formulario ──
    const formTag = crearNodo("form", { class: "row g-3" });

    // Docente
    const divDocente = crearNodo("div", { class: "col-md-6" });
    divDocente.appendChild(crearNodo("label", { class: "form-label fw-semibold small text-secondary", text: "Docente", for: "formDocente" }));
    const inputDocente = crearNodo("input", { type: "text", class: "form-control", id: "formDocente", maxlength: "150" });
    if (modo === "borrar") inputDocente.setAttribute("disabled", "true");
    divDocente.appendChild(inputDocente);
    formTag.appendChild(divDocente);

    // Facultad — Custom Select
    const divFacultad = crearNodo("div", { class: "col-md-6" });
    divFacultad.appendChild(crearNodo("label", { class: "form-label fw-semibold small text-secondary", text: "Facultad" }));
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

    // Carrera — Custom Select
    const divCarrera = crearNodo("div", { class: "col-md-6" });
    divCarrera.appendChild(crearNodo("label", { class: "form-label fw-semibold small text-secondary", text: "Carrera" }));
    csC = crearCustomSelect({
      id: "formCarrera",
      placeholder: "-- Seleccione carrera --",
      opciones: [],
      deshabilitado: modo === "borrar",
      onChange: function (val) {
        const fac = csF._getValue();
        const materias = fac && val && DATOS_CIAF[fac] && DATOS_CIAF[fac][val] ? DATOS_CIAF[fac][val] : [];
        csM._setPoblacion(materias, "-- Seleccione materia --");
      }
    });
    divCarrera.appendChild(csC);
    formTag.appendChild(divCarrera);

    // Materia — Custom Select
    const divMateria = crearNodo("div", { class: "col-md-6" });
    divMateria.appendChild(crearNodo("label", { class: "form-label fw-semibold small text-secondary", text: "Materia" }));
    csM = crearCustomSelect({
      id: "formMateria",
      placeholder: "-- Seleccione materia --",
      opciones: [],
      deshabilitado: modo === "borrar"
    });
    divMateria.appendChild(csM);
    formTag.appendChild(divMateria);

    // Fecha y horas
    [
      { id: "formFecha",      label: "Fecha Clase",       type: "date" },
      { id: "formHoraInicia", label: "Hora Inicia Clase", type: "time" },
      { id: "formHoraTermina",label: "Hora Termina Clase",type: "time" }
    ].forEach(c => {
      const divCol = crearNodo("div", { class: "col-md-6" });
      divCol.appendChild(crearNodo("label", { class: "form-label fw-semibold small text-secondary", text: c.label, for: c.id }));
      const inp = crearNodo("input", { type: c.type, class: "form-control", id: c.id });
      if (modo === "borrar") inp.setAttribute("disabled", "true");
      divCol.appendChild(inp);
      formTag.appendChild(divCol);
    });

    // Botones
    const divBotones = crearNodo("div", { class: "col-12 d-flex gap-2 mt-4" });
    const textoPrincipal = modo === "crear" ? "Guardar" : modo === "editar" ? "Editar" : "Eliminar";
    const colorBtn = modo === "crear" ? "btn-success" : modo === "editar" ? "btn-warning text-white" : "btn-danger";
    const btnSubmit = crearNodo("button", { type: "button", class: `btn ${colorBtn} px-4 fw-bold`, text: textoPrincipal });
    const btnCancel = crearNodo("button", { type: "button", class: "btn btn-light px-4 border", text: "Cancelar" });
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
        docente: document.getElementById("formDocente").value.trim(),
        facultad: document.getElementById("formFacultad").value,
        carrera: document.getElementById("formCarrera").value,
        materia: document.getElementById("formMateria").value,
        fechaClase: document.getElementById("formFecha").value.trim(),
        horaIniciaClase: document.getElementById("formHoraInicia").value.trim(),
        horaTerminaClase: document.getElementById("formHoraTermina").value.trim()
      };

      if (Object.values(payload).some(v => !v)) {
        lanzarMensajeFeedback(bloqueAlertas, "Debes completar los datos del formulario", true);
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
        const msg = ex.detalles && Array.isArray(ex.detalles.errors)
          ? ex.detalles.errors.join(", ")
          : ex.message;
        lanzarMensajeFeedback(bloqueAlertas, msg, true);
        ciafAlert({ tipo: "error", titulo: "Error al guardar", mensaje: msg });
      }
    });

    return contenedorForm;
  }

  // ─────────────────────────────────────────
  // TABLA LISTADO
  // ─────────────────────────────────────────
  function componenteTablaListado() {
    const moduloListado = crearNodo("div", { class: "p-2" });
    moduloListado.appendChild(crearNodo("h3", { class: "fw-bold text-dark mb-4", text: "Listado de horarios" }));

    const filaFiltros = crearNodo("div", { class: "row g-2 mb-3" });
    const colSel = crearNodo("div", { class: "col-sm-4" });
    const selectOrd = crearNodo("select", { class: "form-select form-select-sm" });
    [["idHorario","Ordenar por ID"],["docente","Ordenar por Docente"],["materia","Ordenar por Materia"]].forEach(i => {
      selectOrd.appendChild(crearNodo("option", { value: i[0], text: i[1] }));
    });
    selectOrd.value = moduloEstado.filtrosTable.ordenador;
    colSel.appendChild(selectOrd);

    const colInp = crearNodo("div", { class: "col-sm-6" });
    const inputBusq = crearNodo("input", { type: "text", class: "form-control form-control-sm", placeholder: "Escribe término de búsqueda...", value: moduloEstado.filtrosTable.buscarTermino });
    colInp.appendChild(inputBusq);

    const colBtn = crearNodo("div", { class: "col-sm-2" });
    const btnFiltrar = crearNodo("button", { type: "button", class: "btn btn-sm btn-primary w-100 fw-bold", text: "Buscar" });
    colBtn.appendChild(btnFiltrar);

    filaFiltros.appendChild(colSel);
    filaFiltros.appendChild(colInp);
    filaFiltros.appendChild(colBtn);
    moduloListado.appendChild(filaFiltros);

    const divTabla = crearNodo("div", { class: "table-responsive border rounded bg-white" });
    const tablaHTML = crearNodo("table", { class: "table table-hover table-striped mb-0 align-middle small" });
    const thead = crearNodo("thead", { class: "table-light" });
    const trh = crearNodo("tr");
    ["ID","Docente","Facultad","Carrera","Materia","Fecha","Inicia","Termina"].forEach(t => {
      trh.appendChild(crearNodo("th", { text: t, class: "p-3" }));
    });
    thead.appendChild(trh);
    tablaHTML.appendChild(thead);
    const tbody = crearNodo("tbody");
    tablaHTML.appendChild(tbody);
    divTabla.appendChild(tablaHTML);
    moduloListado.appendChild(divTabla);

    const footerListado = crearNodo("div", { class: "d-flex justify-content-between align-items-center mt-3" });
    const txtConteo = crearNodo("span", { class: "text-muted small fw-bold", id: "lblConteo", text: "Registros: 0" });
    const btnCerrarListado = crearNodo("button", { type: "button", class: "btn btn-sm btn-secondary px-3", text: "Cerrar" });
    footerListado.appendChild(txtConteo);
    footerListado.appendChild(btnCerrarListado);
    moduloListado.appendChild(footerListado);
    btnCerrarListado.addEventListener("click", () => transicionarModulo("inicio"));

    async function cargarDatosEfectivos() {
      selectOrd.setAttribute("disabled","true");
      inputBusq.setAttribute("disabled","true");
      btnFiltrar.setAttribute("disabled","true");
      try {
        const query = `orderBy=${moduloEstado.filtrosTable.ordenador}&q=${encodeURIComponent(moduloEstado.filtrosTable.buscarTermino)}`;
        const resList = await realizarLlamadoAPI("GET", `/api/horarios/list?${query}`);
        limpiarElemento(tbody);
        const arr = resList && Array.isArray(resList.horarios) ? resList.horarios : [];
        txtConteo.textContent = `Registros: ${arr.length}`;
        if (arr.length === 0) {
          const trV = crearNodo("tr");
          trV.appendChild(crearNodo("td", { colspan:"8", class:"text-center text-muted py-4", text:"No hay registros para mostrar." }));
          tbody.appendChild(trV);
        } else {
          arr.forEach(item => {
            const tr = crearNodo("tr");
            tr.appendChild(crearNodo("td", { text: item.idHorario, class:"p-3 fw-bold text-primary" }));
            tr.appendChild(crearNodo("td", { text: item.docente }));
            tr.appendChild(crearNodo("td", { text: item.facultad }));
            tr.appendChild(crearNodo("td", { text: item.carrera }));
            tr.appendChild(crearNodo("td", { text: item.materia }));
            tr.appendChild(crearNodo("td", { text: item.fechaClase }));
            tr.appendChild(crearNodo("td", { text: item.horaIniciaClase ? item.horaIniciaClase.substring(0,5) : "" }));
            tr.appendChild(crearNodo("td", { text: item.horaTerminaClase ? item.horaTerminaClase.substring(0,5) : "" }));
            tbody.appendChild(tr);
          });
        }
      } catch (err) {
        console.error(err);
        ciafAlert({ tipo: "error", titulo: "Error al cargar", mensaje: "No se pudo obtener el listado de horarios." });
      } finally {
        selectOrd.removeAttribute("disabled");
        inputBusq.removeAttribute("disabled");
        btnFiltrar.removeAttribute("disabled");
      }
    }

    btnFiltrar.addEventListener("click", () => {
      moduloEstado.filtrosTable.ordenador = selectOrd.value;
      moduloEstado.filtrosTable.buscarTermino = inputBusq.value.trim();
      cargarDatosEfectivos();
    });
    inputBusq.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        moduloEstado.filtrosTable.ordenador = selectOrd.value;
        moduloEstado.filtrosTable.buscarTermino = inputBusq.value.trim();
        cargarDatosEfectivos();
      }
    });
    cargarDatosEfectivos();
    return moduloListado;
  }

  // ─────────────────────────────────────────
  // VISTA SALIDA
  // ─────────────────────────────────────────
  function componenteVistaSalida() {
    const divExit = crearNodo("div", { class: "text-center py-5" });
    divExit.appendChild(crearNodo("h4", { class: "text-danger fw-bold mb-3", text: "Sesión Finalizada" }));
    divExit.appendChild(crearNodo("p", { class: "text-muted mb-4", text: "Puede cerrar esta pestaña/ventana del navegador para finalizar." }));
    const btnRegresar = crearNodo("button", { type: "button", class: "btn btn-sm btn-outline-primary px-4", text: "Volver al menú" });
    btnRegresar.addEventListener("click", () => transicionarModulo("inicio"));
    divExit.appendChild(btnRegresar);
    return divExit;
  }

  // ─────────────────────────────────────────
  // ORQUESTADOR SPA
  // ─────────────────────────────────────────
  function renderizarEstructuraBase() {
    limpiarElemento(appContainer);

    // Navbar
    const headerNav = crearNodo("header", { class: "navbar-custom d-flex justify-content-between align-items-center" });
    const marcaInstitucional = crearNodo("div", { class: "brand-text" });
    marcaInstitucional.appendChild(crearNodo("i", { class: "bi bi-journal-bookmark-fill" }));
    marcaInstitucional.appendChild(crearNodo("span", { text: "Administración de Horarios" }));
    headerNav.appendChild(marcaInstitucional);
    const bloqueUsuario = crearNodo("div", { class: "user-area" });
    bloqueUsuario.appendChild(crearNodo("span", { html: "Bienvenido, <span class='fw-bold'>Docente</span>" }));
    const btnNavSalir = crearNodo("button", { class: "btn-salir" });
    btnNavSalir.appendChild(crearNodo("i", { class: "bi bi-box-arrow-right" }));
    btnNavSalir.appendChild(crearNodo("span", { text: "Salir" }));
    btnNavSalir.addEventListener("click", () => transicionarModulo("salir"));
    bloqueUsuario.appendChild(btnNavSalir);
    headerNav.appendChild(bloqueUsuario);
    appContainer.appendChild(headerNav);

    // Layout
    const rowLayout = crearNodo("div", { class: "container-fluid mt-4" });
    const gridLayout = crearNodo("div", { class: "row g-4" });

    // Sidebar
    const colIzquierda = crearNodo("div", { class: "col-lg-3 col-md-4" });
    const cardSidebar = crearNodo("div", { class: "sidebar-card" });
    cardSidebar.appendChild(crearNodo("h6", { class: "menu-title", text: "Menú Principal" }));
    const listaGrupo = crearNodo("div", { class: "list-group list-group-flush" });
    const rutasMenu = [
      { clave: "crear",  etiqueta: "Crear horario",     icono: "bi-plus-circle", iconClass: "icon-crear"  },
      { clave: "editar", etiqueta: "Editar horario",    icono: "bi-pencil",      iconClass: "icon-editar" },
      { clave: "borrar", etiqueta: "Borrar horario",    icono: "bi-trash",       iconClass: "icon-borrar" },
      { clave: "listar", etiqueta: "Listado de horarios",icono: "bi-table",      iconClass: "icon-listar" }
    ];
    rutasMenu.forEach(item => {
      const esActivo = moduloEstado.vistaActiva === item.clave;
      const linkMenu = crearNodo("button", { type: "button", class: `list-group-item ${esActivo ? "active" : ""}` });
      linkMenu.appendChild(crearNodo("i", { class: `bi ${item.icono} ${esActivo ? "" : item.iconClass}` }));
      linkMenu.appendChild(crearNodo("span", { text: item.etiqueta }));
      linkMenu.addEventListener("click", () => transicionarModulo(item.clave));
      listaGrupo.appendChild(linkMenu);
    });
    cardSidebar.appendChild(listaGrupo);
    const footerSidebar = crearNodo("p", { class: "sidebar-footer" });
    footerSidebar.appendChild(crearNodo("i", { class: "bi bi-info-circle" }));
    footerSidebar.appendChild(document.createTextNode(" Selecciona una opción del menú."));
    cardSidebar.appendChild(footerSidebar);
    colIzquierda.appendChild(cardSidebar);
    gridLayout.appendChild(colIzquierda);

    // Panel central
    const colDerecha = crearNodo("div", { class: "col-lg-9 col-md-8" });
    const panelContenedorCentral = crearNodo("div", { class: "main-panel" });
    switch (moduloEstado.vistaActiva) {
      case "inicio":  panelContenedorCentral.appendChild(vistaBienvenida()); break;
      case "crear":   panelContenedorCentral.appendChild(componenteFormulario("crear")); break;
      case "editar":  panelContenedorCentral.appendChild(componenteFormulario("editar")); break;
      case "borrar":  panelContenedorCentral.appendChild(componenteFormulario("borrar")); break;
      case "listar":  panelContenedorCentral.appendChild(componenteTablaListado()); break;
      case "salir":   panelContenedorCentral.appendChild(componenteVistaSalida()); break;
      default:        panelContenedorCentral.appendChild(vistaBienvenida());
    }
    colDerecha.appendChild(panelContenedorCentral);
    gridLayout.appendChild(colDerecha);
    rowLayout.appendChild(gridLayout);
    appContainer.appendChild(rowLayout);
  }

  // Iniciar
  renderizarEstructuraBase();
})();