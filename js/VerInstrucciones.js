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
