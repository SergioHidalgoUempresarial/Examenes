const preguntasDesarrollo = [
    "Explique qué es una base de datos relacional.",
    "Describa las ventajas del modelo cliente-servidor.",
    "¿Qué es una tabla en SQL? Dé un ejemplo.",
    "¿Por qué es importante normalizar una base de datos?",
    "Explique la diferencia entre DELETE y TRUNCATE.",
    "¿Qué es una transacción en bases de datos?",
    "Describa el concepto de integridad referencial.",
    "Mencione al menos tres comandos DDL y su función."
];

let indiceDesarrollo = 0;


function initDevelopmentPart() {
    mostrarPreguntaDesarrollo(indiceDesarrollo);

    document.getElementById("btnSiguienteDesarrollo").addEventListener("click", () => {
        if (indiceDesarrollo < preguntasDesarrollo.length - 1) {
            indiceDesarrollo++;
            mostrarPreguntaDesarrollo(indiceDesarrollo);
        }
    });

    document.getElementById("btnFinalizarDesarrollo").addEventListener("click", () => {
        Swal.fire({
            title: "Parte de desarrollo finalizada",
            text: "Has respondido todas las preguntas abiertas. Se generará el resumen.",
            icon: "success",
            confirmButtonText: "Generar resumen"
        }).then(() => {
            window.location.href = "resumen.html"; // Cambia esto si usas otra ruta
        });
    });
}

function mostrarPreguntaDesarrollo(index) {
    const contenedor = document.getElementById("essay-container");
    const pregunta = preguntasDesarrollo[index];

    // Limpiar
    contenedor.innerHTML = `
    <div class="essay-question">
        <label for="respuesta-${index}"><strong>${index + 1}.</strong> ${pregunta}</label><br>
        <textarea id="respuesta-${index}" rows="5" cols="80" placeholder="Escribe tu respuesta aquí...">${obtenerRespuestaDesarrollo(index)}</textarea>
    </div>
    <div class="essay-navigation">
        <button id="btnSiguienteDesarrollo">Siguiente</button>
        <button id="btnFinalizarDesarrollo" style="display: none;">Finalizar Parte de Desarrollo</button>
    </div>
  `;

    document.getElementById("btnSiguienteDesarrollo").addEventListener("click", () => {
        if (indiceDesarrollo < preguntasDesarrollo.length - 1) {
            indiceDesarrollo++;
            mostrarPreguntaDesarrollo(indiceDesarrollo);
        }
    });

    // Mostrar u ocultar el botón Finalizar
    if (indiceDesarrollo === preguntasDesarrollo.length - 1) {
        document.getElementById("btnFinalizarDesarrollo").style.display = "inline-block";
    }

    // Guardar cambios automáticamente
    document.getElementById(`respuesta-${index}`).addEventListener("input", function () {
        guardarRespuestaDesarrollo(index, this.value);
    });
}

function guardarRespuestaDesarrollo(index, texto) {
    const examData = JSON.parse(localStorage.getItem("examData")) || {};
    examData.respuestasDesarrollo = examData.respuestasDesarrollo || {};
    examData.respuestasDesarrollo[index] = texto;
    localStorage.setItem("examData", JSON.stringify(examData));
}

function obtenerRespuestaDesarrollo(index) {
    const examData = JSON.parse(localStorage.getItem("examData")) || {};
    return examData.respuestasDesarrollo?.[index] || "";
}

function cargarPanelLateralDesarrollo() {
    const panel = document.getElementById("essayProgressList");
    panel.innerHTML = "";
    preguntasDesarrollo.forEach((_, i) => {
        const box = document.createElement("div");
        box.style.width = "3em"
        box.textContent = i + 1;
        box.style.padding = "10px";
        box.style.backgroundColor = "#e6e6e6ff"
        box.style.borderRadius = "4px";
        box.style.textAlign = "center";
        box.style.cursor = "default";
        box.style.marginBottom = "8px";
        box.style.border = "1px solid #ccc";

        // Colorea si ya respondió
        box.style.background = obtenerRespuestaDesarrollo(i) ? "rgba(248, 194, 26, 1)" : "#f1f1f1";

        // Si es la pregunta actual, resaltarla
        if (i === indiceDesarrollo) {
            box.classList.add("active-question");
            box.style.backgroundColor = "#d6d092ff";
            box.style.width = "3.5em";
            box.style.border = "2px solid #e8e19aff";
        }
        panel.appendChild(box);
    });
}