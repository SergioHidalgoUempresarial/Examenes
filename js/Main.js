// ===============================
// GESTIÓN DE INTENTOS
// ===============================
function obtenerIntentosRestantes() {
    const data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
    return data?.intentosRestantes ?? MAX_ATTEMPTS;
}

function restarIntentoYGuardar() {
    let data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || { intentosRestantes: MAX_ATTEMPTS };
    data.intentosRestantes = Math.max(0, (data.intentosRestantes ?? MAX_ATTEMPTS) - 1);
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(data));
}

function verificarIntentos() {
    const intentosRestantes = obtenerIntentosRestantes();
    if (intentosRestantes <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Examen bloqueado',
            text: 'Has agotado todos tus intentos.',
        }).then(() => window.location.href = "bloqueado.html"); // redirigir si deseas
    }
}

function mostrarIntentosRestantes() {
    const data = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || { intentosRestantes: MAX_ATTEMPTS };
    const restantes = data.intentosRestantes ?? MAX_ATTEMPTS;
    const span = document.getElementById("intentos-restantes");

    if (!span) return;

    span.textContent = restantes;

    // Cambiar color según el número de intentos
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
        // Mostrar mensaje de intentos agotados
        accessSection.innerHTML = `
            <p style="color: red; font-weight: bold; font-size: 1.2em; margin-top: 1em;">
                Sus intentos se acabaron, por favor póngase en contacto con su docente.
            </p>
        `;
    } else {
        // Restaurar contenido original (por si se quiere recargar después con intentos disponibles)
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
    const btnIngresar = inputCodigo?.nextElementSibling; // botón justo después del input

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




// ===============================
// DETECCIÓN DE RECARGA Y CAMBIO DE PESTAÑA
// ===============================
window.addEventListener("beforeunload", function (e) {
    restarIntentoYGuardar();
    mostrarIntentosRestantes();
    localStorage.setItem(EXAM_STATE_KEY, "perdido");
    const msg = "⚠️ Si recarga o sale, perderá un intento.";
    e.preventDefault();
    e.returnValue = msg;
    return msg;
});


document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        restarIntentoYGuardar();
        mostrarIntentosRestantes();
        localStorage.setItem(EXAM_STATE_KEY, "perdido");

        Swal.fire({
            icon: 'warning',
            title: '⚠ Atención',
            text: 'Has salido del examen. Perdiste un intento.',
            confirmButtonText: 'Entendido'
        }).then(() => location.reload());
    }
});

// ===============================
// MOSTRAR/OCULTAR INSTRUCCIONES
// ===============================
const btn = document.getElementById("toggleInstructionsBtn");
const instructions = document.getElementById("instruction");
instructions.style.display = "none";

btn?.addEventListener("click", () => {
    if (instructions.style.display === "none") {
        instructions.style.display = "block";
        btn.innerText = "❌ Ocultar Instrucciones";
    } else {
        instructions.style.display = "none";
        btn.innerText = "📘 Ver Instrucciones";
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
        btn.innerText = "📘 Ver Instrucciones";
    }
});

// ===============================
// CHECKBOX DE CONSENTIMIENTO
// ===============================
document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById("agreeCheck");
    if (!checkbox) return;

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
                    btn.innerText = "📘 Ver Instrucciones";
                } else {
                    checkbox.checked = false;
                }
            });
        } else {
            checkbox.checked = true;
        }
    });
});

// ===============================
// BOTÓN SECRETO PARA ADMINISTRADOR
// ===============================
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
                    title: "⏳ Espera requerida",
                    text: "Este botón solo se puede usar cada 2 días.",
                });
                return;
            }
        }

        Swal.fire({
            title: "🔐 Confirmación",
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
                    title: "✅ Datos borrados",
                    text: "Todo el progreso del examen fue eliminado.",
                }).then(() => location.reload());
            }
        });
    });
});

// ===============================
// INICIALIZACIÓN
// ===============================
window.onload = function () {
    verificarIntentos();
    mostrarIntentosRestantes();
    actualizarAccesoPorIntentos();  // <<--- Aquí la llamada para mostrar u ocultar acceso
    controlarAccesoPorIntentos();
};











/*
window.addEventListener("beforeunload", function (e) {
    // Mensaje personalizado (algunos navegadores ya no lo muestran, pero sí bloquean la salida)
    const confirmationMessage = "⚠️ Si recarga o sale de esta página, el examen se cerrará y perderá su intento.";

    e.preventDefault(); // Necesario para algunos navegadores
    e.returnValue = confirmationMessage; // Chrome, Firefox, Edge
    return confirmationMessage;
});

let cambioDeVentanaDetectado = false;

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        // Se detectó que el usuario salió de la pestaña
        cambioDeVentanaDetectado = true;

        Swal.fire({
            icon: 'warning',
            title: '⚠ Atención',
            text: 'Has salido del examen. Esto puede causar la pérdida del intento.',
            confirmButtonText: 'Entendido'
        });

        // OPCIONAL: se puede aquí restar un intento o finalizar el examen:
        // finalizarExamenPorTrampa();
    }
});

window.onload = function () {
    const savedAnswers = JSON.parse(localStorage.getItem("studentAnswers"));
    if (savedAnswers) {
        studentAnswers = savedAnswers;
    }

    const savedIndex = localStorage.getItem("currentQuestionIndex");
    if (savedIndex !== null) {
        currentQuestion = parseInt(savedIndex, 10);
    } else {
        currentQuestion = 0;
    }

    loadQuestion(currentQuestion);
    startTimer();
}

//Para borrar datos del storage de la página cuando se cargue la página del examen
window.addEventListener("DOMContentLoaded", () => {
    const adminBtn = document.getElementById("admin-clear");

    // Detectar combinación secreta: Ctrl + Alt + P
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.altKey && e.code === "KeyP") {
            const usedCount = parseInt(localStorage.getItem("clearButtonUses") || "0", 10);

            if (usedCount < MAX_CLEAR_USES) {
                const clearBtn = document.getElementById("admin-clear");
                if (clearBtn) {
                    clearBtn.style.display = "block";
                }
            } else {
                Swal.fire({
                    icon: "info",
                    title: "🔒 Botón desactivado",
                    text: "Ya se ha usado el botón el número máximo de veces permitido.",
                    confirmButtonText: "Aceptar"
                });
            }
        }
    });

    // Acción del botón
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
                    title: "⏳ Espera requerida",
                    text: `Este botón solo se puede usar cada 2 días. Por favor espera un poco más.`,
                    confirmButtonText: "Aceptar"
                });
                return;
            }
        }

        Swal.fire({
            title: "🔐 Confirmación de identidad",
            input: "password",
            inputLabel: "Ingrese su clave de administrador",
            inputPlaceholder: "Contraseña",
            inputAttributes: {
                maxlength: 30,
                autocapitalize: "off",
                autocorrect: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Borrar todo",
            cancelButtonText: "Cancelar",
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
                    title: "✅ Datos borrados",
                    text: "Todo el progreso del examen fue eliminado.",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    location.reload();
                });
            }
        });
    });

    const usedCount = parseInt(localStorage.getItem("clearButtonUses") || "0", 10);
    if (usedCount >= MAX_CLEAR_USES) {
        adminBtn.style.display = "none";
    } else {
        adminBtn.style.display = "none";
    }  
});




*/