const btn = document.getElementById("toggleInstructionsBtn");
const instructions = document.getElementById("instruction");

instructions.style.display = "none";

btn.addEventListener("click", () => {
    if (instructions.style.display === "none") {
        instructions.style.display = "block";
        btn.innerText = "❌ Ocultar Instrucciones";
    } else {
        instructions.style.display = "none";
        btn.innerText = "📘 Ver Instrucciones";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById("agreeCheck");

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
                    checkbox.disabled = true;
                    instructions.style.display = "none";
                    btn.innerText = "📘 Ver Instrucciones";
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
            instructions.style.display === "block" &&
            !instructions.contains(target) &&
            !btn.contains(target) &&
            !checkbox.disabled // solo si NO está aceptado
        ) {
            instructions.style.display = "none";
            btn.innerText = "📘 Ver Instrucciones";

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
