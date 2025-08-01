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
            document.getElementById("timer").textContent = "⏰ Tiempo terminado";
            localStorage.removeItem("examEndTime");
            finishExam();
        } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            document.getElementById("timer").textContent =
                `⏳ Tiempo restante: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        text: 'Tu tiempo ha terminado.',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        window.location.href = "resumen.html"; // O página de resumen
    });
}