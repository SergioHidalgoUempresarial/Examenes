const dateElement = document.getElementById("dateDisplay");
const now = new Date();
const formattedDate = now.toLocaleDateString("es-CR", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});
dateElement.textContent = `Fecha: ${formattedDate}`;