# Proyecto Horarios Docentes

## Descripción del proyecto

Este proyecto permite registrar, consultar, editar y eliminar horarios de docentes.

El sistema está dividido en dos partes:

- Frontend: interfaz visual mostrada en el navegador.
- Backend: servidor encargado de procesar solicitudes y conectarse con MySQL.

---

# Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- MySQL

---

# Estructura del proyecto

```bash
back/
    db.js
    horariosDocentesRepository.js
    httpUtils.js
    server.js
    validation.js

front/
    index.html
    appHorarios.js

variables/
    dbConfig.js
    schema_horarios_docentes.sql
```

---

# Requisitos

Antes de ejecutar el proyecto se necesita:

- Node.js instalado
- MySQL instalado
- Visual Studio Code (recomendado)

---

# Instalación del proyecto

## 1. Abrir la terminal CMD

Ubicarse dentro de la carpeta del proyecto:

```bash
cd ruta_del_proyecto
```

---

## 2. Instalar dependencias

Ejecutar:

```bash
npm install
```

---

## 3. Crear la base de datos

Abrir MySQL Workbench o consola MySQL y ejecutar el archivo:

```bash
variables/schema_horarios_docentes.sql
```
---

## 4. Configurar conexión MySQL

Editar el archivo:

```bash
variables/dbConfig.js
```

Verificar:

- usuario
- contraseña
- puerto
- nombre de la base de datos

---

# Ejecutar el servidor

En CMD ejecutar:

```bash
node back/server.js
```

Si todo funciona correctamente, aparecerá un mensaje similar a:

```bash
Servidor iniciado correctamente
✅ MYSQL CONECTADO CORRECTAMENTE
```

---

# Abrir el proyecto en el navegador

Ingresar en el navegador:

```bash
http://127.0.0.1:8080
```

o:

```bash
http://127.0.0.1:8080
```

---

# Funcionalidades principales

- Registrar horarios
- Editar horarios
- Eliminar horarios
- Buscar horarios
- Validar horarios cruzados
- Validar duración mínima y máxima
- Validar fechas y horas

---

# Recomendaciones

- No modificar directamente la base de datos mientras el sistema esté en uso.
- Utilizar variables de entorno en producción.
- Mantener actualizado Node.js.

---

# Explicación general del flujo

1. El usuario interactúa con la interfaz.
2. El frontend envía solicitudes HTTP.
3. El backend recibe la información.
4. Se validan los datos.
5. MySQL guarda o consulta la información.
6. El servidor responde al frontend.

---

# Desarrollado por
Manuel Salvador Benitez Giraldo
Yeisson Castaño Calle
Darwin Leon Gaviria Angel
Victor Hugo Hurtado Morales
Kevin Alejandro Montoya Corrales
Mariana Valencia Castaño

Proyecto académico para gestión de horarios docentes.