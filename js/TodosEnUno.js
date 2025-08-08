//////////////////////////////////
//VariablesConfigurables.js
/////////////////////////////////
const EXAM_NAME = "Examen de Fundamentos de TI - TCS1003";
document.getElementById("title").textContent = EXAM_NAME;
const ACCESS_CODE = "1"; // 12345 Código que se valida en script.js
const EXAM_DURATION_MINUTES = 165; // Cambiar a 180 u otro valor si se desea
const EXAM_STORAGE_KEY = "examData"; //Variable para guardar datos en el localStorage
const EXAM_STATE_KEY = "examState"; //Variable para reanudar el examen donde estaba
const MAX_ATTEMPTS = 1000; //Cantidad de intentos si los estudiantes recargan o hacen algo indebido

const ADMIN_PASSWORD = "profe123"; //Contraseña para borrar los datos de la página con Ctrl + Alt + P
const MAX_CLEAR_USES = 10; // Cambia a 2 o 3 si deseas permitir más usos
const CLEAR_INTERVAL_DAYS = 1; // Tiempo en días de espera para poder borrar los datos
/////////////////////////////////



//////////////////////////////////
//VerificaCambioDeCodigo.js
/////////////////////////////////
(function () {
    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
    if (examData?.accessCode && examData.accessCode !== ACCESS_CODE) {
        localStorage.removeItem(EXAM_STORAGE_KEY);
        localStorage.removeItem(EXAM_STATE_KEY);
        localStorage.removeItem("examStarted");
        localStorage.removeItem("examEndTime");
        localStorage.removeItem("uniqueQuestionsRandomizadas");
        localStorage.removeItem("studentAnswers");
        localStorage.removeItem("currentQuestionIndex");
        localStorage.removeItem("parte1Finalizada");
        localStorage.removeItem("currentEssayIndex");
        // Reinicia también el estado de instrucciones aceptadas
        localStorage.removeItem("aceptoInstruccionesExamen");
    }
    // Si el código cambió, inicia objeto vacío
    const newExamData = (examData?.accessCode !== ACCESS_CODE) ? {} : (examData || {});
    newExamData.accessCode = ACCESS_CODE;
    // Elimina las instrucciones aceptadas si el código cambió
    if (examData?.accessCode !== ACCESS_CODE) {
        delete newExamData.instruccionesAceptadas;
        delete newExamData.fechaAceptacion;
        delete newExamData.respuestasDesarrollo;
        delete newExamData.respuestasSeleccionUnica;
    }
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(newExamData));
})();
///////////////////////////////////////



//////////////////////////////////
//Main_Intentos.js
/////////////////////////////////
//VARIABLES GLOBALES
let intentoYaRestado = false; // Para evitar que se reste más de una vez
let devtoolsAbierto = false;
let devtoolsYaDetectado = false;

// VARIABLES PARA TRACKING DE TIEMPO
let questionStartTime = null;
let questionTimes = {};

// GESTIÓN DE INTENTOS
function obtenerIntentosRestantes() {
    const data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
    return data?.intentosRestantes ?? MAX_ATTEMPTS;
}

function restarIntentoYGuardar() {
    if (intentoYaRestado) return;

    let data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || { intentosRestantes: MAX_ATTEMPTS };
    data.intentosRestantes = Math.max(0, (data.intentosRestantes ?? MAX_ATTEMPTS) - 1);
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(data));
    intentoYaRestado = true;
}

function verificarIntentos() {
    const intentosRestantes = obtenerIntentosRestantes();
    if (intentosRestantes <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Examen bloqueado',
            text: 'Has agotado todos tus intentos.',
        }).then(() => window.location.href = "bloqueado.html");
    }
}

function mostrarIntentosRestantes() {
    const data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || { intentosRestantes: MAX_ATTEMPTS };
    const restantes = data.intentosRestantes ?? MAX_ATTEMPTS;
    const span = document.getElementById("intentos-restantes");

    if (!span) return;

    span.textContent = restantes;

    if (restantes === 2) {
        span.style.color = "orange";
    } else if (restantes === 1) {
        span.style.color = "red";
    } else if (restantes === 0) {
        span.style.color = "gray";
    } else {
        span.style.color = "green";
    }
}

function actualizarAccesoPorIntentos() {
    const restantes = obtenerIntentosRestantes();
    const accessSection = document.getElementById("access-section");

    if (!accessSection) return;

    if (restantes <= 0) {
        accessSection.innerHTML = `
            <p style="color: red; font-weight: bold; font-size: 1.2em; margin-top: auto; margin-bottom: auto;">
                Sus intentos se acabaron, por favor póngase en contacto con su docente.
            </p>
        `;
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "none";
    } else {
        accessSection.innerHTML = `
            <h2>Debemos leer las instrucciones para poder realizar la prueba, están arriba a la derecha el cual es un
                botón azul, deben aceptarlas!</h2>
            <label for="accessInput">Ingrese el código de acceso generado por el docente:</label>
            <input type="password" id="accessInput" placeholder="Código de acceso" />
            <button onclick="validateAccess()">Ingresar</button>
            <p id="accessError" style="color:red; display:none;">Código incorrecto. Intente de nuevo.</p>
            <button onclick="resetAccess()" style="display:none;" id="adminResetBtn">Reset Access</button>
        `;
    }
}

function controlarAccesoPorIntentos() {
    const restantes = obtenerIntentosRestantes();
    const inputCodigo = document.getElementById("accessInput");
    const instrucciones = document.getElementById("toggleInstructionsBtn");
    const btnIngresar = inputCodigo?.nextElementSibling;

    if (restantes <= 0) {
        if (inputCodigo) inputCodigo.disabled = true;
        if (btnIngresar) btnIngresar.disabled = true;
        if (instrucciones) instrucciones.disabled = true;
    } else {
        if (inputCodigo) inputCodigo.disabled = false;
        if (btnIngresar) btnIngresar.disabled = false;
        if (instrucciones) instrucciones.disabled = false;
    }
}

// CONTROL UNIFICADO DE SALIDA / TRAMPA
function manejarSalidaExamen(tipo, evento = null) {
    if (intentoYaRestado) return;

    restarIntentoYGuardar();
    mostrarIntentosRestantes();
    localStorage.setItem(EXAM_STATE_KEY, "perdido");

    if (tipo === "recarga" && evento) {
        const msg = "Si recarga o sale, perderá un intento.";
        evento.preventDefault();
        evento.returnValue = msg;
        return msg;
    }

    if (tipo === "cambioPestania") {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Has salido del examen. Perdiste un intento.',
            confirmButtonText: 'Entendido'
        }).then(() => location.reload());
    }

    if (tipo === "devtools") {
        Swal.fire({
            icon: 'error',
            title: 'Acción no permitida',
            text: 'Se detectó manipulación (DevTools). Has perdido un intento.',
        }).then(() => location.reload());
    }
}

window.addEventListener("beforeunload", function (e) {
    // Marcar que se va a recargar para detectarlo después
    localStorage.setItem("paginaRecargada", "true");
    manejarSalidaExamen("recarga", e);
});

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        manejarSalidaExamen("cambioPestania");
    }
});


// DETECCIÓN CONFIABLE DE DEVTOOLS
function detectarDevtoolsConTiempo() {
    const umbral = 100; // milisegundos

    const antes = new Date();
    Function('debugger')(); // Ejecuta sin mostrar nada
    const despues = new Date();

    const diferencia = despues - antes;

    if (diferencia > umbral && !devtoolsYaDetectado) {
        devtoolsYaDetectado = true;

        Swal.fire({
            icon: 'error',
            title: 'DevTools detectado',
            html: `
                <p>Has abierto las herramientas de desarrollo (DevTools).</p>
                <p><strong>Se perderá un intento</strong> por esta acción.</p>
            `,
            confirmButtonText: 'Entendido',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            manejarSalidaExamen("devtools"); // restar intento
            location.reload(); // recarga para bloquear el intento
        });
    }
}

// Llamar la detección cada 1.5 segundos
setInterval(detectarDevtoolsConTiempo, 1500);


// MOSTRAR/OCULTAR INSTRUCCIONES
const btn = document.getElementById("toggleInstructionsBtn");
const instructions = document.getElementById("instruction");
instructions.style.display = "none";

btn?.addEventListener("click", () => {
    if (instructions.style.display === "none") {
        instructions.style.display = "block";
        btn.innerText = "Ocultar Instrucciones";
    } else {
        instructions.style.display = "none";
        btn.innerText = "Ver Instrucciones";
    }
});

document.addEventListener("click", function (e) {
    const isInside = instructions.contains(e.target) || btn.contains(e.target);
    if (!isInside && instructions.style.display === "block") {
        Swal.fire({
            icon: 'info',
            title: 'Instrucciones ocultas',
            text: 'Se han ocultado automáticamente al interactuar fuera.',
            confirmButtonText: 'Entendido'
        });
        instructions.style.display = "none";
        btn.innerText = "Ver Instrucciones";
    }
});

// CHECKBOX DE CONSENTIMIENTO
document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById("agreeCheck");
    if (!checkbox) return;

    // --- Aquí agrego código para cargar el estado guardado ---
    let estado = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
    if (estado.instruccionesAceptadas) {
        checkbox.checked = true;
        checkbox.disabled = true;
        instructions.style.display = "none";
        btn.innerText = "Ver Instrucciones";
    }

    // Evento para guardar cuando el usuario acepte
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            Swal.fire({
                icon: 'info',
                title: 'Consentimiento registrado',
                text: 'Aceptaste las instrucciones. No se puede deshacer.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#004080',
                allowOutsideClick: true,
                allowEscapeKey: true
            }).then((result) => {
                if (result.isConfirmed || result.dismiss) {
                    checkbox.disabled = true;
                    instructions.style.display = "none";
                    btn.innerText = "Ver Instrucciones";

                    // **Se añde esto para que se guarde en el localStorage**
                    let estado = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
                    estado.instruccionesAceptadas = true;
                    estado.fechaAceptacion = new Date().toISOString();
                    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(estado));
                } else {
                    checkbox.checked = false;
                }
            });
        } else {
            checkbox.checked = true;
        }
    });
});


// BOTÓN SECRETO PARA ADMINISTRADOR
window.addEventListener("DOMContentLoaded", () => {
    const adminBtn = document.getElementById("admin-clear");
    adminBtn.style.display = "none";

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.altKey && e.code === "KeyP") {
            const usedCount = parseInt(localStorage.getItem("clearButtonUses") || "0", 10);
            if (usedCount < MAX_CLEAR_USES) {
                adminBtn.style.display = "block";
            }
        }
    });

    adminBtn.addEventListener("click", () => {
        const lastClearDateStr = localStorage.getItem("lastClearDate");
        const now = new Date();

        if (lastClearDateStr) {
            const lastClearDate = new Date(lastClearDateStr);
            const diffTime = now - lastClearDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays < 2) {
                Swal.fire({
                    icon: "info",
                    title: "Espera requerida",
                    text: "Este botón solo se puede usar cada 2 días.",
                });
                return;
            }
        }

        Swal.fire({
            title: "Confirmación",
            input: "password",
            inputLabel: "Ingrese su clave de administrador",
            inputPlaceholder: "Contraseña",
            showCancelButton: true,
            confirmButtonText: "Borrar todo",
            preConfirm: (password) => {
                if (password !== ADMIN_PASSWORD) {
                    Swal.showValidationMessage("❌ Contraseña incorrecta");
                }
                return password === ADMIN_PASSWORD;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                localStorage.setItem("lastClearDate", now.toISOString());
                let usedCount = parseInt(localStorage.getItem("clearButtonUses") || "0", 10);
                usedCount++;
                localStorage.setItem("clearButtonUses", usedCount.toString());
                adminBtn.style.display = "none";

                Swal.fire({
                    icon: "success",
                    title: "Datos borrados",
                    text: "Todo el progreso del examen fue eliminado.",
                }).then(() => location.reload());
            }
        });
    });
});


// INICIALIZACIÓN
window.onload = function () {
    // Detectar si hubo recarga y mostrar mensaje
    if (localStorage.getItem("paginaRecargada") === "true") {
        localStorage.removeItem("paginaRecargada");
        Swal.fire({
            icon: 'warning',
            title: 'Página recargada',
            text: 'Has recargado la página. Perdiste un intento.',
            confirmButtonText: 'Entendido'
        });
    }
    
    verificarIntentos();
    mostrarIntentosRestantes();
    actualizarAccesoPorIntentos();
    controlarAccesoPorIntentos();
};

//Para que no lo vuelva a pedir el código a menos que sea necesario
window.addEventListener("DOMContentLoaded", function () {
    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
    const intentosRestantes = examData.intentosRestantes ?? MAX_ATTEMPTS;

    if (localStorage.getItem("parte1Finalizada") === "true") {
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "block";

        // Recupera el índice guardado o empieza en 0 si no existe
        const savedEssayIndex = localStorage.getItem("currentEssayIndex");
        indiceDesarrollo = savedEssayIndex !== null ? parseInt(savedEssayIndex, 10) : 0;

        mostrarPreguntaDesarrollo(indiceDesarrollo);
        cargarPanelLateralDesarrollo();
    }

    // Si no hay intentos, muestra solo el acceso bloqueado
    if (intentosRestantes <= 0) {
        document.getElementById("access-section").style.display = "block";
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "none";
        return;
    }

    // Si ya validó datos y aceptó instrucciones, muestra la parte correspondiente
    if (examData.nombre && examData.cedula && examData.instruccionesAceptadas) {
        document.getElementById("access-section").style.display = "none";
        document.getElementById("name-section").style.display = "block";
        document.getElementById("nav-bar").style.display = "block"; // Mostrar menú hamburguesa
        document.getElementById("begin-timer").style.display = "block"; // Mostrar timer
        
        // Reiniciar el timer si es necesario
        if (localStorage.getItem("examStarted") === "true") {
            startTimer();
        }

        if (localStorage.getItem("parte1Finalizada") === "true") {
            document.getElementById("uniqueSelection").style.display = "none";
            document.getElementById("essay").style.display = "block";
            const savedEssayIndex = localStorage.getItem("currentEssayIndex");
            indiceDesarrollo = savedEssayIndex !== null ? parseInt(savedEssayIndex, 10) : 0;
            mostrarPreguntaDesarrollo(indiceDesarrollo);
            cargarPanelLateralDesarrollo();
        } else {
            document.getElementById("uniqueSelection").style.display = "block";
            document.getElementById("essay").style.display = "none";
            initUniqueSelection(); //Para que cargue
            renderProgressBar();
        }
    } else {
        // Si no ha validado datos, muestra el acceso
        document.getElementById("access-section").style.display = "block";
        document.getElementById("name-section").style.display = "none";
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "none";
    }
});
///////////////////////////////////////





//////////////////////////////////
//Seguridad.js
/////////////////////////////////
//BLOQUEO DE FUNCIONES NO PERMITIDAS
let seguridadActiva = true;

// Función de bloqueo de combinaciones peligrosas
document.addEventListener("keydown", function (e) {
    if (!seguridadActiva) return;

    const key = (e.key || "").toLowerCase();
    const bloqueado =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && key === "i") ||   // DevTools
        (e.ctrlKey && key === "u") ||                 // Ver código fuente
        (e.ctrlKey && key === "s") ||                 // Guardar página
        (e.ctrlKey && key === "p");                   // Imprimir

    if (bloqueado) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
});

// Bloquear clic derecho
document.addEventListener("contextmenu", function (e) {
    if (seguridadActiva) {
        e.preventDefault();
    }
});
////////////////////////////////////










//////////////////////////////////
//ValidarAcceso.js
/////////////////////////////////
function validateAccess() {
    const inputCode = document.getElementById("accessInput").value.trim();
    const checkbox = document.getElementById("agreeCheck");

    if (!checkbox.checked || !checkbox.disabled) {
        Swal.fire({
            icon: 'warning',
            title: 'Debe aceptar las instrucciones',
            text: 'Por favor lea y acepte las instrucciones antes de comenzar el examen.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#004080',
        });
        return; // Detiene la ejecución
    }

    if (inputCode === ACCESS_CODE) {
        document.getElementById("access-section").style.display = "none";

        document.getElementById("upload").style.display = "none";
        document.getElementById("final").style.display = "none";
        Swal.fire({
            title: '¡Recuerde!',
            html: `
                <p>Le doy mis mejores deseos en la evaluación.</p>
                <br>
                <ul style="text-align:left;">
                    <li>No recargue la página</li>
                    <li>No cambie de pestaña o ventana</li>
                    <li>Evite cerrar el navegador</li>
                    <br>
                    <br>
                    <li>El examen podría anularse</li>
                </ul>
                <br>
                <b>¡"Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia."Proverbios 2:6!</b>
                `,
            imageUrl: 'images/BestWishes.png',
            confirmButtonText: 'Sí estoy de acuerdo',
            confirmButtonColor: '#0a691aff',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#004080',
            showCancelButton: true,
            allowOutsideClick: false,
            customClass: {
                popup: 'swal-wide-low'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("Usuario aceptó las instrucciones");

                // Aquí se da la línea para marcar que el examen empezó anteriormente y no reinicie el temporizador
                localStorage.setItem("examStarted", "true");

                startTimer();
                document.getElementById("nav-bar").style.display = "block";
                document.getElementById("begin-timer").style.display = "block";
                document.getElementById("name-section").style.display = "block";

            } else if (result.isDismissed) {
                // El usuario presionó cancelar o cerró el cuadro
                window.location.href = "https://www.google.com"; // o cerrar ventana: window.close();
            }
        });
    } else {
        document.getElementById("accessError").style.display = "block";
    }
}
////////////////////////////////////////








//////////////////////////////////
//VerInstrucciones.js
/////////////////////////////////
const btnAcceptInstructions = document.getElementById("toggleInstructionsBtn");
const panelInstructions = document.getElementById("instruction");
const agreeKey = "aceptoInstruccionesExamen"; // clave para localStorage

panelInstructions.style.display = "none";

btnAcceptInstructions.addEventListener("click", () => {
    if (panelInstructions.style.display === "none") {
        panelInstructions.style.display = "block";
        btnAcceptInstructions.innerText = "Ocultar Instrucciones";
    } else {
        panelInstructions.style.display = "none";
        btnAcceptInstructions.innerText = "Ver Instrucciones";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById("agreeCheck");

    // Cargar estado previo del checkbox
    const aceptadoPrevio = localStorage.getItem(agreeKey);
    if (aceptadoPrevio === "true") {
        checkbox.checked = true;
        checkbox.disabled = true;
        panelInstructions.style.display = "none";
        btnAcceptInstructions.innerText = "Ver Instrucciones";
    }

    // Al marcar el checkbox
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            Swal.fire({
                icon: 'info',
                title: 'Consentimiento registrado',
                text: 'Usted ha aceptado las instrucciones del examen. Esta acción no se puede deshacer.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#004080',
                allowOutsideClick: true,
                allowEscapeKey: true
            }).then((result) => {
                if (result.isConfirmed) {
                    checkbox.checked = true;
                    checkbox.disabled = true;
                    panelInstructions.style.display = "none";
                    btnAcceptInstructions.innerText = "Ver Instrucciones";

                    // Guardar estado en localStorage
                    localStorage.setItem(agreeKey, "true");
                    let examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
                    examData.instruccionesAceptadas = true;
                    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(examData));
                } else {
                    checkbox.checked = false;
                    Swal.fire({
                        icon: 'warning',
                        title: 'Instrucciones no aceptadas',
                        text: 'No se han aceptado las instrucciones y para poder iniciar el examen es necesario aceptarlas.',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#c0392b',
                        allowOutsideClick: false
                    });
                }
            });
        } else {
            // No permitir desmarcar después de aceptar
            if (checkbox.disabled) {
                checkbox.checked = true;
            }
        }
    });

    // Cerrar instrucciones si clic fuera del panel y botón, solo si NO ha aceptado
    document.addEventListener("click", function (event) {
        const target = event.target;

        if (
            panelInstructions.style.display === "block" &&
            !panelInstructions.contains(target) &&
            !btnAcceptInstructions.contains(target) &&
            !checkbox.disabled // solo si NO está aceptado
        ) {
            panelInstructions.style.display = "none";
            btnAcceptInstructions.innerText = "Ver Instrucciones";

            Swal.fire({
                icon: 'warning',
                title: 'Instrucciones no aceptadas',
                text: 'No se han aceptado las instrucciones y para poder iniciar el examen es necesario aceptarlas.',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#c0392b',
                allowOutsideClick: false
            });
        }
    });
});

// Lógica del botón toggle fuera de DOMContentLoaded para que funcione sin retraso
btnAcceptInstructions.addEventListener("click", () => {
    if (panelInstructions.style.display === "none") {
        panelInstructions.style.display = "block";
        btnAcceptInstructions.innerText = "Ocultar Instrucciones";
    } else {
        panelInstructions.style.display = "none";
        btnAcceptInstructions.innerText = "Ver Instrucciones";
    }
});
/////////////////////////////////
















//////////////////////////////////
//IniciarCuentaRegresiva.js
/////////////////////////////////
let timerInterval;

function startTimer() {

    if (localStorage.getItem("examStarted") !== "true") {
        return;
    }

    // Verifica si ya existe endTime guardado
    let endTime = localStorage.getItem("examEndTime");

    if (!endTime) {
        endTime = Date.now() + EXAM_DURATION_MINUTES * 60 * 1000;
        localStorage.setItem("examEndTime", endTime);
    } else {
        endTime = parseInt(endTime, 10);
    }

    timerInterval = setInterval(() => {
        const remaining = endTime - Date.now();

        if (remaining <= 0) {
            clearInterval(timerInterval);
            document.getElementById("timer").textContent = "Tiempo terminado temporizador";
            localStorage.removeItem("examEndTime");
            finishExam();
        } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            document.getElementById("timer").textContent =
                `Tiempo restante temporizador: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function finishExam() {
    localStorage.removeItem("examEndTime");
    localStorage.removeItem("examStarted");
    clearInterval(timerInterval);
    // Aquí continúa el proceso normal de cierre del examen
    Swal.fire({
        icon: 'info',
        title: 'Examen finalizado',
        text: 'Tu temporizador ha terminado.',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        window.location.href = "resumen.html"; // O página de resumen
    });
}
////////////////////////////////////













//////////////////////////////////
//MostrarFechaActual.js
/////////////////////////////////
const dateElement = document.getElementById("dateDisplay");
const now = new Date();
const formattedDate = now.toLocaleDateString("es-CR", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});
dateElement.textContent = `Fecha: ${formattedDate}`;
////////////////////////////////////////












//////////////////////////////////
//PreguntasDesarrollo.js
/////////////////////////////////
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
    loadQuestionTimes(); // Cargar tiempos guardados
    const savedEssayIndex = localStorage.getItem("currentEssayIndex");
    indiceDesarrollo = savedEssayIndex !== null ? parseInt(savedEssayIndex, 10) : 0;
    mostrarPreguntaDesarrollo(indiceDesarrollo);

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
    // Guardar tiempo de pregunta anterior
    if (questionStartTime !== null && indiceDesarrollo !== index) {
        const timeSpent = Date.now() - questionStartTime;
        if (!questionTimes.desarrollo) questionTimes.desarrollo = {};
        questionTimes.desarrollo[indiceDesarrollo] = timeSpent;
        saveQuestionTimes();
    }
    
    // Iniciar tiempo para nueva pregunta
    questionStartTime = Date.now();
    
    const contenedor = document.getElementById("essay-container");
    const pregunta = preguntasDesarrollo[index];

    indiceDesarrollo = index; // Actualiza el índice global
    localStorage.setItem("currentEssayIndex", indiceDesarrollo); // Guarda el índice actual

    // Limpiar
    contenedor.innerHTML = `
    <h2>Parte 2: Preguntas de desarrollo</h2>
    <br>
    <div class="essay-question">
        <label for="respuesta-${index}"><strong>${index + 1}.</strong> ${pregunta}</label><br>
        <textarea id="respuesta-${index}" placeholder="Escribe tu respuesta aquí...">${obtenerRespuestaDesarrollo(index)}</textarea>
    </div>
    <div class="essay-navigation">
        <button id="btnSiguienteDesarrollo">Siguiente</button>
        <button id="btnFinalizarDesarrollo" style="display: none;">Finalizar Parte de Desarrollo</button>
    </div>
  `;

    // Inicializar TinyMCE
    const isMobile = window.innerWidth <= 600;
    
    tinymce.init({
        selector: `#respuesta-${index}`,
        height: 400,
        menubar: isMobile ? false : 'file edit view insert format tools table help',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount',
            'codesample', 'hr', 'pagebreak', 'nonbreaking'
        ],
        toolbar_mode: isMobile ? 'sliding' : 'wrap',
        toolbar: isMobile ? 
            'undo redo | bold italic | numlist bullist | link | fullscreen' :
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | align lineheight | numlist bullist indent outdent | link table codesample | code preview fullscreen | help',
        content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
        branding: false,
        resize: 'both',
        statusbar: true,
        elementpath: !isMobile,
        promotion: false,
        setup: function (editor) {
            editor.on('change keyup', function () {
                const content = editor.getContent();
                guardarRespuestaDesarrollo(index, content);
            });
        }
    });

    document.getElementById("btnSiguienteDesarrollo").addEventListener("click", () => {
        // Obtener contenido de TinyMCE
        const editor = tinymce.get(`respuesta-${indiceDesarrollo}`);
        const respuestaActual = editor ? editor.getContent({format: 'text'}).trim() : '';
        
        // Verificar si la respuesta está vacía
        if (!respuestaActual) {
            Swal.fire({
                icon: 'warning',
                title: 'Respuesta vacía',
                text: '¿Deseas continuar sin responder esta pregunta?',
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Usuario eligió continuar
                    continuarSiguientePregunta();
                }
                // Si cancela, no hace nada y se queda en la pregunta actual
            });
        } else {
            // Si hay respuesta, continuar normalmente
            continuarSiguientePregunta();
        }
        
        function continuarSiguientePregunta() {
            // Guardar tiempo de pregunta actual
            if (questionStartTime !== null) {
                const timeSpent = Date.now() - questionStartTime;
                if (!questionTimes.desarrollo) questionTimes.desarrollo = {};
                questionTimes.desarrollo[indiceDesarrollo] = timeSpent;
                saveQuestionTimes();
            }
            
            // Guardar contenido de TinyMCE
            const editor = tinymce.get(`respuesta-${indiceDesarrollo}`);
            const contenido = editor ? editor.getContent() : '';
            guardarRespuestaDesarrollo(indiceDesarrollo, contenido);
            
            // Destruir el editor actual antes de crear el siguiente
            if (editor) {
                tinymce.remove(`#respuesta-${indiceDesarrollo}`);
            }

            if (indiceDesarrollo < preguntasDesarrollo.length - 1) {
                indiceDesarrollo++;
                localStorage.setItem("currentEssayIndex", indiceDesarrollo); // Guarda el nuevo índice
                mostrarPreguntaDesarrollo(indiceDesarrollo);
                cargarPanelLateralDesarrollo(); // Actualiza el panel lateral
            }
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
    cargarPanelLateralDesarrollo(); // Actualiza visualmente los botones
}

function obtenerRespuestaDesarrollo(index) {
    const examData = JSON.parse(localStorage.getItem("examData")) || {};
    const contenido = examData.respuestasDesarrollo?.[index] || "";
    // Escapar el contenido HTML para evitar problemas en el textarea inicial
    return contenido.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function cargarPanelLateralDesarrollo() {
    const panel = document.getElementById("essayProgressList");
    panel.innerHTML = "";
    preguntasDesarrollo.forEach((_, i) => {
        const box = document.createElement("div");
        box.classList.add("progress-box");
        box.textContent = i + 1;

        // Colorea si ya respondió (verificar contenido sin HTML)
        const examData = JSON.parse(localStorage.getItem("examData")) || {};
        const contenido = examData.respuestasDesarrollo?.[i] || "";
        const tieneContenido = contenido.replace(/<[^>]*>/g, '').trim().length > 0;
        
        if (tieneContenido) {
            box.classList.add("answered");
        }

        // Si es la pregunta actual, resaltarla
        if (i === indiceDesarrollo) {
            box.classList.add("active-question");
        }
        
        box.style.cursor = "default";
        panel.appendChild(box);
    });
}
////////////////////////////////////////





















//////////////////////////////////
//ValidarDatosDelEstudiante.js
/////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const nameInput = document.getElementById("studentName");
    const idInput = document.getElementById("studentID");
    const validarBtn = document.getElementById("validarDatosBtn");

    if (!nameInput || !idInput || !validarBtn) return;

    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
    document.getElementById("uniqueSelection").style.display = "none"; // Oculta al cargar

    if (examData.nombre && examData.cedula) {
        nameInput.value = examData.nombre;
        idInput.value = examData.cedula;
        nameInput.disabled = true;
        idInput.disabled = true;
        validarBtn.disabled = true;
        validarBtn.style.display = "none";
        document.getElementById("uniqueSelection").style.display = "block"; // Mostrar si ya estaba guardado

        //Para mostrar u ocultar la parte de desarrollo
        checkIfDevelopmentShouldShow();

        return;
    }

    validarBtn.addEventListener("click", function () {
        const nombre = nameInput.value.trim();
        const cedula = idInput.value.trim();

        if (!validarNombre(nombre)) {
            Swal.fire({
                icon: "error",
                title: "Nombre inválido",
                text: "El nombre debe tener al menos 3 palabras, cada una con mínimo 4 letras.",
            });
            return;
        }

        if (!/^\d{9,}$/.test(cedula)) {
            Swal.fire({
                icon: "error",
                title: "Cédula inválida",
                text: "La cédula debe tener al menos 9 dígitos y máximo 12.",
            });
            return;
        }

        // Guardar en EXAM_STORAGE_KEY
        const estado = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
        estado.nombre = nombre;
        estado.cedula = cedula;
        localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(estado));

        nameInput.disabled = true;
        idInput.disabled = true;
        validarBtn.disabled = true;
        validarBtn.style.display = "none";
        document.getElementById("uniqueSelection").style.display = "block";

        checkIfDevelopmentShouldShow();

        Swal.fire({
            icon: "success",
            title: "Datos validados",
            text: "Nombre y cédula han sido guardados correctamente.",
        });
    });

    function validarNombre(nombre) {
        const partes = nombre.split(/\s+/).filter(Boolean);
        if (partes.length < 3) return false;
        return partes.every(p => p.length >= 3);
    }

    // Definición de la función que controla el mostrar desarrollo
    function checkIfDevelopmentShouldShow() {
        if (localStorage.getItem("parte1Finalizada") === "true") {
            document.getElementById("essay").style.display = "block";
            initDevelopmentPart(); // O la función que uses para iniciar desarrollo
        } else {
            document.getElementById("essay").style.display = "none";
        }
    }

});

// Mostrar los datos guardados en consola (desde EXAM_STORAGE_KEY)
const datos = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
console.log(datos?.nombre);
console.log(datos?.cedula);
//////////////////////////////////////////////////





















//////////////////////////////////
//PreguntasSeleccionUnica.js
/////////////////////////////////
let currentQuestion = 0;
let studentAnswers = [];

const uniqueQuestions = [
    {
        question: "¿Qué es la ciberseguridad? (2 pts)",
        options: [
            "La protección de sistemas y redes contra amenazas digitales",
            "Un tipo de hardware especializado",
            "Una función exclusiva de los antivirus",
            "Un proceso automático sin intervención humana"
        ],
        correct: "La protección de sistemas y redes contra amenazas digitales"
    },
    {
        question: "¿Qué relación existe entre hardware y software? (2 pts)",
        options: [
            "Son independientes y no interactúan",
            "El hardware funciona sin necesidad de software",
            "El software depende del hardware para ejecutarse",
            "Solo las computadoras de escritorio usan software"
        ],
        correct: "El software depende del hardware para ejecutarse"
    },
    {
        question: "¿Cuál de las siguientes opciones NO es un dispositivo de entrada? (2 pts)",
        options: [
            "Teclado",
            "Mouse",
            "Monitor",
            "Escáner"
        ],
        correct: "Monitor"
    },
    // {
    //     question: "¿Qué componente se encarga de ejecutar las instrucciones en una computadora? (2 pts)",
    //     options: [
    //         "Memoria RAM",
    //         "Tarjeta gráfica",
    //         "Unidad central de proceso (CPU)",
    //         "Disco duro"
    //     ],
    //     correct: "Unidad central de proceso (CPU)"
    // },
    // {
    //     question: "¿Cuál es un ejemplo de memoria volátil? (2 pts)",
    //     options: [
    //         "ROM",
    //         "HDD",
    //         "RAM",
    //         "SSD"
    //     ],
    //     correct: "RAM"
    // },
    // {
    //     question: "¿Para qué se utiliza la memoria caché? (2 pts)",
    //     options: [
    //         "Para guardar archivos permanentemente",
    //         "Para aumentar la velocidad de acceso a datos recurrentes",
    //         "Para almacenar copias de seguridad del sistema",
    //         "Para ejecutar gráficos de alta calidad"
    //     ],
    //     correct: "Para aumentar la velocidad de acceso a datos recurrentes"
    // },
    // {
    //     question: "¿Qué diferencia principal existe entre la memoria RAM y la ROM? (2 pts)",
    //     options: [
    //         "La RAM es volátil y la ROM",
    //         "La ROM es más rápida que la RAM",
    //         "Ambas pueden ser modificadas libremente por el usuario",
    //         "La RAM solo se usa en servidores"
    //     ],
    //     correct: "La RAM es volátil y la ROM"
    // },
    // {
    //     question: "¿Qué memoria almacena los datos más utilizados por el procesador para acelerar el acceso? (2 pts)",
    //     options: [
    //         "RAM",
    //         "Caché",
    //         "ROM",
    //         "Flash"
    //     ],
    //     correct: "Caché"
    // },
    // {
    //     question: "¿Qué tipo de memoria se encuentra en las tarjetas gráficas y ayuda al procesamiento de imágenes? (2 pts)",
    //     options: [
    //         "VRAM",
    //         "ROM",
    //         "HDD",
    //         "RAM"
    //     ],
    //     correct: "VRAM"
    // },
    // {
    //     question: "¿Qué es la memoria virtual? (2 pts)",
    //     options: [
    //         "Un espacio en el disco duro utilizado como extensión de la RAM",
    //         "Un tipo de memoria integrada en los procesadores",
    //         "Un software que gestiona la memoria de la PC",
    //         "Un almacenamiento físico externo"
    //     ],
    //     correct: "Un espacio en el disco duro utilizado como extensión de la RAM"
    // },
    // {
    //     question: "¿Cuál es la función principal de la memoria ROM? (2 pts)",
    //     options: [
    //         "Almacenar programas temporalmente",
    //         "Contener las instrucciones básicas para el arranque del sistema",
    //         "Ejecutar videojuegos de alto rendimiento",
    //         "Mejorar el rendimiento del procesador"
    //     ],
    //     correct: "Contener las instrucciones básicas para el arranque del sistema"
    // },
    // {
    //     question: "¿Qué es un disco SSD? (2 pts)",
    //     options: [
    //         "Un disco duro mecánico",
    //         "Un tipo de memoria RAM",
    //         "Un almacenamiento basado en memoria flash",
    //         "Una unidad de almacenamiento óptimo"
    //     ],
    //     correct: "Un almacenamiento basado en memoria flash"
    // },
    // {
    //     question: "¿Cuál es la diferencia entre la memoria RAM DDR3 y DDR5? (2 pts)",
    //     options: [
    //         "la DDR5 es más rápida y eficiente",
    //         "La DDR3 tiene mayor capacidad",
    //         "La DDR5 es solo para servidores",
    //         "No hay diferencias entre ellas"
    //     ],
    //     correct: "la DDR5 es más rápida y eficiente"
    // },
    // {
    //     question: "¿Que significa M.2 en almacenamiento? (2 pts)",
    //     options: [
    //         "Un formato compacto para discos SSD",
    //         "Un tipo de memoria ROM avanzada",
    //         "Una categoría de procesadores",
    //         "Un software de administración de archivos"
    //     ],
    //     correct: "Un formato compacto para discos SSD"
    // },
    // {
    //     question: "¿Qué es una máquina virtual(VM)? (2 pts)",
    //     options: [
    //         "Un software que emula un sistema operativo dentro de otro",
    //         "Un hardware físico adicional para aumentar el rendimiento",
    //         "Un sistema que reemplaza a la memoria RAM",
    //         "Una red de servidores conectados"
    //     ],
    //     correct: "Un software que emula un sistema operativo dentro de otro"
    // },
    // {
    //     question: "¿Cuál es una de las principales ventajas de VirtualBox? (2 pts)",
    //     options: [
    //         "Es gratuito y permite ejecutar múltiples sistemas operativos",
    //         "Solo funciona con Windows",
    //         "No permite tomar instantáneas del sistema",
    //         "Requiere una licencia de pago"
    //     ],
    //     correct: "Es gratuito y permite ejecutar múltiples sistemas operativos"
    // },
    // {
    //     question: "¿Qué tipo de conexión de red permite que una VM se comunique con Internet y con la red local como si fuera otro dispositivo? (2 pts)",
    //     options: [
    //         "NAT",
    //         "Bridge",
    //         "DHCP",
    //         "Loopback"
    //     ],
    //     correct: "Bridge"
    // },
    // {
    //     question: "¿Cuál de los siguientes NO es un comando de Windows PowerShell? (2 pts)",
    //     options: [
    //         "Get-NetAdapter",
    //         "ipconfig",
    //         "mkdir",
    //         "tasklist"
    //     ],
    //     correct: "mkdir"
    // },
    // {
    //     question: "¿Qué atajo de teclado en el sistema operativo Windows abre el Administrador de Tareas directamente? (2 pts)",
    //     options: [
    //         "Ctrl + Alt + Supr",
    //         "Ctrl + Shift + Esc",
    //         "Win + R",
    //         "Alt + F4"
    //     ],
    //     correct: "Ctrl + Shift + Esc"
    // },
    // {
    //     question: "¿Qué comando en Linux se usa para instalar un programa en sistemas basados en Debian? (2 pts)",
    //     options: [
    //         "install package",
    //         "sudo apt install <paquete>",
    //         "run application",
    //         "setup software"
    //     ],
    //     correct: "sudo apt install <paquete>"
    // },
    // {
    //     question: "¿Cuál de los siguientes comandos en Linux se usa para listar archivos en un directorio? (2 pts)",
    //     options: [
    //         "ls",
    //         "dir",
    //         "showfiles",
    //         "list-all"
    //     ],
    //     correct: "ls"
    // },
    // {
    //     question: "¿Qué comando en Linux se usa para cambiar los permisos de un archivo? (2 pts)",
    //     options: [
    //         "chmod",
    //         "ls -l",
    //         "mkdir",
    //         "rm"
    //     ],
    //     correct: "chmod"
    // },
    // {
    //     question: "¿Qué significa CLI? (2 pts)",
    //     options: [
    //         "Command Line Interface",
    //         "Computer Linux Interaction",
    //         "Control Logic Integration",
    //         "Cloud Linux Instance"
    //     ],
    //     correct: "Command Line Interface"
    // },
    // {
    //     question: "¿Cuál de los siguientes comandos en Windows se usa para ver la configuración de red? (2 pts)",
    //     options: [
    //         "netconfig",
    //         "ipconfig",
    //         "list-network",
    //         "configip"
    //     ],
    //     correct: "ipconfig"
    // },
    // {
    //     question: "¿Qué comando en Linux permite ver la dirección IP de la computadora? (2 pts)",
    //     options: [
    //         "ls /ip",
    //         "ip a",
    //         "netstat -an",
    //         "show-ip"
    //     ],
    //     correct: "ip a"
    // },
    // {
    //     question: "¿Qué comando en Linux se usa para monitorear procesos en tiempo real? (2 pts)",
    //     options: [
    //         "top",
    //         "tasklist",
    //         "view-process",
    //         "process-check"
    //     ],
    //     correct: "top"
    // },
    // {
    //     question: "¿Cuál de los siguientes comandos de Windows permite cerrar un proceso específico? (2 pts)",
    //     options: [
    //         "taskkill",
    //         "end-process",
    //         "stop-app",
    //         "shutdown -t 0"
    //     ],
    //     correct: "taskkill"
    // },
];

function loadQuestion(index) {
    // Guardar tiempo de pregunta anterior
    if (questionStartTime !== null && currentQuestion !== index) {
        const timeSpent = Date.now() - questionStartTime;
        if (!questionTimes.seleccionUnica) questionTimes.seleccionUnica = {};
        questionTimes.seleccionUnica[currentQuestion] = timeSpent;
        saveQuestionTimes();
    }
    
    // Iniciar tiempo para nueva pregunta
    questionStartTime = Date.now();
    
    const q = window.uniqueQuestions[index];
    const container = document.getElementById("question-content");

    container.innerHTML = `
        <p style="font-size: 1.1em; font-weight: bold; color: #004080; margin-bottom: 15px;">
            <strong>${index + 1}.</strong> ${q.question}
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${q.options.map(opt => `
                <label style="background: #f5f9ff; border: 1px solid #cce0f5; border-radius: 8px; padding: 8px 12px; cursor: pointer;">
                <input type="radio" name="q${index}" value="${opt}" 
                    onchange="saveAnswer(${index}, this.value)" 
                    ${studentAnswers[index] === opt ? "checked" : ""}
                    style="margin-right: 8px;">
                ${opt}
            </label>
            `).join('')}
        </div>
    `;

    const nextBtn = document.getElementById("nextBtn");

    if (studentAnswers[index]) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = 1;
        nextBtn.style.cursor = "pointer";
    } else {
        nextBtn.disabled = true;
        nextBtn.style.opacity = 0.6;
        nextBtn.style.cursor = "not-allowed";
    }

    updateProgress();
    nextBtn.innerText = (index === window.uniqueQuestions.length - 1) ? "Finalizar Parte 1 del examen Selección Única y Pasar a Desarrollo" : "Siguiente";
}

function guardarDatosEstudiante() {
    const nombre = document.getElementById("studentName").value.trim();
    const cedula = document.getElementById("studentID").value.trim();

    let data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};

    data.nombreEstudiante = nombre;
    data.cedulaEstudiante = cedula;

    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(data));
}

function saveAnswer(index, value) {
    studentAnswers[index] = value;
    localStorage.setItem("studentAnswers", JSON.stringify(studentAnswers));
    localStorage.setItem("currentQuestionIndex", currentQuestion);
    updateProgress();

    let examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};

    const q = window.uniqueQuestions[index];
    if (!examData.respuestasSeleccionUnica) {
        examData.respuestasSeleccionUnica = [];
    }
    examData.respuestasSeleccionUnica[index] = {
        pregunta: q.question,
        respuesta: value
    };

    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(examData));

    const nextBtn = document.getElementById("nextBtn");
    nextBtn.disabled = false;
    nextBtn.style.opacity = 1;
    nextBtn.style.cursor = "pointer";
}

function nextQuestion() {
    // Guardar tiempo de pregunta actual
    if (questionStartTime !== null) {
        const timeSpent = Date.now() - questionStartTime;
        if (!questionTimes.seleccionUnica) questionTimes.seleccionUnica = {};
        questionTimes.seleccionUnica[currentQuestion] = timeSpent;
        saveQuestionTimes();
    }
    
    updateProgress();
    if (currentQuestion < window.uniqueQuestions.length - 1) {
        currentQuestion++;
        localStorage.setItem("currentQuestionIndex", currentQuestion);
        loadQuestion(currentQuestion);
    } else {
        // Mostrar resultados aquí o continuar al paso siguiente
        Swal.fire({
            title: "¡Parte #1 finalizada!",
            text: "Ahora continúa con la parte #2 de desarrollo.",
            icon: "success",
            confirmButtonText: "Continuar"
        }).then(() => {
            localStorage.setItem("parte1Finalizada", "true");  // <-- guardamos la bandera
            document.getElementById("uniqueSelection").style.display = "none"; // Ocultar sección de selección única
            document.getElementById("essay").style.display = "block"; // Mostrar sección de desarrollo
            const savedEssayIndex = localStorage.getItem("currentEssayIndex");
            indiceDesarrollo = savedEssayIndex !== null ? parseInt(savedEssayIndex, 10) : 0;
            mostrarPreguntaDesarrollo(indiceDesarrollo);
            cargarPanelLateralDesarrollo();
        });
        console.log("Respuestas del estudiante:", studentAnswers);
    }
}

function renderProgressBar() {
    const container = document.getElementById("progressList");
    const total = window.uniqueQuestions.length;
    document.getElementById("totalQuestions").textContent = total;
    container.innerHTML = "";

    for (let i = 0; i < total; i++) {
        const box = document.createElement("div");
        box.classList.add("progress-box");
        box.textContent = i + 1;


        // box.style.width = "3em"
        // box.style.padding = "10px";
        // box.style.backgroundColor = "#e6e6e6ff"
        // box.style.borderRadius = "4px";
        // box.style.textAlign = "center";
        // box.style.cursor = "pointer";
        // box.style.marginBottom = "8px";
        // box.style.border = "1px solid #ccc";

        // Colorea si ya respondió
        box.style.background = studentAnswers[i] ? "rgba(248, 194, 26, 1)" : "#f1f1f1";

        // Si es la pregunta actual, resaltarla
        if (i === currentQuestion) {
            box.classList.add("active-question");
            // box.style.backgroundColor = "#d6d092ff"
            // box.style.width = "3.5em"
            // box.style.border = "2px solid #e8e19aff";
        }

        box.style.cursor = "default";
        container.appendChild(box);
    }
}

function updateProgress() {
    renderProgressBar();
}

//Para hacer las preguntas aleatoras
function shuffleArray(inputArray) {
    return inputArray
        .map(q => ({
            ...q,
            options: q.options.sort(() => Math.random() - 0.5) // Opcional: también randomiza las opciones
        }))
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

// Inicialización (puedes llamarla al mostrar esta sección)
// Funciones para manejo de tiempos
function saveQuestionTimes() {
    localStorage.setItem("questionTimes", JSON.stringify(questionTimes));
}

function loadQuestionTimes() {
    const saved = localStorage.getItem("questionTimes");
    if (saved) {
        questionTimes = JSON.parse(saved);
    }
}

function initUniqueSelection() {
    loadQuestionTimes(); // Cargar tiempos guardados
    const saved = localStorage.getItem("uniqueQuestionsRandomizadas");

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                window.uniqueQuestions = parsed;
            } else {
                throw new Error("No es un array");
            }
        } catch (e) {
            const randomized = shuffleArray(uniqueQuestions);
            window.uniqueQuestions = randomized;
            localStorage.setItem("uniqueQuestionsRandomizadas", JSON.stringify(randomized));
        }
    } else {
        const randomized = shuffleArray(uniqueQuestions);
        window.uniqueQuestions = randomized;
        localStorage.setItem("uniqueQuestionsRandomizadas", JSON.stringify(randomized));
    }

    const savedAnswers = localStorage.getItem("studentAnswers");
    if (savedAnswers) {
        studentAnswers = JSON.parse(savedAnswers);
    } else {
        studentAnswers = [];
    }

    const savedIndex = localStorage.getItem("currentQuestionIndex");
    currentQuestion = savedIndex !== null ? parseInt(savedIndex, 10) : 0;

    loadQuestion(currentQuestion);
}

initUniqueSelection();
////////////////////////////////////////////////



















//////////////////////////////////
//CuandoIngresen.js
/////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    // No mostrar el mensaje si el examen ya inició
    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
    if (examData.nombre && examData.cedula && examData.instruccionesAceptadas) {
        return; // Salir sin mostrar el mensaje
    }
    
    Swal.fire({
        title: 'Instrucciones importantes',
        html: `
      <p>Este examen es individual y debe completarse sin ayuda.</p>
      <br>
      <ul style="text-align:left;">
        <li>Por favor lea las intrucciones generales rápidamente</li>
        <li>No recargue la página</li>
        <li>No cambie de pestaña o ventana</li>
        <li>Evite cerrar el navegador</li>
        <li>El código para empezar a realizar el examen es: <strong>${ACCESS_CODE}</strong> </li>
      </ul>
      <br>
      <b>¿Esta de acuerdo?</b>
    `,
        imageUrl: 'images/question.png',
        confirmButtonText: 'Sí estoy de acuerdo',
        confirmButtonColor: '#0a691aff',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#004080',
        showCancelButton: true,
        allowOutsideClick: false,
        customClass: {
            popup: 'swal-wide-low'
        }

    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Usuario aceptó estas instrucciones");
            // Aquí puedes permitir continuar con el examen
        } else if (result.isDismissed) {
            // El usuario presionó cancelar o cerró el cuadro
            //window.location.href = "https://www.google.com"; // o cerrar ventana: window.close();
        }
    });
});
////////////////////////////////////////















//////////////////////////////////
//MenuHamburguesa.js
/////////////////////////////////
var visible_menu = false;
let menu = document.getElementById("nav");
let nav_bar = document.getElementById("nav-bar");
let links = document.querySelectorAll("nav a");

function showHideMenu() {
    if (visible_menu == false) {
        menu.style.display = "block";
        nav_bar.style.display = "block";
        visible_menu = true;
    } else {
        menu.style.display = "none";
        nav_bar.style.display = "fixed";
        visible_menu = false;
    }

    //   Agregar un event listener para cerrar el menú si se hace clic fuera de él
    document.addEventListener("click", function (event) {
        var target = event.target;
        if (!menu.contains(target) && target != nav_bar) {
            menu.style.display = "none";
            nav_bar.style.display = "fixed";
            visible_menu = false;
        }
        for (var x = 0; x < links.length; x++) {
            links[x].onclick = function () {
                menu.style.display = "none";
                visible_menu = false;
            }
        }
    });
}
///////////////////////////////////////////////


















//////////////////////////////////
//ResumenRespuestas.js
/////////////////////////////////
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
///////////////////////////////////////////

















//////////////////////////////////
//GenerarPDF.js
/////////////////////////////////
// Función auxiliar para formatear tiempo
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

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

    //Título de PDF
    doc.setFontSize(16);
    doc.text("Resumen del Examen", 20, y);
    y += 10;

    //Instrucciones aceptadas
    doc.setFontSize(12);
    if (examData.instruccionesAceptadas) {
        doc.text("El estudiante aceptó las instrucciones del examen.", 20, y);
    } else {
        doc.text("El estudiante NO aceptó las instrucciones del examen.", 20, y);
    }
    y += 10;

    // Información del estudiante
    doc.setFontSize(12);
    doc.text(`Nombre del estudiante: ${nombre}`, 20, y);
    y += 10;
    doc.text(`Cédula: ${cedula}`, 20, y);
    y += 10;

    // Agregar fecha y hora actual del examen
    const fechaTexto = document.getElementById("dateDisplay")?.textContent || "Fecha no disponible";
    doc.text(fechaTexto, 20, y);
    y += 10;

    // Agregar tiempo restante del examen
    const tiempoTexto = document.getElementById("timer")?.textContent || "Tiempo no disponible";
    doc.text(tiempoTexto, 20, y);
    y += 10;

    // Obtener tiempos guardados
    const tiemposGuardados = JSON.parse(localStorage.getItem("questionTimes")) || {};
    
    // Selección única
    const datosSeleccion = respuestasSeleccion.map((item, index) => {
        const tiempo = tiemposGuardados.seleccionUnica?.[index] ? formatTime(tiemposGuardados.seleccionUnica[index]) : "N/A";
        return [
            `${index + 1}. ${item.pregunta}`,
            item.respuesta,
            tiempo
        ];
    });

    if (datosSeleccion.length > 0) {
        doc.text("Respuestas de selección única:", 20, y);
        y += 5;
        doc.autoTable({
            startY: y,
            head: [["Pregunta", "Respuesta", "Tiempo"]],
            body: datosSeleccion,
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // Desarrollo
    const datosDesarrollo = Object.entries(respuestasDesarrollo).map(([key, value], index) => {
        const tiempo = tiemposGuardados.desarrollo?.[index] ? formatTime(tiemposGuardados.desarrollo[index]) : "N/A";
        // Convertir HTML a texto plano para el PDF
        const textoPlano = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        return [
            `Pregunta ${index + 1}`,
            textoPlano || 'Sin respuesta',
            tiempo
        ];
    });

    if (datosDesarrollo.length > 0) {
        doc.text("Respuestas de desarrollo:", 20, y);
        y += 5;
        doc.autoTable({
            startY: y,
            head: [["Pregunta", "Respuesta", "Tiempo"]],
            body: datosDesarrollo,
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // Guardar el PDF
    doc.save("resumen_examen.pdf");
});
///////////////////////////////////////////////////