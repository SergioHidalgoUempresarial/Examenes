const btn = document.getElementById("toggleInstructionsBtn");
const instructions = document.getElementById("instruction");

// Estado inicial oculto
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

    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            Swal.fire({
                icon: 'info',
                title: 'Consentimiento registrado',
                text: 'Usted ha aceptado las instrucciones del examen. Esta acción no se puede deshacer.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#004080',
                allowOutsideClick: false
            }).then(() => {
                checkbox.disabled = true; // No podrá desmarcarlo después
            });
        } else {
            // Previene desmarcarlo manualmente
            checkbox.checked = true;
        }
    });
});