function validateAccess() {
    const inputCode = document.getElementById("accessInput").value.trim();
    if (inputCode === ACCESS_CODE) {
        document.getElementById("exam-section").style.display = "block";
        document.getElementById("access-section").style.display = "none";
        document.getElementById("begin-timer").style.display = "block";
        document.getElementById("instruction-section").style.display = "none";
        startTimer();
        alert("⚠️ ¡Recuerde! \n\nNo cambies de pestaña ni recargues. El examen podría anularse.");
    } else {
        document.getElementById("accessError").style.display = "block";
    }
}

