document.addEventListener('DOMContentLoaded', () => {
  Swal.fire({
    title: '🚨 Instrucciones importantes',
    html: `
      <p>Este examen es individual y debe completarse sin ayuda.</p>
      <br>
      <ul style="text-align:left;">
        <li>Por favor lea las intrucciones generales rápidamente</li>
        <li>No recargue la página</li>
        <li>No cambie de pestaña o ventana</li>
        <li>Evite cerrar el navegador</li>
        <li>El código para empezar a realizar el examen es: <strong>${ACCESS_CODE}</strong> </li>
      </ul>
      <br>
      <b>¿Esta de acuerdo?</b>
    `,
    imageUrl: 'images/question.png',
    confirmButtonText: 'Sí estoy de acuerdo',
    confirmButtonColor: '#0a691aff',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#004080',
    showCancelButton: true,
    allowOutsideClick: false,
    customClass: {
      popup: 'swal-wide-low'
    }

  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Usuario aceptó las instrucciones");
      // Aquí puedes permitir continuar con el examen
    } else if (result.isDismissed) {
      // El usuario presionó cancelar o cerró el cuadro
      window.location.href = "https://www.google.com"; // o cerrar ventana: window.close();
    }
  });
});






/*
Guardar progreso automáticamente (respuestas y tiempo):
Asumamos que tienes:

respuestas en una variable global tipo array u objeto.

tiempoRestante en una variable de cuenta regresiva.

En tu código, agrega esto cuando cambien respuestas o cada minuto:
*/

/*
function guardarProgreso() {
    const respuestas = obtenerRespuestasActuales(); // deberías tener esta función
    const tiempoRestante = document.getElementById("timer").textContent;

    localStorage.setItem("respuestas", JSON.stringify(respuestas));
    localStorage.setItem("tiempoRestante", tiempoRestante);
}

//cada cierto tiempo (cada 30 segundos por ejemplo):
setInterval(guardarProgreso, 30000);


//Recuperar progreso al cargar (si hubo recarga):
//En tu DOMContentLoaded o función inicial:
document.addEventListener('DOMContentLoaded', () => {
    const respuestasGuardadas = localStorage.getItem("respuestas");
    const tiempoGuardado = localStorage.getItem("tiempoRestante");

    if (respuestasGuardadas && tiempoGuardado) {
        const continuar = confirm("Parece que recargaste la página. ¿Deseas continuar el examen donde lo dejaste?");
        if (continuar) {
            restaurarRespuestas(JSON.parse(respuestasGuardadas));
            restaurarTiempo(tiempoGuardado);
        } else {
            // Si no quiere continuar, borra datos o redirige
            localStorage.clear();
            window.location.reload(); // o redirige a otra página
        }
    }
});
*/

/*
//Si se quiere terminar el examen si se recarga
document.addEventListener('DOMContentLoaded', () => {
    if (performance.getEntriesByType("navigation")[0].type === "reload") {
        alert("Recargar la página no está permitido. Su examen ha sido cancelado.");
        window.location.href = "examen-cancelado.html"; // crea esta página
    }
});
*/

/*
//EXTRA: Funciones necesarias (puedes adaptarlas)
function obtenerRespuestasActuales() {
    // Devuelve un objeto con preguntas y respuestas marcadas
    const respuestas = {};
    document.querySelectorAll('.pregunta').forEach((pregunta, index) => {
        const seleccionada = pregunta.querySelector('input[type="radio"]:checked');
        respuestas[`pregunta_${index + 1}`] = seleccionada ? seleccionada.value : null;
    });
    return respuestas;
}

function restaurarRespuestas(respuestas) {
    for (const clave in respuestas) {
        const valor = respuestas[clave];
        if (valor) {
            const input = document.querySelector(`input[type="radio"][value="${valor}"]`);
            if (input) input.checked = true;
        }
    }
}

function restaurarTiempo(tiempoTexto) {
    document.getElementById("timer").textContent = tiempoTexto;
    // puedes reiniciar tu temporizador con esta base si tienes uno con setInterval
}
*/