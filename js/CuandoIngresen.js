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