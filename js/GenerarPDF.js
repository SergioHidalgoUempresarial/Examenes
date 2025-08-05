document.getElementById("btnGenerarPDF").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    const examData = JSON.parse(localStorage.getItem("examData")) || {};
    console.log("Datos examen para PDF:", examData);

    const nombre = examData.nombre || "No registrado";
    const cedula = examData.cedula || "No registrada";
    const respuestasSeleccion = examData.respuestasSeleccionUnica || {};
    const respuestasDesarrollo = examData.respuestasDesarrollo || {};

    // ✅ Instrucciones aceptadas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    if (examData.instruccionesAceptadas) {
        doc.text("✅ El estudiante aceptó las instrucciones del examen.", 20, y);
    } else {
        doc.text("⚠️ El estudiante NO aceptó las instrucciones del examen.", 20, y);
    }
    y += 10;

    // 🧑‍🎓 Información del estudiante
    doc.setFontSize(16);
    doc.text("Resumen del Examen", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Nombre del estudiante: ${nombre}`, 20, y);
    y += 10;
    doc.text(`Cédula: ${cedula}`, 20, y);
    y += 10;

    // ✅ Selección única
    const datosSeleccion = respuestasSeleccion.map((item, index) => [
        `${index + 1}. ${item.pregunta}`,
        item.respuesta
    ]);

    if (datosSeleccion.length > 0) {
        doc.text("Respuestas de selección única:", 20, y);
        y += 5;
        doc.autoTable({
            startY: y,
            head: [["Pregunta", "Respuesta"]],
            body: datosSeleccion,
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // 📝 Desarrollo
    const datosDesarrollo = Object.entries(respuestasDesarrollo).map(([key, value], index) => [
        `Pregunta ${index + 1}`, value,
    ]);

    if (datosDesarrollo.length > 0) {
        doc.text("Respuestas de desarrollo:", 20, y);
        y += 5;
        doc.autoTable({
            startY: y,
            head: [["Pregunta", "Respuesta"]],
            body: datosDesarrollo,
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // 💾 Guardar el PDF
    doc.save("resumen_examen.pdf");
});
