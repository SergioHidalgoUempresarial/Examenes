function validateAccess() {
    const inputCode = document.getElementById("accessInput").value.trim();
    if (inputCode === ACCESS_CODE) {
        document.getElementById("access-section").style.display = "none";
        document.getElementById("exam-section").style.display = "block";
        document.getElementById("instruction-section").style.display = "none";
        startTimer();
    } else {
        document.getElementById("accessError").style.display = "block";
    }
}