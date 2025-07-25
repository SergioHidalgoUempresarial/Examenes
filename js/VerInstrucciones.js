const btn = document.getElementById("toggleInstructionsBtn");
const instructions = document.getElementById("instruction");

// Estado inicial oculto
instructions.style.display = "none";

btn.addEventListener("click", () => {
    if (instructions.style.display === "none") {
        instructions.style.display = "block";
        btn.innerText = "❌ Ocultar Instrucciones";
    } else {
        instructions.style.display = "none";
        btn.innerText = "📘 Ver Instrucciones";
    }
});