

let timerInterval;
function startTimer() {
    const endTime = Date.now() + EXAM_DURATION_MINUTES * 60 * 1000;
    timerInterval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(timerInterval);
            document.getElementById("timer").textContent = "Tiempo terminado";
            finishExam();
        } else {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            document.getElementById("timer").textContent = `Tiempo restante: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}