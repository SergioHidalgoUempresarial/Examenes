function validateAccess() {
    const inputCode = document.getElementById("accessInput").value.trim();
    if (inputCode === ACCESS_CODE) {
        document.getElementById("access-section").style.display = "none";

        document.getElementById("upload").style.display = "none";
        document.getElementById("final").style.display = "none";
        Swal.fire({
            title: '🚨 ¡Recuerde!',
            html: `
                <p>Le doy mis mejores deseos en la evaluación.</p>
                <br>
                <ul style="text-align:left;">
                    <li>No recargue la página</li>
                    <li>No cambie de pestaña o ventana</li>
                    <li>Evite cerrar el navegador</li>
                    <br>
                    <br>
                    <li>El examen podría anularse</li>
                </ul>
                <br>
                <b>¡"Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia."Proverbios 2:6!</b>
                `,
            imageUrl: 'images/BestWishes.png',
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
                startTimer();
                document.getElementById("nav-bar").style.display = "block";
                document.getElementById("begin-timer").style.display = "block";
                document.getElementById("name-section").style.display = "block";
                document.getElementById("uniqueSelection").style.display = "block";
                // Aquí puedes permitir continuar con el examen
            } else if (result.isDismissed) {
                // El usuario presionó cancelar o cerró el cuadro
                window.location.href = "https://www.google.com"; // o cerrar ventana: window.close();
            }
        });
    } else {
        document.getElementById("accessError").style.display = "block";
    }
}

