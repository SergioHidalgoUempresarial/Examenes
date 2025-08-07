// GENERACIÓN DE RESUMEN DE RESPUESTAS
function obtenerResumenRespuestas() {
    const estado = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
    if (!estado) return "No hay respuestas registradas.";

    const respuestas = estado.respuestas || {};
    const nombre = estado.nombreEstudiante || "Sin nombre";
    const cedula = estado.cedulaEstudiante || "Sin cédula";

    let resumen = `Resumen de Respuestas del Estudiante\n`;
    resumen += `Nombre: ${nombre}\n`;
    resumen += `Cédula: ${cedula}\n\n`;

    // Aquí agrego el estado de aceptación de instrucciones
    const aceptado = estado.instruccionesAceptadas ? "Sí" : "No";
    resumen += `Instrucciones aceptadas: ${aceptado}\n`;

    if (estado.fechaAceptacion) {
        resumen += `Fecha de aceptación: ${new Date(estado.fechaAceptacion).toLocaleString()}\n`;
    }

    resumen += "\n";

    Object.entries(respuestas).forEach(([clave, valor]) => {
        let tipo = "Otro";
        if (clave.startsWith("pregunta_")) tipo = "Selección Única";
        else if (clave.startsWith("desarrollo_")) tipo = "Desarrollo";
        else if (clave.startsWith("practica_")) tipo = "Práctica";

        const numero = clave.split("_")[1];
        resumen += `• Pregunta ${numero} (${tipo}): ${formatearValorRespuesta(valor)}\n`;
    });

    return resumen;
}

function formatearValorRespuesta(valor) {
    if (!valor) return "No respondida";

    if (typeof valor === "string") {
        return valor.trim() === "" ? "No respondida" : valor;
    }

    if (typeof valor === "object" && valor.nombreArchivo) {
        return `Archivo: ${valor.nombreArchivo}`;
    }

    return JSON.stringify(valor);
}

function guardarRespuestaDesarrollo(index, texto) {
    const examData = JSON.parse(localStorage.getItem("examData")) || {};
    examData.respuestasDesarrollo = examData.respuestasDesarrollo || {};
    examData.respuestasDesarrollo[index] = texto;
    localStorage.setItem("examData", JSON.stringify(examData));
    cargarPanelLateralDesarrollo(); // Actualiza visualmente los botones
}