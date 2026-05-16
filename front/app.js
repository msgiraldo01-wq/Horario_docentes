/*
  Frontend (HTML + JavaScript puro)

  Proyecto: Horarios Docentes

  Seguridad:
  - Mitigación XSS: uso de textContent en vez de innerHTML.
  - Validaciones básicas antes de enviar datos al backend.
*/

(function () {
  const app = document.getElementById("app");

  const state = {
    view: "menu",
    edit: { idHorario: null },
    list: {
      orderBy: "fechaClase",
      q: ""
    }
  };

  function setGlobalDarkMode() {
    document.documentElement.style.backgroundColor = "#243333";
    document.documentElement.style.color = "#ffffff";

    document.body.style.margin = "0";
    document.body.style.backgroundColor = "#243333";
    document.body.style.color = "#ffffff";
    document.body.style.fontFamily = "'JetBrains Mono', monospace";
    document.body.style.fontSize = "14px";
  }

  function el(tag, attrs) {
    const node = document.createElement(tag);

    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "text") node.textContent = String(v);
        else if (k === "value") node.value = String(v);
        else if (k === "disabled") node.disabled = Boolean(v);
        else node.setAttribute(k, String(v));
      }
    }

    return node;
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function setBoxStyle(node) {
    node.style.border = "1px solid #ffffff";
    node.style.padding = "16px";
    node.style.maxWidth = "900px";
    node.style.margin = "40px auto";
    node.style.backgroundColor = "#2c3f3f";
  }

  function setButtonStyle(btn) {
    btn.style.fontFamily = "'JetBrains Mono', monospace";
    btn.style.fontSize = "14px";
    btn.style.padding = "8px 12px";
    btn.style.margin = "6px";
    btn.style.border = "1px solid #ffffff";
    btn.style.backgroundColor = "#243333";
    btn.style.color = "#ffffff";
    btn.style.cursor = "pointer";
  }

  function setInputStyle(input, { disabled } = {}) {
    input.style.fontFamily = "'JetBrains Mono', monospace";
    input.style.fontSize = "14px";
    input.style.padding = "6px";
    input.style.margin = "4px 0 10px 0";
    input.style.border = "1px solid #ffffff";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    input.style.backgroundColor = disabled ? "#4b4b4b" : "#243333";
    input.style.color = "#ffffff";
  }

  function setLabelStyle(label) {
    label.style.display = "block";
    label.style.marginTop = "8px";
  }

  function setTitleStyle(title) {
    title.style.textAlign = "center";
    title.style.marginBottom = "14px";
  }

  function setMessage(node, text, kind) {
    node.textContent = text || "";

    if (!text) {
      node.style.border = "0";
      node.style.padding = "0";
      return;
    }

    node.style.border = "1px solid #ffffff";
    node.style.padding = "8px";
    node.style.marginTop = "12px";

    node.style.backgroundColor =
      kind === "error" ? "#4a1f1f" : "#1f4a2a";
  }

  async function apiJson(method, url, body) {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (body !== undefined) {
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url, opts);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err = new Error(
        data && data.message ? data.message : "Error"
      );

      err.status = res.status;
      err.data = data;

      throw err;
    }

    return data;
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function validateRequired(fields) {
    const empty = [];

    for (const f of fields) {
      if (!normalizeText(f.value)) {
        empty.push(f.name);
      }
    }

    return empty;
  }

  function showView(view) {
    state.view = view;
    render();
  }

  function buildHorarioForm({ mode }) {
    const box = el("div");
    setBoxStyle(box);

    const title = el("h2", {
      text:
        mode === "create"
          ? "Crear Horario"
          : mode === "edit"
          ? "Editar Horario"
          : "Eliminar Horario"
    });

    setTitleStyle(title);

    box.appendChild(title);

    const form = el("div");

    const docenteLabel = el("label", { text: "Docente" });
    setLabelStyle(docenteLabel);

    const docente = el("input", {
      type: "text",
      value: ""
    });

    setInputStyle(docente);

    const facultadLabel = el("label", { text: "Facultad" });
    setLabelStyle(facultadLabel);

    const facultad = el("input", {
      type: "text",
      value: ""
    });

    setInputStyle(facultad);

    const carreraLabel = el("label", { text: "Carrera" });
    setLabelStyle(carreraLabel);

    const carrera = el("input", {
      type: "text",
      value: ""
    });

    setInputStyle(carrera);

    const materiaLabel = el("label", { text: "Materia" });
    setLabelStyle(materiaLabel);

    const materia = el("input", {
      type: "text",
      value: ""
    });

    setInputStyle(materia);

    const fechaClaseLabel = el("label", {
      text: "Fecha Clase"
    });

    setLabelStyle(fechaClaseLabel);

    const fechaClase = el("input", {
      type: "date",
      value: ""
    });

    setInputStyle(fechaClase);

    const horaInicioLabel = el("label", {
      text: "Hora Inicio"
    });

    setLabelStyle(horaInicioLabel);

    const horaIniciaClase = el("input", {
      type: "time",
      value: ""
    });

    setInputStyle(horaIniciaClase);

    const horaFinLabel = el("label", {
      text: "Hora Finalización"
    });

    setLabelStyle(horaFinLabel);

    const horaTerminaClase = el("input", {
      type: "time",
      value: ""
    });

    setInputStyle(horaTerminaClase);

    const msg = el("div");

    setMessage(msg, "", "ok");

    const primaryBtn = el("button", {
      type: "button",
      text:
        mode === "create"
          ? "Guardar"
          : mode === "edit"
          ? "Editar"
          : "Eliminar"
    });

    setButtonStyle(primaryBtn);

    const cancelBtn = el("button", {
      type: "button",
      text: "Cancelar"
    });

    setButtonStyle(cancelBtn);

    cancelBtn.addEventListener("click", () => {
      showView("menu");
    });

    primaryBtn.addEventListener("click", async () => {
      const missing = validateRequired([
        { name: "docente", value: docente.value },
        { name: "facultad", value: facultad.value },
        { name: "carrera", value: carrera.value },
        { name: "materia", value: materia.value },
        { name: "fechaClase", value: fechaClase.value },
        { name: "horaIniciaClase", value: horaIniciaClase.value },
        { name: "horaTerminaClase", value: horaTerminaClase.value }
      ]);

      if (missing.length) {
        setMessage(
          msg,
          "Campos vacíos: " + missing.join(", "),
          "error"
        );

        return;
      }

      const payload = {
        docente: normalizeText(docente.value),
        facultad: normalizeText(facultad.value),
        carrera: normalizeText(carrera.value),
        materia: normalizeText(materia.value),
        fechaClase: normalizeText(fechaClase.value),
        horaIniciaClase: normalizeText(horaIniciaClase.value),
        horaTerminaClase: normalizeText(horaTerminaClase.value)
      };

      try {
        if (mode === "create") {
          await apiJson(
            "POST",
            "/api/horarios_docentes",
            payload
          );

          setMessage(msg, "Horario creado.", "ok");

          return;
        }

        if (mode === "edit") {
          if (!state.edit.idHorario) {
            setMessage(
              msg,
              "Debe seleccionar un horario.",
              "error"
            );

            return;
          }

          await apiJson(
            "PUT",
            "/api/horarios_docentes/" +
              encodeURIComponent(String(state.edit.idHorario)),
            payload
          );

          setMessage(msg, "Horario editado.", "ok");

          return;
        }

        if (mode === "delete") {
          if (!state.edit.idHorario) {
            setMessage(
              msg,
              "Debe seleccionar un horario.",
              "error"
            );

            return;
          }

          await apiJson(
            "DELETE",
            "/api/horarios_docentes/" +
              encodeURIComponent(String(state.edit.idHorario))
          );

          setMessage(msg, "Horario eliminado.", "ok");

          return;
        }
      } catch (e) {
        if (
          e.data &&
          Array.isArray(e.data.errors)
        ) {
          setMessage(
            msg,
            e.data.errors.join("\n"),
            "error"
          );
        } else {
          setMessage(msg, e.message, "error");
        }
      }
    });

    form.appendChild(docenteLabel);
    form.appendChild(docente);

    form.appendChild(facultadLabel);
    form.appendChild(facultad);

    form.appendChild(carreraLabel);
    form.appendChild(carrera);

    form.appendChild(materiaLabel);
    form.appendChild(materia);

    form.appendChild(fechaClaseLabel);
    form.appendChild(fechaClase);

    form.appendChild(horaInicioLabel);
    form.appendChild(horaIniciaClase);

    form.appendChild(horaFinLabel);
    form.appendChild(horaTerminaClase);

    const buttonsRow = el("div");

    buttonsRow.style.marginTop = "12px";

    buttonsRow.appendChild(primaryBtn);
    buttonsRow.appendChild(cancelBtn);

    form.appendChild(buttonsRow);
    form.appendChild(msg);

    box.appendChild(form);

    return box;
  }

  function renderMenu() {
    const box = el("div");

    setBoxStyle(box);

    const title = el("h2", {
      text: "Administración Horarios Docentes"
    });

    setTitleStyle(title);

    box.appendChild(title);

    const btnCreate = el("button", {
      type: "button",
      text: "Crear Horario"
    });

    const btnEdit = el("button", {
      type: "button",
      text: "Editar Horario"
    });

    const btnDelete = el("button", {
      type: "button",
      text: "Eliminar Horario"
    });

    const btnList = el("button", {
      type: "button",
      text: "Listar Horarios"
    });

    setButtonStyle(btnCreate);
    setButtonStyle(btnEdit);
    setButtonStyle(btnDelete);
    setButtonStyle(btnList);

    btnCreate.addEventListener("click", () => {
      showView("create");
    });

    btnEdit.addEventListener("click", () => {
      showView("edit");
    });

    btnDelete.addEventListener("click", () => {
      showView("delete");
    });

    btnList.addEventListener("click", () => {
      showView("list");
    });

    const row = el("div");

    row.style.textAlign = "center";

    row.appendChild(btnCreate);
    row.appendChild(btnEdit);
    row.appendChild(btnDelete);
    row.appendChild(btnList);

    box.appendChild(row);

    return box;
  }

  function renderList() {
    const box = el("div");

    setBoxStyle(box);

    const title = el("h2", {
      text: "Listado Horarios"
    });

    setTitleStyle(title);

    box.appendChild(title);

    const tableWrap = el("div");

    tableWrap.style.overflowX = "auto";

    const table = el("table");

    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = el("thead");
    const trHead = el("tr");

    const headers = [
      "idHorario",
      "docente",
      "facultad",
      "carrera",
      "materia",
      "fechaClase",
      "horaIniciaClase",
      "horaTerminaClase"
    ];

    for (const h of headers) {
      const th = el("th", { text: h });

      th.style.border = "1px solid #ffffff";
      th.style.padding = "8px";

      trHead.appendChild(th);
    }

    thead.appendChild(trHead);

    const tbody = el("tbody");

    async function load() {
      try {
        const data = await apiJson(
          "GET",
          "/api/horarios_docentes/list"
        );

        const horarios = Array.isArray(data.horarios_docentes)
          ? data.horarios_docentes
          : [];

        clearNode(tbody);

        for (const h of horarios) {
          const tr = el("tr");

          const values = [
            h.idHorario,
            h.docente,
            h.facultad,
            h.carrera,
            h.materia,
            h.fechaClase,
            h.horaIniciaClase,
            h.horaTerminaClase
          ];

          for (const v of values) {
            const td = el("td", {
              text:
                v === null || v === undefined
                  ? ""
                  : String(v)
            });

            td.style.border = "1px solid #ffffff";
            td.style.padding = "8px";

            tr.appendChild(td);
          }

          tbody.appendChild(tr);
        }
      } catch (e) {
        console.error(e);
      }
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    tableWrap.appendChild(table);

    box.appendChild(tableWrap);

    const closeBtn = el("button", {
      type: "button",
      text: "Volver"
    });

    setButtonStyle(closeBtn);

    closeBtn.addEventListener("click", () => {
      showView("menu");
    });

    box.appendChild(closeBtn);

    load();

    return box;
  }

  function render() {
    setGlobalDarkMode();

    clearNode(app);

    if (state.view === "menu") {
      app.appendChild(renderMenu());
    } else if (state.view === "create") {
      app.appendChild(buildHorarioForm({ mode: "create" }));
    } else if (state.view === "edit") {
      app.appendChild(buildHorarioForm({ mode: "edit" }));
    } else if (state.view === "delete") {
      app.appendChild(buildHorarioForm({ mode: "delete" }));
    } else if (state.view === "list") {
      app.appendChild(renderList());
    }
  }

  render();
})();