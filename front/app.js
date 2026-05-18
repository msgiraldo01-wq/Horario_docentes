/**
 * Frontend - Sistema de Gestión de Horarios CIAF
 * Arquitectura SPA con Distribución Dashboard (Sidebar Lateral + Contenedor Dinámico)
 */

(function () {
  const appContainer = document.getElementById("app");

  // Estado global de la aplicación
  const moduloEstado = {
      vistaActiva: "inicio",
      idSeleccionado: null,
      filtrosTable: {
          ordenador: "idHorario",
          buscarTermino: ""
      }
  };

  // Funciones utilitarias para la manipulación limpia del DOM
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

  // Cliente API Fetch
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

  // Alertas de feedback integradas
  function lanzarMensajeFeedback(zona, texto, esError = false) {
      limpiarElemento(zona);
      if (!texto) return;
      const alerta = crearNodo("div", {
          class: `alert ${esError ? 'alert-danger' : 'alert-success'} alert-dismissible fade show mt-3`,
          role: "alert",
          text: texto
      });
      zona.appendChild(alerta);
  }

  // ==========================================
  // COMPONENTES DINÁMICOS (ZONA DERECHA)
  // ==========================================

  function vistaBienvenida() {
      const caja = crearNodo("div", { class: "text-center py-5" });
      caja.appendChild(crearNodo("h1", { class: "welcome-title", text: "Bienvenido al Sistema de Horarios CIAF" }));
      caja.appendChild(crearNodo("p", { class: "welcome-subtitle", text: "Seleccione una opción a la izquierda para comenzar." }));
      return caja;
  }

  function componenteFormulario(modo) {
      const contenedorForm = crearNodo("div", { class: "p-2" });

      let tituloForm = modo === "crear" ? "Crear horario" : modo === "editar" ? "Editar horario" : "Borrar horario";
      contenedorForm.appendChild(crearNodo("h3", { class: "fw-bold text-dark mb-4", text: tituloForm }));

      const bloqueAlertas = crearNodo("div", { class: "mb-3" });
      contenedorForm.appendChild(bloqueAlertas);

      // Barra de búsqueda para los modos Editar y Eliminar
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
                  document.getElementById("formFacultad").value = registro.facultad || "";
                  document.getElementById("formCarrera").value = registro.carrera || "";
                  document.getElementById("formMateria").value = registro.materia || "";
                  document.getElementById("formFecha").value =
                    registro.fechaClase
                        ? registro.fechaClase.split("T")[0]
                        : "";

                  document.getElementById("formHoraInicia").value = registro.horaIniciaClase || "";
                  document.getElementById("formHoraTermina").value = registro.horaTerminaClase || "";

                  lanzarMensajeFeedback(bloqueAlertas, "Horario cargado.", false);
              } catch (e) {
                  lanzarMensajeFeedback(bloqueAlertas, e.message, true);
              }
          });
      }

      // Estructura del Formulario
      const formTag = crearNodo("form", { class: "row g-3" });

      const campos = [
          { id: "formDocente", label: "Docente", type: "text", disabled: (modo === "borrar") },
          { id: "formFacultad", label: "Facultad", type: "text", disabled: (modo === "borrar") },
          { id: "formCarrera", label: "Carrera", type: "text", disabled: (modo === "borrar") },
          { id: "formMateria", label: "Materia", type: "text", disabled: (modo === "borrar") },
          { id: "formFecha", label: "Fecha Clase", type: "date", disabled: (modo === "borrar") },
          { id: "formHoraInicia", label: "Hora Inicia Clase", type: "time", disabled: (modo === "borrar") },
          { id: "formHoraTermina", label: "Hora Termina Clase", type: "time", disabled: (modo === "borrar") }
      ];

      campos.forEach(c => {
          const divCol = crearNodo("div", { class: "col-md-6" });
          divCol.appendChild(crearNodo("label", { class: "form-label fw-semibold small text-secondary", text: c.label, for: c.id }));

          const paramsInput = { type: c.type, class: "form-control", id: c.id };
          if (c.disabled) paramsInput.disabled = "true";

          divCol.appendChild(crearNodo("input", paramsInput));
          formTag.appendChild(divCol);
      });

      // Botones de acción inferior
      const divBotones = crearNodo("div", { class: "col-12 d-flex gap-2 mt-4" });
      let textoPrincipal = modo === "crear" ? "Guardar" : modo === "editar" ? "Editar" : "Eliminar";
      let colorBtn = modo === "crear" ? "btn-success" : modo === "editar" ? "btn-warning text-white" : "btn-danger";

      const btnSubmit = crearNodo("button", { type: "button", class: `btn ${colorBtn} px-4 fw-bold`, text: textoPrincipal });
      const btnCancel = crearNodo("button", { type: "button", class: "btn btn-light px-4 border", text: "Cancelar" });

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
                      setTimeout(() => { transicionarModulo("inicio"); }, 1500);
                  } catch (err) { lanzarMensajeFeedback(bloqueAlertas, err.message, true); }
              }
              return;
          }

          if (modo === "editar" && !moduloEstado.idSeleccionado) {
              lanzarMensajeFeedback(bloqueAlertas, "Debe buscar un horario existente para editar.", true);
              return;
          }

          const payload = {
              docente: document.getElementById("formDocente").value.trim(),
              facultad: document.getElementById("formFacultad").value.trim(),
              carrera: document.getElementById("formCarrera").value.trim(),
              materia: document.getElementById("formMateria").value.trim(),
              fechaClase: document.getElementById("formFecha").value.trim(),
              horaIniciaClase: document.getElementById("formHoraInicia").value.trim(),
              horaTerminaClase: document.getElementById("formHoraTermina").value.trim()
          };

          if (Object.values(payload).some(v => !v)) {
              lanzarMensajeFeedback(bloqueAlertas, "Debes completar los datos del formulario", true);
              return;
          }

          if (modo === "editar" && !confirm("¿Está seguro de Editar el registro?")) {
              formTag.reset();
              return;
          }

          try {
              if (modo === "crear") {
                  await realizarLlamadoAPI("POST", "/api/horarios", payload);
                  lanzarMensajeFeedback(bloqueAlertas, "Registro creado.", false);
              } else if (modo === "editar") {
                  await realizarLlamadoAPI("PUT", `/api/horarios/${moduloEstado.idSeleccionado}`, payload);
                  lanzarMensajeFeedback(bloqueAlertas, "Horario editado.", false);
              }
              btnSubmit.setAttribute("disabled", "true");
              setTimeout(() => { transicionarModulo("inicio"); }, 1500);
          } catch (ex) {
              if (ex.detalles && Array.isArray(ex.detalles.errors)) {
                  lanzarMensajeFeedback(bloqueAlertas, ex.detalles.errors.join(", "), true);
              } else {
                  lanzarMensajeFeedback(bloqueAlertas, ex.message, true);
              }
          }
      });

      return contenedorForm;
  }

  function componenteTablaListado() {
      const moduloListado = crearNodo("div", { class: "p-2" });
      moduloListado.appendChild(crearNodo("h3", { class: "fw-bold text-dark mb-4", text: "Listado de horarios" }));

      // Controles de filtros
      const filaFiltros = crearNodo("div", { class: "row g-2 mb-3" });

      const colSel = crearNodo("div", { class: "col-sm-4" });
      const selectOrd = crearNodo("select", { class: "form-select form-select-sm" });
      [["idHorario", "Ordenar por ID"], ["docente", "Ordenar por Docente"], ["materia", "Ordenar por Materia"]].forEach(i => {
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

      // Tabla estructurada
      const divTabla = crearNodo("div", { class: "table-responsive border rounded bg-white" });
      const tablaHTML = crearNodo("table", { class: "table table-hover table-striped mb-0 align-middle small" });
      const thead = crearNodo("thead", { class: "table-light" });
      const trh = crearNodo("tr");

      ["ID", "Docente", "Facultad", "Carrera", "Materia", "Fecha", "Inicia", "Termina"].forEach(t => {
          trh.appendChild(crearNodo("th", { text: t, class: "p-3" }));
      });
      thead.appendChild(trh);
      tablaHTML.appendChild(thead);

      const tbody = crearNodo("tbody");
      tablaHTML.appendChild(tbody);
      divTabla.appendChild(tablaHTML);
      moduloListado.appendChild(divTabla);

      // Barra inferior
      const footerListado = crearNodo("div", { class: "d-flex justify-content-between align-items-center mt-3" });
      const txtConteo = crearNodo("span", { class: "text-muted small fw-bold", id: "lblConteo", text: "Registros: 0" });
      const btnCerrarListado = crearNodo("button", { type: "button", class: "btn btn-sm btn-secondary px-3", text: "Cerrar" });

      footerListado.appendChild(txtConteo);
      footerListado.appendChild(btnCerrarListado);
      moduloListado.appendChild(footerListado);

      btnCerrarListado.addEventListener("click", () => transicionarModulo("inicio"));

      async function cargarDatosEfectivos() {
          selectOrd.setAttribute("disabled", "true");
          inputBusq.setAttribute("disabled", "true");
          btnFiltrar.setAttribute("disabled", "true");

          try {
              const query = `orderBy=${moduloEstado.filtrosTable.ordenador}&q=${encodeURIComponent(moduloEstado.filtrosTable.buscarTermino)}`;
              const resList = await realizarLlamadoAPI("GET", `/api/horarios/list?${query}`);

              limpiarElemento(tbody);
              const arrayHorarios = resList && Array.isArray(resList.horarios) ? resList.horarios : [];
              txtConteo.textContent = `Registros: ${arrayHorarios.length}`;

              if (arrayHorarios.length === 0) {
                  const trVacio = crearNodo("tr");
                  trVacio.appendChild(crearNodo("td", { colspan: "8", class: "text-center text-muted py-4", text: "No hay registros para mostrar." }));
                  tbody.appendChild(trVacio);
              } else {
                  arrayHorarios.forEach(item => {
                      const trData = crearNodo("tr");
                      trData.appendChild(crearNodo("td", { text: item.idHorario, class: "p-3 fw-bold text-primary" }));
                      trData.appendChild(crearNodo("td", { text: item.docente }));
                      trData.appendChild(crearNodo("td", { text: item.facultad }));
                      trData.appendChild(crearNodo("td", { text: item.carrera }));
                      trData.appendChild(crearNodo("td", { text: item.materia }));
                      trData.appendChild(crearNodo("td", { text: item.fechaClase }));
                      trData.appendChild(
                        crearNodo("td", {
                            text: item.horaIniciaClase
                                ? item.horaIniciaClase.substring(0,5)
                                : ""
                        })
                    );
                    trData.appendChild(
                        crearNodo("td", {
                            text: item.horaTerminaClase
                                ? item.horaTerminaClase.substring(0,5)
                                : ""
                        })
                    );
                      tbody.appendChild(trData);
                  });
              }
          } catch (err) {
              console.error(err);
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

      inputBusq.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
              moduloEstado.filtrosTable.ordenador = selectOrd.value;
              moduloEstado.filtrosTable.buscarTermino = inputBusq.value.trim();
              cargarDatosEfectivos();
          }
      });

      cargarDatosEfectivos();
      return moduloListado;
  }

  function componenteVistaSalida() {
      const divExit = crearNodo("div", { class: "text-center py-5" });
      divExit.appendChild(crearNodo("h4", { class: "text-danger fw-bold mb-3", text: "Sesión Finalizada" }));
      divExit.appendChild(crearNodo("p", { class: "text-muted mb-4", text: "Puede cerrar esta pestaña/ventana del navegador para finalizar." }));

      const btnRegresar = crearNodo("button", { type: "button", class: "btn btn-sm btn-outline-primary px-4", text: "Volver al menú" });
      btnRegresar.addEventListener("click", () => transicionarModulo("inicio"));

      divExit.appendChild(btnRegresar);
      return divExit;
  }

  // ==========================================
  // ORQUESTADOR DE INTERFAZ GENERAL (SPA)
  // ==========================================

  function renderizarEstructuraBase() {
      limpiarElemento(appContainer);

      // 1. Navbar Superior Institucional
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

      // 2. Layout Principal de Dos Columnas
      const rowLayout = crearNodo("div", { class: "container-fluid mt-4" });
      const gridLayout = crearNodo("div", { class: "row g-4" });

      // COLUMNA IZQUIERDA: Sidebar
      const colIzquierda = crearNodo("div", { class: "col-lg-3 col-md-4" });
      const cardSidebar = crearNodo("div", { class: "sidebar-card" });

      cardSidebar.appendChild(crearNodo("h6", { class: "menu-title", text: "Menú Principal" }));

      const listaGrupo = crearNodo("div", { class: "list-group list-group-flush" });

      const rutasMenu = [
          { clave: "crear", etiqueta: "Crear horario", icono: "bi-plus-circle", iconClass: "icon-crear" },
          { clave: "editar", etiqueta: "Editar horario", icono: "bi-pencil", iconClass: "icon-editar" },
          { clave: "borrar", etiqueta: "Borrar horario", icono: "bi-trash", iconClass: "icon-borrar" },
          { clave: "listar", etiqueta: "Listado de horarios", icono: "bi-table", iconClass: "icon-listar" }
      ];

      rutasMenu.forEach(item => {
          const esActivo = moduloEstado.vistaActiva === item.clave;
          const linkMenu = crearNodo("button", {
              type: "button",
              class: `list-group-item ${esActivo ? 'active' : ''}`
          });

          linkMenu.appendChild(crearNodo("i", { class: `bi ${item.icono} ${esActivo ? '' : item.iconClass}` }));
          linkMenu.appendChild(crearNodo("span", { text: item.etiqueta }));

          linkMenu.addEventListener("click", () => transicionarModulo(item.clave));
          listaGrupo.appendChild(linkMenu);
      });

      cardSidebar.appendChild(listaGrupo);

      // Footer del sidebar con ícono de info
      const footerSidebar = crearNodo("p", { class: "sidebar-footer" });
      footerSidebar.appendChild(crearNodo("i", { class: "bi bi-info-circle" }));
      footerSidebar.appendChild(document.createTextNode(" Selecciona una opción del menú."));
      cardSidebar.appendChild(footerSidebar);

      colIzquierda.appendChild(cardSidebar);
      gridLayout.appendChild(colIzquierda);

      // COLUMNA DERECHA: Contenedor Central
      const colDerecha = crearNodo("div", { class: "col-lg-9 col-md-8" });
      const panelContenedorCentral = crearNodo("div", { class: "main-panel" });

      switch (moduloEstado.vistaActiva) {
          case "inicio":
              panelContenedorCentral.appendChild(vistaBienvenida());
              break;
          case "crear":
              panelContenedorCentral.appendChild(componenteFormulario("crear"));
              break;
          case "editar":
              panelContenedorCentral.appendChild(componenteFormulario("editar"));
              break;
          case "borrar":
              panelContenedorCentral.appendChild(componenteFormulario("borrar"));
              break;
          case "listar":
              panelContenedorCentral.appendChild(componenteTablaListado());
              break;
          case "salir":
              panelContenedorCentral.appendChild(componenteVistaSalida());
              break;
          default:
              panelContenedorCentral.appendChild(vistaBienvenida());
      }

      colDerecha.appendChild(panelContenedorCentral);
      gridLayout.appendChild(colDerecha);
      rowLayout.appendChild(gridLayout);
      appContainer.appendChild(rowLayout);
  }

  // Inicializar aplicación SPA al cargar
  renderizarEstructuraBase();
})();