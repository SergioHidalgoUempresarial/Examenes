// BLOQUEO DE FUNCIONES NO PERMITIDAS
let seguridadActiva = true;

// Función de bloqueo de combinaciones peligrosas
document.addEventListener("keydown", function (e) {
    if (!seguridadActiva) return;

    const key = e.key.toLowerCase();
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

