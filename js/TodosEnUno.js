//////////////////////////////////
//VariablesConfigurables.js
/////////////////////////////////
const EXAM_NAME = "Examen de Fundamentos de TI - TCS1003";
document.getElementById("title").textContent = EXAM_NAME;
const ACCESS_CODE = "2"; // 12345 Código que se valida en script.js
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
        localStorage.removeItem("parte2Finalizada");
        localStorage.removeItem("currentEssayIndex");
        localStorage.removeItem("aceptoInstruccionesExamen");
        localStorage.removeItem("practiceData");
        localStorage.removeItem("questionTimes");
        localStorage.removeItem("paginaRecargada"); // Remover el flag de recarga
        localStorage.setItem("codigoCambiado", "true"); // Marcar que el código cambió
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
        delete newExamData.respuestasPractica;
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
    // Detectar si el código cambió y mostrar instrucciones importantes
    if (localStorage.getItem("codigoCambiado") === "true") {
        localStorage.removeItem("codigoCambiado");
        mostrarInstruccionesImportantes();
    }
    // Detectar si hubo recarga y mostrar mensaje
    else if (localStorage.getItem("paginaRecargada") === "true") {
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

// Función para mostrar instrucciones importantes
function mostrarInstruccionesImportantes() {
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
        } else if (result.isDismissed) {
            // El usuario presionó cancelar o cerró el cuadro
            //window.location.href = "https://www.google.com";
        }
    });
}

//Para que no lo vuelva a pedir el código a menos que sea necesario
window.addEventListener("DOMContentLoaded", function () {
    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
    const intentosRestantes = examData.intentosRestantes ?? MAX_ATTEMPTS;

    if (localStorage.getItem("parte2Finalizada") === "true") {
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "none";
        document.getElementById("practice").style.display = "block";
        initPracticePart();
        showPracticeSection(1);
        updatePracticeProgress();
    } else if (localStorage.getItem("parte1Finalizada") === "true") {
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "block";
        document.getElementById("practice").style.display = "none";

        // Recupera el índice guardado o empieza en 0 si no existe
        const savedEssayIndex = localStorage.getItem("currentEssayIndex");
        indiceDesarrollo = savedEssayIndex !== null ? parseInt(savedEssayIndex, 10) : 0;

        mostrarPreguntaDesarrollo(indiceDesarrollo);
        cargarPanelLateralDesarrollo();
    } else {
        document.getElementById("uniqueSelection").style.display = "block";
        document.getElementById("essay").style.display = "none";
        document.getElementById("practice").style.display = "none";
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

        if (localStorage.getItem("parte2Finalizada") === "true") {
            document.getElementById("uniqueSelection").style.display = "none";
            document.getElementById("essay").style.display = "none";
            document.getElementById("practice").style.display = "block";
            initPracticePart();
            showPracticeSection(1);
            updatePracticeProgress();
        } else if (localStorage.getItem("parte1Finalizada") === "true") {
            document.getElementById("uniqueSelection").style.display = "none";
            document.getElementById("essay").style.display = "block";
            document.getElementById("practice").style.display = "none";
            // Solo inicializar preguntas aleatorias si no existen
            const savedQuestions = localStorage.getItem("preguntasDesarrolloSeleccionadas");
            if (!savedQuestions) {
                preguntasDesarrollo = getRandomDevelopmentQuestions();
                localStorage.setItem("preguntasDesarrolloSeleccionadas", JSON.stringify(preguntasDesarrollo));
            } else {
                preguntasDesarrollo = JSON.parse(savedQuestions);
            }
            const savedEssayIndex = localStorage.getItem("currentEssayIndex");
            indiceDesarrollo = savedEssayIndex !== null ? parseInt(savedEssayIndex, 10) : 0;
            mostrarPreguntaDesarrollo(indiceDesarrollo);
            cargarPanelLateralDesarrollo();
        } else {
            document.getElementById("uniqueSelection").style.display = "block";
            document.getElementById("essay").style.display = "none";
            document.getElementById("practice").style.display = "none";
            initUniqueSelection(); //Para que cargue
            renderProgressBar();
        }
    } else {
        // Si no ha validado datos, muestra el acceso
        document.getElementById("access-section").style.display = "block";
        document.getElementById("name-section").style.display = "none";
        document.getElementById("uniqueSelection").style.display = "none";
        document.getElementById("essay").style.display = "none";
        document.getElementById("practice").style.display = "none";
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
                // Ocultar sección de acceso
                document.getElementById("access-section").style.display = "none";

                // Marcar que el examen empezó
                localStorage.setItem("examStarted", "true");

                // Mostrar elementos del examen
                startTimer();
                document.getElementById("nav-bar").style.display = "block";
                document.getElementById("begin-timer").style.display = "block";
                document.getElementById("name-section").style.display = "block";

            } else if (result.isDismissed) {
                // El usuario presionó cancelar o cerró el cuadro
                window.location.href = "https://www.google.com";
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
const preguntasDesarrolloCompletas = [
    "Explica con tus palabras la importancia de la memoria RAM en una computadora.",
    "Describe el funcionamiento de la memoria caché y su impacto en el rendimiento del procesador.",
    "Menciona y explica dos diferencias entre una supercomputadora y una computadora personal.",
    "Explica el concepto de memoria virtual y cómo afecta el rendimiento de una computadora.",
    "Diferencias entre un HDD y un SSD en términos de velocidad, durabilidad y tecnología.",
    "Explica con tus palabras qué es una máquina virtual y cuál es su utilidad.",
    "Explica el propósito del comando chmod en Linux y proporciona un ejemplo.     chmod 755 script.sh",
    "Describe cómo funciona el comando tasklist en Windows y para qué se usa.",
    "¿Cómo se gestiona la memoria en un sistema operativo moderno?",
    "Explica cómo usar ping para diagnosticar problemas de red.     ping 8.8.8.8",
    "¿Que hace el comando 'ipconfig' en CMD de una pc con SO Windows?",
    "Describe el proceso de arranque de un sistema operativo desde el encendido de la computadora hasta que está listo para usarse.",
    "¿Que hace el comando 'tasklist' en CMD de una pc con SO Windows?",
    "¿Que hace el comando df -h en bash de una pc con SO en base Linux?",
    "¿Que hace el comando top en bash de una pc con SO en base Linux?",
    "Explica el concepto de virtualización y cómo se utiliza en la computación moderna."
];

// Función para seleccionar 8 preguntas aleatorias únicas
function getRandomDevelopmentQuestions() {
    // Crear una copia del array original
    const available = [...preguntasDesarrolloCompletas];
    const selected = [];

    // Seleccionar 8 preguntas únicas aleatoriamente
    for (let i = 0; i < 8 && available.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        selected.push(available[randomIndex]);
        available.splice(randomIndex, 1); // Remover la pregunta seleccionada
    }
    return selected;
}

let preguntasDesarrollo = [];

let indiceDesarrollo = 0;

function initDevelopmentPart() {
    loadQuestionTimes(); // Cargar tiempos guardados

    // Verificar si ya hay preguntas seleccionadas guardadas
    const savedQuestions = localStorage.getItem("preguntasDesarrolloSeleccionadas");
    if (savedQuestions) {
        preguntasDesarrollo = JSON.parse(savedQuestions);
    } else {
        preguntasDesarrollo = getRandomDevelopmentQuestions();
        localStorage.setItem("preguntasDesarrolloSeleccionadas", JSON.stringify(preguntasDesarrollo));
    }

    console.log('Preguntas de desarrollo seleccionadas:', preguntasDesarrollo.length, preguntasDesarrollo);

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
        height: 450,
        skin: 'oxide',
        content_css: 'default',
        menubar: isMobile ? false : 'edit view insert format tools table help',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount', 'autosave'
        ],
        toolbar_mode: isMobile ? 'sliding' : 'wrap',
        toolbar: isMobile ?
            'undo redo | bold italic underline | alignleft aligncenter alignright | numlist bullist | fullscreen' :
            'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat | table link | code preview fullscreen | help',
        toolbar_sticky: true,
        autosave_ask_before_unload: false,
        autosave_interval: '30s',
        autosave_prefix: `essay-${index}-`,
        content_style: `
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                font-size: 15px; 
                line-height: 1.7; 
                color: #2c3e50;
                padding: 20px;
                max-width: none;
                background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            }
            
            p { margin-bottom: 14px; }
            
            h1, h2, h3 { 
                color: #004080; 
                margin-top: 20px; 
                margin-bottom: 12px;
                font-weight: 600;
            }
            
            ul, ol { padding-left: 25px; }
            li { margin-bottom: 6px; }
            
            strong { color: #004080; font-weight: 600; }
            em { color: #19A06E; }
            
            blockquote {
                border-left: 4px solid #19A06E;
                background: rgba(25, 160, 110, 0.1);
                padding: 15px 20px;
                margin: 15px 0;
                border-radius: 0 8px 8px 0;
            }
        `,
        branding: false,
        resize: 'both',
        statusbar: true,
        elementpath: !isMobile,
        promotion: false,
        placeholder: 'Desarrolla tu respuesta de manera clara y detallada...',
        setup: function (editor) {
            editor.on('init', function () {
                const container = editor.getContainer();
                container.style.border = '3px solid #004080';
                container.style.borderRadius = '12px';
                container.style.boxShadow = '0 8px 25px rgba(0, 64, 128, 0.2)';
                container.style.transition = 'all 0.3s ease';
            });

            editor.on('change keyup', function () {
                const content = editor.getContent();
                guardarRespuestaDesarrollo(index, content);
            });

            editor.on('focus', function () {
                const container = editor.getContainer();
                container.style.borderColor = '#19A06E';
                container.style.boxShadow = '0 12px 30px rgba(25, 160, 110, 0.3)';
                container.style.transform = 'translateY(-2px)';
            });

            editor.on('blur', function () {
                const container = editor.getContainer();
                container.style.borderColor = '#004080';
                container.style.boxShadow = '0 8px 25px rgba(0, 64, 128, 0.2)';
                container.style.transform = 'translateY(0)';
            });
        }
    });

    document.getElementById("btnSiguienteDesarrollo").addEventListener("click", () => {
        // Obtener contenido de TinyMCE
        const editor = tinymce.get(`respuesta-${indiceDesarrollo}`);
        const respuestaActual = editor ? editor.getContent({ format: 'text' }).trim() : '';

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
        document.getElementById("btnSiguienteDesarrollo").style.display = "none";
        document.getElementById("btnFinalizarDesarrollo").style.display = "inline-block";
        document.getElementById("btnFinalizarDesarrollo").addEventListener("click", finalizarDesarrollo);
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
    {
        question: "¿Qué componente se encarga de ejecutar las instrucciones en una computadora? (2 pts)",
        options: [
            "Memoria RAM",
            "Tarjeta gráfica",
            "Unidad central de proceso (CPU)",
            "Disco duro"
        ],
        correct: "Unidad central de proceso (CPU)"
    },
    {
        question: "¿Cuál es un ejemplo de memoria volátil? (2 pts)",
        options: [
            "ROM",
            "HDD",
            "RAM",
            "SSD"
        ],
        correct: "RAM"
    },
    {
        question: "¿Para qué se utiliza la memoria caché? (2 pts)",
        options: [
            "Para guardar archivos permanentemente",
            "Para aumentar la velocidad de acceso a datos recurrentes",
            "Para almacenar copias de seguridad del sistema",
            "Para ejecutar gráficos de alta calidad"
        ],
        correct: "Para aumentar la velocidad de acceso a datos recurrentes"
    },
    {
        question: "¿Qué diferencia principal existe entre la memoria RAM y la ROM? (2 pts)",
        options: [
            "La RAM es volátil y la ROM",
            "La ROM es más rápida que la RAM",
            "Ambas pueden ser modificadas libremente por el usuario",
            "La RAM solo se usa en servidores"
        ],
        correct: "La RAM es volátil y la ROM"
    },
    {
        question: "¿Qué memoria almacena los datos más utilizados por el procesador para acelerar el acceso? (2 pts)",
        options: [
            "RAM",
            "Caché",
            "ROM",
            "Flash"
        ],
        correct: "Caché"
    },
    {
        question: "¿Qué tipo de memoria se encuentra en las tarjetas gráficas y ayuda al procesamiento de imágenes? (2 pts)",
        options: [
            "VRAM",
            "ROM",
            "HDD",
            "RAM"
        ],
        correct: "VRAM"
    },
    {
        question: "¿Qué es la memoria virtual? (2 pts)",
        options: [
            "Un espacio en el disco duro utilizado como extensión de la RAM",
            "Un tipo de memoria integrada en los procesadores",
            "Un software que gestiona la memoria de la PC",
            "Un almacenamiento físico externo"
        ],
        correct: "Un espacio en el disco duro utilizado como extensión de la RAM"
    },
    {
        question: "¿Cuál es la función principal de la memoria ROM? (2 pts)",
        options: [
            "Almacenar programas temporalmente",
            "Contener las instrucciones básicas para el arranque del sistema",
            "Ejecutar videojuegos de alto rendimiento",
            "Mejorar el rendimiento del procesador"
        ],
        correct: "Contener las instrucciones básicas para el arranque del sistema"
    },
    {
        question: "¿Qué es un disco SSD? (2 pts)",
        options: [
            "Un disco duro mecánico",
            "Un tipo de memoria RAM",
            "Un almacenamiento basado en memoria flash",
            "Una unidad de almacenamiento óptimo"
        ],
        correct: "Un almacenamiento basado en memoria flash"
    },
    {
        question: "¿Cuál es la diferencia entre la memoria RAM DDR3 y DDR5? (2 pts)",
        options: [
            "la DDR5 es más rápida y eficiente",
            "La DDR3 tiene mayor capacidad",
            "La DDR5 es solo para servidores",
            "No hay diferencias entre ellas"
        ],
        correct: "la DDR5 es más rápida y eficiente"
    },
    {
        question: "¿Que significa M.2 en almacenamiento? (2 pts)",
        options: [
            "Un formato compacto para discos SSD",
            "Un tipo de memoria ROM avanzada",
            "Una categoría de procesadores",
            "Un software de administración de archivos"
        ],
        correct: "Un formato compacto para discos SSD"
    },
    {
        question: "¿Qué es una máquina virtual(VM)? (2 pts)",
        options: [
            "Un software que emula un sistema operativo dentro de otro",
            "Un hardware físico adicional para aumentar el rendimiento",
            "Un sistema que reemplaza a la memoria RAM",
            "Una red de servidores conectados"
        ],
        correct: "Un software que emula un sistema operativo dentro de otro"
    },
    {
        question: "¿Cuál es una de las principales ventajas de VirtualBox? (2 pts)",
        options: [
            "Es gratuito y permite ejecutar múltiples sistemas operativos",
            "Solo funciona con Windows",
            "No permite tomar instantáneas del sistema",
            "Requiere una licencia de pago"
        ],
        correct: "Es gratuito y permite ejecutar múltiples sistemas operativos"
    },
    {
        question: "¿Qué tipo de conexión de red permite que una VM se comunique con Internet y con la red local como si fuera otro dispositivo? (2 pts)",
        options: [
            "NAT",
            "Bridge",
            "DHCP",
            "Loopback"
        ],
        correct: "Bridge"
    },
    {
        question: "¿Cuál de los siguientes NO es un comando de Windows PowerShell? (2 pts)",
        options: [
            "Get-NetAdapter",
            "ipconfig",
            "mkdir",
            "tasklist"
        ],
        correct: "mkdir"
    },
    {
        question: "¿Qué atajo de teclado en el sistema operativo Windows abre el Administrador de Tareas directamente? (2 pts)",
        options: [
            "Ctrl + Alt + Supr",
            "Ctrl + Shift + Esc",
            "Win + R",
            "Alt + F4"
        ],
        correct: "Ctrl + Shift + Esc"
    },
    {
        question: "¿Qué comando en Linux se usa para instalar un programa en sistemas basados en Debian? (2 pts)",
        options: [
            "install package",
            "sudo apt install <paquete>",
            "run application",
            "setup software"
        ],
        correct: "sudo apt install <paquete>"
    },
    {
        question: "¿Cuál de los siguientes comandos en Linux se usa para listar archivos en un directorio? (2 pts)",
        options: [
            "ls",
            "dir",
            "showfiles",
            "list-all"
        ],
        correct: "ls"
    },
    {
        question: "¿Qué comando en Linux se usa para cambiar los permisos de un archivo? (2 pts)",
        options: [
            "chmod",
            "ls -l",
            "mkdir",
            "rm"
        ],
        correct: "chmod"
    },
    {
        question: "¿Qué significa CLI? (2 pts)",
        options: [
            "Command Line Interface",
            "Computer Linux Interaction",
            "Control Logic Integration",
            "Cloud Linux Instance"
        ],
        correct: "Command Line Interface"
    },
    {
        question: "¿Cuál de los siguientes comandos en Windows se usa para ver la configuración de red? (2 pts)",
        options: [
            "netconfig",
            "ipconfig",
            "list-network",
            "configip"
        ],
        correct: "ipconfig"
    },
    {
        question: "¿Qué comando en Linux permite ver la dirección IP de la computadora? (2 pts)",
        options: [
            "ls /ip",
            "ip a",
            "netstat -an",
            "show-ip"
        ],
        correct: "ip a"
    },
    {
        question: "¿Qué comando en Linux se usa para monitorear procesos en tiempo real? (2 pts)",
        options: [
            "top",
            "tasklist",
            "view-process",
            "process-check"
        ],
        correct: "top"
    },
    {
        question: "¿Cuál de los siguientes comandos de Windows permite cerrar un proceso específico? (2 pts)",
        options: [
            "taskkill",
            "end-process",
            "stop-app",
            "shutdown -t 0"
        ],
        correct: "taskkill"
    },
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
            // Solo inicializar preguntas aleatorias si no existen
            const savedQuestions = localStorage.getItem("preguntasDesarrolloSeleccionadas");
            if (!savedQuestions) {
                preguntasDesarrollo = getRandomDevelopmentQuestions();
                localStorage.setItem("preguntasDesarrolloSeleccionadas", JSON.stringify(preguntasDesarrollo));
            } else {
                preguntasDesarrollo = JSON.parse(savedQuestions);
            }
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
    const respuestasPractica = examData.respuestasPractica || {};

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

    // Práctica
    if (Object.keys(respuestasPractica).length > 0) {
        doc.text("Respuestas de práctica:", 20, y);
        y += 5;

        const datosPractica = [];

        // Pareo
        if (respuestasPractica.pareoMatches && respuestasPractica.pareoData) {
            Object.entries(respuestasPractica.pareoMatches).forEach(([palabraIndex, defIndex]) => {
                const palabra = respuestasPractica.pareoData.palabras[palabraIndex] || "Palabra no encontrada";
                const definicion = respuestasPractica.pareoData.definiciones[defIndex] || "Definición no encontrada";
                datosPractica.push(["Pareo", `${palabra} - ${definicion}`, "Completado"]);
            });
        }

        // Crucigrama
        if (respuestasPractica.crucigramaAnswers) {
            const respuestasCrucigrama = Object.keys(respuestasPractica.crucigramaAnswers).length;
            datosPractica.push(["Crucigrama", `${respuestasCrucigrama} casillas completadas`, "Parcial"]);
        }

        // Sopa de letras
        if (respuestasPractica.sopaFoundWords) {
            const palabrasEncontradas = respuestasPractica.sopaFoundWords.join(", ");
            datosPractica.push(["Sopa de letras", palabrasEncontradas || "Ninguna palabra encontrada", "Completado"]);
        }

        if (datosPractica.length > 0) {
            doc.autoTable({
                startY: y,
                head: [["Actividad", "Respuesta", "Estado"]],
                body: datosPractica,
            });
        }
    }

    // Guardar el PDF
    doc.save("resumen_examen.pdf");
});
///////////////////////////////////////////////////

//////////////////////////////////
//TerceraParte.js
/////////////////////////////////
// Variables globales para la tercera parte
let currentPracticeSection = 1;
let pareoMatches = {};
let crucigramaAnswers = {};
let sopaFoundWords = [];
let currentCrucigramaWord = null; // Para mantener la dirección de escritura

// Datos para el pareo - Términos del examen
const pareoDataComplete = {
    items: [
        { palabra: "CPU", definicion: "Unidad central de procesamiento que ejecuta instrucciones" },
        { palabra: "RAM", definicion: "Memoria volátil de acceso aleatorio" },
        { palabra: "SSD", definicion: "Disco de estado sólido basado en memoria flash" },
        { palabra: "GPU", definicion: "Unidad de procesamiento gráfico para imágenes" },
        { palabra: "ROM", definicion: "Memoria no volátil con instrucciones de arranque" },
        { palabra: "CACHE", definicion: "Memoria que acelera el acceso a datos recurrentes" },
        { palabra: "VRAM", definicion: "Memoria de video en tarjetas gráficas" },
        { palabra: "HDD", definicion: "Disco duro mecánico tradicional" },
        { palabra: "BIOS", definicion: "Sistema básico de entrada y salida" },
        { palabra: "USB", definicion: "Puerto universal en serie para dispositivos" },
        { palabra: "WIFI", definicion: "Tecnología de red inalámbrica" },
        { palabra: "FIREWALL", definicion: "Sistema de protección contra amenazas de red" },
        { palabra: "MALWARE", definicion: "Software malicioso que daña sistemas" },
        { palabra: "BACKUP", definicion: "Copia de seguridad de datos importantes" },
        { palabra: "DRIVER", definicion: "Software que controla dispositivos de hardware" }
    ]
};

// Función para seleccionar elementos aleatorios del pareo
function getRandomPareoData() {
    const shuffled = [...pareoDataComplete.items].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8); // Seleccionar 8 elementos

    return {
        palabras: selected.map(item => item.palabra),
        definiciones: selected.map(item => item.definicion).sort(() => Math.random() - 0.5) // Mezclar definiciones
    };
}

let pareoData = getRandomPareoData();

// Datos para el crucigrama - Diseño 18x18 con intersecciones reales
const crucigramaData = {
    words: [
        // Horizontales
        { word: "SPYWARE", clue: "Recopila información del usuario sin su consentimiento.", row: 1, col: 4, direction: "horizontal" },
        { word: "PHISHING", clue: "Robo de información confidencial: Contraseñas, datos bancarios, documentos personales.", row: 4, col: 6, direction: "horizontal" },
        { word: "VIRUS", clue: "Se adjunta a archivos y se propaga cuando se ejecuta.", row: 8, col: 1, direction: "horizontal" },
        { word: "MALWARE", clue: "Cualquier software diseñado para dañar, explotar o interrumpir dispositivos, redes o sistemas informáticos.", row: 10, col: 3, direction: "horizontal" },
        { word: "SISTEMA", clue: "Conjunto organizado de elementos que funcionan juntos para procesar, almacenar y transmitir información(Es lo que ataca cualquier virus).", row: 13, col: 7, direction: "horizontal" },
        // Verticales
        { word: "GUSANOS", clue: "Se replican automáticamente a través de redes sin necesidad de acción del usuario.", row: 7, col: 4, direction: "vertical" },
        { word: "TROYANOS", clue: "Se disfrazan de software legítimo para engañar a los usuarios y dar acceso a atacantes.", row: 6, col: 7, direction: "vertical" },
        { word: "RANSOMWARE", clue: "Secuestra datos o sistemas, los bloquea y exige un rescate para liberarlos y restaurar el acceso.", row: 1, col: 9, direction: "vertical" },
        { word: "ADWARE", clue: "Muestra anuncios no deseados y recopila datos de navegación, para el marketing malicioso.", row: 8, col: 11, direction: "vertical" },
        { word: "SEGURIDAD", clue: "Conjunto de medidas y técnicas para proteger sistemas, redes y datos de amenazas digitales.", row: 2, col: 13, direction: "vertical" },        
    ],
    gridSize: 15
};

// Palabras para la sopa de letras - Términos del examen
const sopaWordsComplete = [
    "CPU", "RAM", "SSD", "GPU", "USB", "ROM", "HDD", "WIFI", "BIOS", "CACHE",
    "VIRUS", "BACKUP", "DRIVER", "KERNEL", "FIREWALL", "MALWARE", "HARDWARE",
    "SOFTWARE", "MEMORIA", "SISTEMA", "DATOS", "RED", "SERVIDOR", "CLIENTE"
];

// Función para generar sopa de letras aleatoria
function generateSopaLetras() {
    const gridSize = 16;
    const selectedWords = [...sopaWordsComplete].sort(() => Math.random() - 0.5).slice(0, 12);
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    const placedWords = [];

    // Colocar palabras aleatoriamente
    selectedWords.forEach(word => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);

            if (canPlaceWord(grid, word, row, col, direction, gridSize)) {
                placeWord(grid, word, row, col, direction);
                placedWords.push({ word, row, col, direction });
                placed = true;
            }
            attempts++;
        }
    });

    // Llenar espacios vacíos con letras aleatorias
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }

    return {
        grid,
        words: placedWords.map(p => p.word),
        wordPositions: placedWords
    };
}

function canPlaceWord(grid, word, row, col, direction, gridSize) {
    if (direction === 'horizontal') {
        if (col + word.length > gridSize) return false;
        for (let i = 0; i < word.length; i++) {
            if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) {
                return false;
            }
        }
    } else {
        if (row + word.length > gridSize) return false;
        for (let i = 0; i < word.length; i++) {
            if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) {
                return false;
            }
        }
    }
    return true;
}

function placeWord(grid, word, row, col, direction) {
    if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
        }
    }
}

let sopaData = generateSopaLetras();

// Función para inicializar la tercera parte
function initPracticePart() {
    // Regenerar datos aleatorios si no existen
    const savedData = JSON.parse(localStorage.getItem("practiceData")) || {};

    if (!savedData.pareoGenerated) {
        pareoData = getRandomPareoData();
        savedData.pareoData = pareoData;
        savedData.pareoGenerated = true;
    } else {
        pareoData = savedData.pareoData;
    }

    if (!savedData.sopaGenerated) {
        sopaData = generateSopaLetras();
        savedData.sopaData = sopaData;
        savedData.sopaGenerated = true;
    } else {
        sopaData = savedData.sopaData;
    }

    pareoMatches = savedData.pareoMatches || {};
    crucigramaAnswers = savedData.crucigramaAnswers || {};
    sopaFoundWords = savedData.sopaFoundWords || [];
    currentPracticeSection = savedData.currentSection || 1;

    // Guardar datos actualizados
    localStorage.setItem("practiceData", JSON.stringify(savedData));
}

// Función para mostrar la sección de práctica actual
function showPracticeSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.practice-section').forEach(s => s.style.display = 'none');

    currentPracticeSection = section;

    switch (section) {
        case 1:
            document.getElementById('pareo-section').style.display = 'block';
            initPareo();
            break;
        case 2:
            document.getElementById('crucigrama-section').style.display = 'block';
            initCrucigrama();
            break;
        case 3:
            document.getElementById('sopa-section').style.display = 'block';
            initSopaLetras();
            break;
    }

    updatePracticeProgress();
    savePracticeData();
}

// Función para actualizar el progreso visual
function updatePracticeProgress() {
    document.querySelectorAll('.practice-box').forEach((box, index) => {
        box.classList.remove('active', 'completed');

        if (index + 1 === currentPracticeSection) {
            box.classList.add('active');
        } else if (index + 1 < currentPracticeSection) {
            box.classList.add('completed');
        }
    });
}

// Inicializar pareo
function initPareo() {
    const container = document.getElementById('pareo-container');
    container.innerHTML = `
        <div class="pareo-column">
            <h4>Palabras</h4>
            ${pareoData.palabras.map((palabra, index) =>
        `<div class="pareo-item" data-type="palabra" data-index="${index}" onclick="selectPareoItem(this)">${palabra}</div>`
    ).join('')}
        </div>
        <div class="pareo-column">
            <h4>Definiciones</h4>
            ${pareoData.definiciones.map((def, index) =>
        `<div class="pareo-item" data-type="definicion" data-index="${index}" onclick="selectPareoItem(this)">${def}</div>`
    ).join('')}
        </div>
    `;

    // Restaurar matches guardados
    Object.entries(pareoMatches).forEach(([palabraIndex, defIndex]) => {
        const palabraEl = container.querySelector(`[data-type="palabra"][data-index="${palabraIndex}"]`);
        const defEl = container.querySelector(`[data-type="definicion"][data-index="${defIndex}"]`);
        if (palabraEl && defEl) {
            palabraEl.classList.add('matched');
            defEl.classList.add('matched');
        }
    });
}

let selectedPareoItem = null;

function selectPareoItem(element) {
    // Si el elemento ya está emparejado, permitir deshacerlo
    if (element.classList.contains('matched')) {
        const elementIndex = element.dataset.index;
        const elementType = element.dataset.type;
        
        // Encontrar y deshacer el emparejamiento
        if (elementType === 'palabra') {
            const defIndex = pareoMatches[elementIndex];
            if (defIndex !== undefined) {
                const defElement = document.querySelector(`[data-type="definicion"][data-index="${defIndex}"]`);
                if (defElement) defElement.classList.remove('matched');
                delete pareoMatches[elementIndex];
            }
        } else {
            // Buscar la palabra que está emparejada con esta definición
            const palabraIndex = Object.keys(pareoMatches).find(key => pareoMatches[key] == elementIndex);
            if (palabraIndex !== undefined) {
                const palabraElement = document.querySelector(`[data-type="palabra"][data-index="${palabraIndex}"]`);
                if (palabraElement) palabraElement.classList.remove('matched');
                delete pareoMatches[palabraIndex];
            }
        }
        
        element.classList.remove('matched');
        savePracticeData();
        return;
    }

    if (selectedPareoItem) {
        selectedPareoItem.classList.remove('selected');

        if (selectedPareoItem.dataset.type !== element.dataset.type) {
            // Hacer match
            const palabraIndex = selectedPareoItem.dataset.type === 'palabra' ?
                selectedPareoItem.dataset.index : element.dataset.index;
            const defIndex = selectedPareoItem.dataset.type === 'definicion' ?
                selectedPareoItem.dataset.index : element.dataset.index;

            pareoMatches[palabraIndex] = defIndex;
            selectedPareoItem.classList.add('matched');
            element.classList.add('matched');
            savePracticeData();
        }
        selectedPareoItem = null;
    } else {
        selectedPareoItem = element;
        element.classList.add('selected');
    }
}

// Inicializar crucigrama
function initCrucigrama() {
    const container = document.getElementById('crucigrama-container');
    const gridSize = crucigramaData.gridSize;

    // Crear grid vacío
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(false));

    // Marcar celdas que deben ser blancas
    crucigramaData.words.forEach(wordData => {
        for (let i = 0; i < wordData.word.length; i++) {
            if (wordData.direction === 'horizontal') {
                grid[wordData.row][wordData.col + i] = true;
            } else {
                grid[wordData.row + i][wordData.col] = true;
            }
        }
    });

    // Generar HTML del grid
    let gridHTML = '';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `cell-${row}-${col}`;
            if (grid[row][col]) {
                // Verificar si es el inicio de una palabra
                const wordNumber = getWordNumber(row, col);
                const numberLabel = wordNumber ? `<span class="word-number">${wordNumber}</span>` : '';

                gridHTML += `<div class="crucigrama-cell white">
                    ${numberLabel}
                    <input type="text" maxlength="1" id="${cellId}" onchange="saveCrucigramaAnswer('${cellId}', this.value)" oninput="handleCrucigramaInput(this, ${row}, ${col})" onkeydown="handleCrucigramaKeydown(event, ${row}, ${col})" onfocus="setCrucigramaWord(${row}, ${col})">
                </div>`;
            } else {
                gridHTML += `<div class="crucigrama-cell black"></div>`;
            }
        }
    }

    // Generar pistas
    const cluesHTML = `
        <div class="crucigrama-clues">
            <div class="clues-column">
                <h4>Horizontales</h4>
                ${crucigramaData.words.filter(w => w.direction === 'horizontal')
            .map((w, i) => `<p><strong>${i + 1}.</strong> ${w.clue}</p>`).join('')}
            </div>
            <div class="clues-column">
                <h4>Verticales</h4>
                ${crucigramaData.words.filter(w => w.direction === 'vertical')
            .map((w, i) => `<p><strong>${i + 1}.</strong> ${w.clue}</p>`).join('')}
            </div>
        </div>
    `;

    container.innerHTML = `<div class="crucigrama-grid">${gridHTML}</div>` + cluesHTML;

    // Restaurar respuestas guardadas
    Object.entries(crucigramaAnswers).forEach(([cellId, value]) => {
        const input = document.getElementById(cellId);
        if (input) input.value = value;
    });
}

function getWordNumber(row, col) {
    // Separar palabras horizontales y verticales
    const horizontales = crucigramaData.words.filter(w => w.direction === 'horizontal');
    const verticales = crucigramaData.words.filter(w => w.direction === 'vertical');

    // Buscar en horizontales (numeración 1, 2, 3)
    for (let i = 0; i < horizontales.length; i++) {
        if (horizontales[i].row === row && horizontales[i].col === col) {
            return i + 1;
        }
    }

    // Buscar en verticales (numeración 1, 2, 3)
    for (let i = 0; i < verticales.length; i++) {
        if (verticales[i].row === row && verticales[i].col === col) {
            return i + 1;
        }
    }

    return null;
}

function saveCrucigramaAnswer(cellId, value) {
    crucigramaAnswers[cellId] = value.toUpperCase();
    savePracticeData();
}

// Función para manejar entrada de texto (solo una letra)
function handleCrucigramaInput(input, row, col) {
    let value = input.value;

    // Solo permitir letras, eliminar espacios y caracteres especiales
    value = value.replace(/[^A-Za-z]/g, '');

    // Solo tomar la primera letra si hay más de una
    if (value.length > 1) {
        value = value.charAt(0);
    }

    // Convertir a mayúscula
    value = value.toUpperCase();

    // Actualizar el input
    input.value = value;

    // Guardar la respuesta
    saveCrucigramaAnswer(input.id, value);

    // Si se escribió una letra, avanzar automáticamente
    if (value) {
        setTimeout(() => {
            moveToNextCell(row, col, value);
        }, 10);
    }
}

// Función para establecer la palabra actual cuando se hace foco
function setCrucigramaWord(row, col) {
    // Si no hay palabra actual, establecer la primera que encuentre
    if (!currentCrucigramaWord) {
        currentCrucigramaWord = findWordAtPosition(row, col);
    }
    // Si la posición actual no pertenece a la palabra actual, cambiar
    else if (!isPositionInWord(row, col, currentCrucigramaWord)) {
        currentCrucigramaWord = findWordAtPosition(row, col);
    }
}

// Función para manejar navegación con teclado en el crucigrama
function handleCrucigramaKeydown(event, row, col) {
    const key = event.key;

    // Bloquear espacios y caracteres especiales
    if (key === ' ' || key.match(/[^a-zA-Z\b\t\r\n]/)) {
        event.preventDefault();
        return;
    }

    // Si es una letra, el manejo se hace en handleCrucigramaInput
    if (key.match(/[a-zA-Z]/)) {
        return;
    }

    // Navegación con flechas
    let newRow = row;
    let newCol = col;

    switch (key) {
        case 'ArrowUp':
            newRow = row - 1;
            break;
        case 'ArrowDown':
            newRow = row + 1;
            break;
        case 'ArrowLeft':
            newCol = col - 1;
            break;
        case 'ArrowRight':
            newCol = col + 1;
            break;
        case 'Backspace':
            // Si la celda actual está vacía, ir a la anterior
            if (!event.target.value) {
                moveToPreviousCell(row, col);
            }
            return;
        default:
            return;
    }

    // Buscar la siguiente celda válida
    const nextCell = document.getElementById(`cell-${newRow}-${newCol}`);
    if (nextCell && nextCell.tagName === 'INPUT') {
        event.preventDefault();
        nextCell.focus();
    }
}

// Función para moverse a la siguiente celda automáticamente
function moveToNextCell(row, col, value) {
    if (!value || !currentCrucigramaWord) return;

    let nextRow = row;
    let nextCol = col;

    if (currentCrucigramaWord.direction === 'horizontal') {
        nextCol = col + 1;
    } else {
        nextRow = row + 1;
    }

    // Verificar si la siguiente celda está dentro de la palabra actual
    if (isPositionInWord(nextRow, nextCol, currentCrucigramaWord)) {
        const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
        if (nextCell && nextCell.tagName === 'INPUT') {
            nextCell.focus();
        }
    } else {
        // Si llegamos al final de la palabra, limpiar la palabra actual
        currentCrucigramaWord = null;
    }
}

// Función para moverse a la celda anterior
function moveToPreviousCell(row, col) {
    if (!currentCrucigramaWord) return;

    let prevRow = row;
    let prevCol = col;

    if (currentCrucigramaWord.direction === 'horizontal') {
        prevCol = col - 1;
    } else {
        prevRow = row - 1;
    }

    if (isPositionInWord(prevRow, prevCol, currentCrucigramaWord)) {
        const prevCell = document.getElementById(`cell-${prevRow}-${prevCol}`);
        if (prevCell && prevCell.tagName === 'INPUT') {
            prevCell.focus();
            prevCell.value = '';
            saveCrucigramaAnswer(`cell-${prevRow}-${prevCol}`, '');
        }
    }
}

// Función para encontrar la palabra en una posición (prioriza la palabra actual si existe)
function findWordAtPosition(row, col) {
    const wordsAtPosition = crucigramaData.words.filter(word => isPositionInWord(row, col, word));

    // Si hay múltiples palabras en esta posición (intersección)
    if (wordsAtPosition.length > 1) {
        // Si ya tenemos una palabra actual y está en esta posición, mantenerla
        if (currentCrucigramaWord && wordsAtPosition.includes(currentCrucigramaWord)) {
            return currentCrucigramaWord;
        }
        // Si no, devolver la primera
        return wordsAtPosition[0];
    }

    return wordsAtPosition[0] || null;
}

// Función para verificar si una posición está dentro de una palabra
function isPositionInWord(row, col, word) {
    if (word.direction === 'horizontal') {
        return row === word.row && col >= word.col && col < word.col + word.word.length;
    } else {
        return col === word.col && row >= word.row && row < word.row + word.word.length;
    }
}

// Inicializar sopa de letras
function initSopaLetras() {
    const container = document.getElementById('sopa-container');
    const gridSize = sopaData.grid.length;
    let grid = '';

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellId = `sopa-${row}-${col}`;
            grid += `<div class="sopa-cell" id="${cellId}" onclick="selectSopaCell(${row}, ${col})">${sopaData.grid[row][col]}</div>`;
        }
    }

    container.innerHTML = grid;

    // Mostrar palabras a encontrar
    const listaPalabras = document.getElementById('lista-palabras');
    listaPalabras.innerHTML = sopaData.words.map(word =>
        `<span class="palabra-item ${sopaFoundWords.includes(word) ? 'encontrada' : ''}">${word}</span>`
    ).join('');
}

let sopaSelection = [];

function selectSopaCell(row, col) {
    const cellId = `sopa-${row}-${col}`;
    const cell = document.getElementById(cellId);

    if (sopaSelection.length === 0) {
        sopaSelection.push({ row, col });
        cell.classList.add('selected');
    } else if (sopaSelection.length === 1) {
        sopaSelection.push({ row, col });
        checkSopaWord();
    }
}

function checkSopaWord() {
    const [start, end] = sopaSelection;
    let word = '';
    let wordReverse = '';

    // Construir la palabra seleccionada
    if (start.row === end.row) {
        // Horizontal
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        for (let col = minCol; col <= maxCol; col++) {
            word += sopaData.grid[start.row][col];
        }
        wordReverse = word.split('').reverse().join('');
    } else if (start.col === end.col) {
        // Vertical
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        for (let row = minRow; row <= maxRow; row++) {
            word += sopaData.grid[row][start.col];
        }
        wordReverse = word.split('').reverse().join('');
    } else {
        // Diagonal
        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        const rowStep = rowDiff / steps;
        const colStep = colDiff / steps;

        for (let i = 0; i <= steps; i++) {
            const row = start.row + Math.round(i * rowStep);
            const col = start.col + Math.round(i * colStep);
            word += sopaData.grid[row][col];
        }
        wordReverse = word.split('').reverse().join('');
    }

    // Verificar si la palabra (o su reverso) está en la lista
    const foundWord = sopaData.words.find(w => w === word || w === wordReverse);
    if (foundWord && !sopaFoundWords.includes(foundWord)) {
        sopaFoundWords.push(foundWord);
        markSopaWordFound();
        updateSopaWordsList();
        savePracticeData();

        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Palabra encontrada!',
            text: `Has encontrado: ${foundWord}`,
            timer: 1500,
            showConfirmButton: false
        });
    }

    // Limpiar selección
    document.querySelectorAll('.sopa-cell.selected').forEach(cell => {
        if (!cell.classList.contains('found')) {
            cell.classList.remove('selected');
        }
    });
    sopaSelection = [];
}

function markSopaWordFound() {
    const [start, end] = sopaSelection;

    if (start.row === end.row) {
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        for (let col = minCol; col <= maxCol; col++) {
            document.getElementById(`sopa-${start.row}-${col}`).classList.add('found');
        }
    } else if (start.col === end.col) {
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        for (let row = minRow; row <= maxRow; row++) {
            document.getElementById(`sopa-${row}-${start.col}`).classList.add('found');
        }
    }
}

function updateSopaWordsList() {
    const listaPalabras = document.getElementById('lista-palabras');
    listaPalabras.innerHTML = sopaData.words.map(word =>
        `<span class="palabra-item ${sopaFoundWords.includes(word) ? 'encontrada' : ''}">${word}</span>`
    ).join('');
}

// Función para avanzar a la siguiente sección
function nextPracticeSection() {
    if (currentPracticeSection < 3) {
        Swal.fire({
            title: '¿Continuar a la siguiente actividad?',
            text: 'Estás a punto de pasar a la siguiente actividad práctica.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#004080',
            cancelButtonColor: '#d33',
            customClass: {
                popup: 'swal-wide-low'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                showPracticeSection(currentPracticeSection + 1);
            }
        });
    }
}

// Función para finalizar la práctica
function finalizarPractica() {
    Swal.fire({
        title: '¡Práctica finalizada!',
        text: 'Has completado todas las actividades prácticas.',
        icon: 'success',
        confirmButtonText: 'Generar PDF final'
    }).then(() => {
        // Aquí se puede generar el PDF final o mostrar resumen
        document.getElementById("practice").style.display = "none";
        document.getElementById("upload").style.display = "block";
    });
}

// Función para guardar datos de práctica
function savePracticeData() {
    const practiceData = {
        currentSection: currentPracticeSection,
        pareoMatches,
        crucigramaAnswers,
        sopaFoundWords,
        pareoData,
        sopaData,
        pareoGenerated: true,
        sopaGenerated: true
    };
    localStorage.setItem("practiceData", JSON.stringify(practiceData));

    // También guardar en examData para el PDF
    let examData = JSON.parse(localStorage.getItem("examData")) || {};
    examData.respuestasPractica = practiceData;
    localStorage.setItem("examData", JSON.stringify(examData));
}



// Función para finalizar desarrollo y pasar a práctica
function finalizarDesarrollo() {
    Swal.fire({
        title: "Parte de desarrollo finalizada",
        text: "Ahora continúa con la parte 3: Práctica.",
        icon: "success",
        confirmButtonText: "Continuar a Práctica"
    }).then(() => {
        localStorage.setItem("parte2Finalizada", "true");
        document.getElementById("essay").style.display = "none";
        document.getElementById("practice").style.display = "block";
        initPracticePart();
        showPracticeSection(1);
        updatePracticeProgress();
    });
}
/////////////////////////////////