(function () {
    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
    if (examData?.accessCode && examData.accessCode !== ACCESS_CODE) {
        localStorage.removeItem(EXAM_STORAGE_KEY);
        localStorage.removeItem(EXAM_STATE_KEY);
        localStorage.removeItem("examStarted");
        localStorage.removeItem("examEndTime");
        localStorage.removeItem("uniqueQuestionsRandomizadas");
        localStorage.removeItem("studentAnswers");
        localStorage.removeItem("currentQuestionIndex");
        localStorage.removeItem("parte1Finalizada");
        // Reinicia también el estado de instrucciones aceptadas
        localStorage.removeItem("aceptoInstruccionesExamen");
    }
    // Si el código cambió, inicia objeto vacío
    const newExamData = (examData?.accessCode !== ACCESS_CODE) ? {} : (examData || {});
    newExamData.accessCode = ACCESS_CODE;
    // Elimina las instrucciones aceptadas si el código cambió
    if (examData?.accessCode !== ACCESS_CODE) {
        delete newExamData.instruccionesAceptadas;
        delete newExamData.fechaAceptacion;
    }
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(newExamData));
})();