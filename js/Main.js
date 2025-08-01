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




