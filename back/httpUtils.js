/**
 * Utilidades HTTP (Herramientas para la comunicación por internet).
 * Este archivo contiene funciones de ayuda para recibir datos que nos envía el navegador (como formularios) y para responderle de vuelta con textos o datos en formato de texto estándar (JSON).
 */

// Importa una herramienta nativa de Node.js que ayuda a convertir los trozos de datos recibidos por internet a texto legible (en formato UTF-8, que acepta tildes y caracteres especiales).
const { StringDecoder } = require("node:string_decoder"); 

/**
 * Función para responder al navegador enviando datos estructurados en formato JSON.
 * - 'res': El objeto de respuesta que usaremos para enviar la información de vuelta al navegador.
 * - 'statusCode': El código de estado de internet (ej. 200 para indicar que todo salió bien, o 400 si hubo un error).
 * - 'data': Los datos o información en formato JavaScript que queremos enviar.
 */
function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data); // Convierte los datos de JavaScript a una cadena de texto plana (formato JSON) para poder enviarlos por internet.

  // Configura y escribe el encabezado de la respuesta HTTP.
  res.writeHead(statusCode, { 
    // Le indica al navegador que el contenido de la respuesta es un texto en formato JSON escrito con caracteres UTF-8 (tildes, etc).
    "Content-Type": "application/json; charset=utf-8", 
    
    // Le dice al navegador que no guarde esta respuesta en memoria caché (para que siempre solicite información fresca al servidor).
    "Cache-Control": "no-store", 
    
    // Calcula y envía el tamaño en bytes del texto que vamos a mandar, para que el navegador sepa cuándo ha terminado de recibirlo.
    "Content-Length": Buffer.byteLength(body) 
  }); 
  
  res.end(body); // Envía finalmente la información y cierra la comunicación con el navegador para esta petición.
}

/**
 * Función para responder al navegador enviando un texto simple, no estructurado.
 * - 'res': El objeto de respuesta HTTP.
 * - 'statusCode': El código de estado de internet.
 * - 'text': El mensaje de texto que queremos enviar.
 * - 'contentType': Tipo de contenido. Por defecto es texto plano ('text/plain') con caracteres en UTF-8.
 */
function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  // Configura y escribe el encabezado de la respuesta de texto.
  res.writeHead(statusCode, { 
    "Content-Type": contentType, // Tipo de contenido del mensaje (por defecto texto plano).
    "Cache-Control": "no-store", // Indica que no se guarde este mensaje en caché.
    "Content-Length": Buffer.byteLength(text) // Indica el tamaño del mensaje en bytes.
  });
  
  res.end(text); // Envía el texto y finaliza la comunicación.
}

/**
 * Función para leer y procesar la información JSON que nos envía el navegador desde un formulario.
 * - 'req': El objeto de petición o solicitud que contiene los datos que están llegando del navegador.
 * - 'maxBytes': El tamaño máximo permitido en bytes para evitar recibir archivos o textos gigantescos que saturen el servidor.
 */
function readJsonBody(req, { maxBytes }) {
  // Retorna una Promesa, que es una forma de decirle al programa que espere a que termine de llegar toda la información antes de continuar con la ejecución del código.
  return new Promise((resolve, reject) => { 
    const decoder = new StringDecoder("utf8"); // Crea una herramienta para traducir a texto los fragmentos de información digital que van llegando.
    
    let total = 0; // Variable para ir sumando cuántos bytes (tamaño de la información) vamos recibiendo en total.
    let raw = ""; // Variable para ir uniendo o acumulando los pedazos de texto que van llegando.

    // Este evento se ejecuta cada vez que llega un fragmento de datos ('chunk') desde el navegador por internet.
    req.on("data", (chunk) => {
      total += chunk.length; // Suma el tamaño del fragmento actual al total recibido.
      
      // Si la suma de lo recibido supera el límite máximo permitido:
      if (total > maxBytes) {
        // Rechaza la promesa con un mensaje de error y código de estado 413 (indica que la información es demasiado grande).
        reject(Object.assign(new Error("Payload demasiado grande"), { statusCode: 413 })); 
  
        req.destroy(); // Destruye o corta la comunicación de inmediato para no seguir gastando internet ni recursos del servidor.
        
        return; // Sale de la función para detener el proceso.
      }
      
      raw += decoder.write(chunk); // Traduce el trozo de datos recibido a texto legible y lo agrega a la variable acumuladora.
    });

    // Este evento se ejecuta cuando se ha terminado de recibir toda la información desde el navegador.
    req.on("end", () => {
      raw += decoder.end(); // Le indica al traductor de texto que finalice y que recoja cualquier fragmento de texto pendiente.
      
      // Si no llegó ningún tipo de información (el texto está vacío):
      if (!raw) {
        resolve(null); // Resuelve la promesa devolviendo un valor vacío (null).
        return; // Termina el proceso.
      }
      
      try {
        const parsed = JSON.parse(raw); // Intenta convertir el texto acumulado (que está en formato JSON) en un objeto de JavaScript fácil de usar.
        
        resolve(parsed); // Si todo sale bien, resuelve la promesa entregando el objeto JavaScript ya listo.
      } catch {
        // Si el texto recibido no es un JSON válido (está mal escrito o incompleto), rechaza la promesa con un error 400 (indica que la solicitud fue enviada incorrectamente).
        reject(Object.assign(new Error("JSON inválido"), { statusCode: 400 })); 
      }
    });

    // Si ocurre un error en la conexión o en la transferencia de datos:
    req.on("error", reject); // Falla el proceso devolviendo el error ocurrido.
  });
}

// Exporta las funciones creadas para que puedan ser utilizadas por el servidor en 'server.js'.
module.exports = {
  sendJson, 
  sendText, 
  readJsonBody 
};
