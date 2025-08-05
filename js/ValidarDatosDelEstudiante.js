document.addEventListener("DOMContentLoaded", function () {
    const nameInput = document.getElementById("studentName");
    const idInput = document.getElementById("studentID");
    const validarBtn = document.getElementById("validarDatosBtn");

    if (!nameInput || !idInput || !validarBtn) return;

    const examData = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};

    if (examData.nombre && examData.cedula) {
        nameInput.value = examData.nombre;
        idInput.value = examData.cedula;
        nameInput.disabled = true;
        idInput.disabled = true;
        validarBtn.disabled = true;
        validarBtn.style.display = "none";
        return;
    }

    validarBtn.addEventListener("click", function () {
        const nombre = nameInput.value.trim();
        const cedula = idInput.value.trim();

        if (!validarNombre(nombre)) {
            Swal.fire({
                icon: "error",
                title: "Nombre inválido",
                text: "El nombre debe tener al menos 3 palabras, cada una con mínimo 4 letras.",
            });
            return;
        }

        if (!/^\d{9,}$/.test(cedula)) {
            Swal.fire({
                icon: "error",
                title: "Cédula inválida",
                text: "La cédula debe tener al menos 9 dígitos y máximo 12.",
            });
            return;
        }

        // Guardar en EXAM_STORAGE_KEY
        const estado = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY)) || {};
        estado.nombre = nombre;
        estado.cedula = cedula;
        localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(estado));

        nameInput.disabled = true;
        idInput.disabled = true;
        validarBtn.disabled = true;
        validarBtn.style.display = "none";

        Swal.fire({
            icon: "success",
            title: "Datos validados",
            text: "Nombre y cédula han sido guardados correctamente.",
        });
    });

    function validarNombre(nombre) {
        const partes = nombre.split(/\s+/).filter(Boolean);
        if (partes.length < 3) return false;
        return partes.every(p => p.length >= 3);
    }
});

// Mostrar los datos guardados en consola (desde EXAM_STORAGE_KEY)
const datos = JSON.parse(localStorage.getItem(EXAM_STORAGE_KEY));
console.log(datos?.nombre);
console.log(datos?.cedula);