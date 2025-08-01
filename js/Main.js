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

        // OPCIONAL: puedes aquí restar un intento o finalizar el examen:
        // finalizarExamenPorTrampa();
    }
});