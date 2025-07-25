let currentQuestion = 0;
const studentAnswers = [];

function loadQuestion(index) {
    const q = uniqueQuestions[index];
    const container = document.getElementById("question-content");
    
    container.innerHTML = `
        <p style="font-size: 1.1em; font-weight: bold; color: #004080; margin-bottom: 15px;">
            <strong>${index + 1}.</strong> ${q.question}
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            ${q.options.map(opt => `
                <label style="background: #f5f9ff; border: 1px solid #cce0f5; border-radius: 8px; padding: 8px 12px; cursor: pointer;">
                    <input type="radio" name="q${index}" value="${opt}" onchange="saveAnswer(${index}, this.value)" style="margin-right: 8px;">
                    ${opt}
                </label>
            `).join('')}
        </div>
    `;

    updateProgress();
    document.getElementById("nextBtn").innerText = (index === uniqueQuestions.length - 1) ? "Finalizar" : "Siguiente";
}

function saveAnswer(index, value) {
    studentAnswers[index] = value;
    updateProgress();
}

function nextQuestion() {
    if (currentQuestion < uniqueQuestions.length - 1) {
        currentQuestion++;
        loadQuestion(currentQuestion);
    } else {
        // Mostrar resultados aquí o continuar al paso siguiente
        alert("Examen finalizado");
        console.log("Respuestas del estudiante:", studentAnswers);
    }
}

function renderProgressBar() {
    const container = document.getElementById("progressList");
    const total = uniqueQuestions.length;
    document.getElementById("totalQuestions").textContent = total;
    container.innerHTML = "";

    for (let i = 0; i < total; i++) {
        const box = document.createElement("div");
        box.style.width = "3em"
        box.textContent = i + 1;
        box.style.padding = "10px";
        box.style.backgroundColor = "#e6e6e6ff"
        box.style.borderRadius = "4px";
        box.style.textAlign = "center";
        box.style.cursor = "pointer";
        box.style.marginBottom = "8px";
        box.style.border = "1px solid #ccc";

        // Colorea si ya respondió
        box.style.background = studentAnswers[i] ? "#3fbf62" : "#f1f1f1";

        // Si es la pregunta actual, resaltarla
        if (i === currentQuestion) {
            box.classList.add("active-question");
            box.style.backgroundColor = "#d6d092ff"
            box.style.width = "3.5em"
            box.style.border = "2px solid #e8e19aff";
        }

        // Al hacer clic, ir a esa pregunta
        box.onclick = () => {
            currentQuestion = i;
            loadQuestion(i);
        }
        container.appendChild(box);
    }
}

function updateProgress() {
    renderProgressBar();
}

// Inicialización (puedes llamarla al mostrar esta sección)
function initUniqueSelection() {
    currentQuestion = 0;
    studentAnswers.length = 0;
    loadQuestion(currentQuestion);
}

const uniqueQuestions = [
    {
        question: "¿Qué es la ciberseguridad? (2 pts)",
        options: [
            "La protección de sistemas y redes contra amenazas digitales",
            "Un tipo de hardware especializado",
            "Una función exclusiva de los antivirus",
            "Un proceso automático sin intervención humana"
        ],
        correct: "La protección de sistemas y redes contra amenazas digitales"
    },
    {
        question: "¿Qué relación existe entre hardware y software? (2 pts)",
        options: [
            "Son independientes y no interactúan",
            "El hardware funciona sin necesidad de software",
            "El software depende del hardware para ejecutarse",
            "Solo las computadoras de escritorio usan software"
        ],
        correct: "El software depende del hardware para ejecutarse"
    },
    {
        question: "¿Cuál de las siguientes opciones NO es un dispositivo de entrada? (2 pts)",
        options: [
            "Teclado",
            "Mouse",
            "Monitor",
            "Escáner"
        ],
        correct: "Monitor"
    },
    {
        question: "¿Qué componente se encarga de ejecutar las instrucciones en una computadora? (2 pts)",
        options: [
            "Memoria RAM",
            "Tarjeta gráfica",
            "Unidad central de proceso (CPU)",
            "Disco duro"
        ],
        correct: "Unidad central de proceso (CPU)"
    },
    {
        question: "¿Cuál es un ejemplo de memoria volátil? (2 pts)",
        options: [
            "ROM",
            "HDD",
            "RAM",
            "SSD"
        ],
        correct: "RAM"
    },
    {
        question: "¿Para qué se utiliza la memoria caché? (2 pts)",
        options: [
            "Para guardar archivos permanentemente",
            "Para aumentar la velocidad de acceso a datos recurrentes",
            "Para almacenar copias de seguridad del sistema",
            "Para ejecutar gráficos de alta calidad"
        ],
        correct: "Para aumentar la velocidad de acceso a datos recurrentes"
    },
    {
        question: "¿Qué diferencia principal existe entre la memoria RAM y la ROM? (2 pts)",
        options: [
            "La RAM es volátil y la ROM",
            "La ROM es más rápida que la RAM",
            "Ambas pueden ser modificadas libremente por el usuario",
            "La RAM solo se usa en servidores"
        ],
        correct: "La RAM es volátil y la ROM"
    },
    {
        question: "¿Qué memoria almacena los datos más utilizados por el procesador para acelerar el acceso? (2 pts)",
        options: [
            "RAM",
            "Caché",
            "ROM",
            "Flash"
        ],
        correct: "Caché"
    },
    {
        question: "¿Qué tipo de memoria se encuentra en las tarjetas gráficas y ayuda al procesamiento de imágenes? (2 pts)",
        options: [
            "VRAM",
            "ROM",
            "HDD",
            "RAM"
        ],
        correct: "VRAM"
    },
    {
        question: "¿Qué es la memoria virtual? (2 pts)",
        options: [
            "Un espacio en el disco duro utilizado como extensión de la RAM",
            "Un tipo de memoria integrada en los procesadores",
            "Un software que gestiona la memoria de la PC",
            "Un almacenamiento físico externo"
        ],
        correct: "Un espacio en el disco duro utilizado como extensión de la RAM"
    },
    {
        question: "¿Cuál es la función principal de la memoria ROM? (2 pts)",
        options: [
            "Almacenar programas temporalmente",
            "Contener las instrucciones básicas para el arranque del sistema",
            "Ejecutar videojuegos de alto rendimiento",
            "Mejorar el rendimiento del procesador"
        ],
        correct: "Contener las instrucciones básicas para el arranque del sistema"
    },
    {
        question: "¿Qué es un disco SSD? (2 pts)",
        options: [
            "Un disco duro mecánico",
            "Un tipo de memoria RAM",
            "Un almacenamiento basado en memoria flash",
            "Una unidad de almacenamiento óptimo"
        ],
        correct: "Un almacenamiento basado en memoria flash"
    },
    {
        question: "¿Cuál es la diferencia entre la memoria RAM DDR3 y DDR5? (2 pts)",
        options: [
            "la DDR5 es más rápida y eficiente",
            "La DDR3 tiene mayor capacidad",
            "La DDR5 es solo para servidores",
            "No hay diferencias entre ellas"
        ],
        correct: "la DDR5 es más rápida y eficiente"
    },
    {
        question: "¿Que significa M.2 en almacenamiento? (2 pts)",
        options: [
            "Un formato compacto para discos SSD",
            "Un tipo de memoria ROM avanzada",
            "Una categoría de procesadores",
            "Un software de administración de archivos"
        ],
        correct: "Un formato compacto para discos SSD"
    },
    {
        question: "¿Qué es una máquina virtual(VM)? (2 pts)",
        options: [
            "Un software que emula un sistema operativo dentro de otro",
            "Un hardware físico adicional para aumentar el rendimiento",
            "Un sistema que reemplaza a la memoria RAM",
            "Una red de servidores conectados"
        ],
        correct: "Un software que emula un sistema operativo dentro de otro"
    },
    {
        question: "¿Cuál es una de las principales ventajas de VirtualBox? (2 pts)",
        options: [
            "Es gratuito y permite ejecutar múltiples sistemas operativos",
            "Solo funciona con Windows",
            "No permite tomar instantáneas del sistema",
            "Requiere una licencia de pago"
        ],
        correct: "Es gratuito y permite ejecutar múltiples sistemas operativos"
    },
    {
        question: "¿Qué tipo de conexión de red permite que una VM se comunique con Internet y con la red local como si fuera otro dispositivo? (2 pts)",
        options: [
            "NAT",
            "Bridge",
            "DHCP",
            "Loopback"
        ],
        correct: "Bridge"
    },
    {
        question: "¿Cuál de los siguientes NO es un comando de Windows PowerShell? (2 pts)",
        options: [
            "Get-NetAdapter",
            "ipconfig",
            "mkdir",
            "tasklist"
        ],
        correct: "mkdir"
    },
    {
        question: "¿Qué atajo de teclado en el sistema operativo Windows abre el Administrador de Tareas directamente? (2 pts)",
        options: [
            "Ctrl + Alt + Supr",
            "Ctrl + Shift + Esc",
            "Win + R",
            "Alt + F4"
        ],
        correct: "Ctrl + Shift + Esc"
    },
    {
        question: "¿Qué comando en Linux se usa para instalar un programa en sistemas basados en Debian? (2 pts)",
        options: [
            "install package",
            "sudo apt install <paquete>",
            "run application",
            "setup software"
        ],
        correct: "sudo apt install <paquete>"
    },
    {
        question: "¿Cuál de los siguientes comandos en Linux se usa para listar archivos en un directorio? (2 pts)",
        options: [
            "ls",
            "dir",
            "showfiles",
            "list-all"
        ],
        correct: "ls"
    },
    {
        question: "¿Qué comando en Linux se usa para cambiar los permisos de un archivo? (2 pts)",
        options: [
            "chmod",
            "ls -l",
            "mkdir",
            "rm"
        ],
        correct: "chmod"
    },
    {
        question: "¿Qué significa CLI? (2 pts)",
        options: [
            "Command Line Interface",
            "Computer Linux Interaction",
            "Control Logic Integration",
            "Cloud Linux Instance"
        ],
        correct: "Command Line Interface"
    },
    {
        question: "¿Cuál de los siguientes comandos en Windows se usa para ver la configuración de red? (2 pts)",
        options: [
            "netconfig",
            "ipconfig",
            "list-network",
            "configip"
        ],
        correct: "ipconfig"
    },
    {
        question: "¿Qué comando en Linux permite ver la dirección IP de la computadora? (2 pts)",
        options: [
            "ls /ip",
            "ip a",
            "netstat -an",
            "show-ip"
        ],
        correct: "ip a"
    },
    {
        question: "¿Qué comando en Linux se usa para monitorear procesos en tiempo real? (2 pts)",
        options: [
            "top",
            "tasklist",
            "view-process",
            "process-check"
        ],
        correct: "top"
    },
    {
        question: "¿Cuál de los siguientes comandos de Windows permite cerrar un proceso específico? (2 pts)",
        options: [
            "taskkill",
            "end-process",
            "stop-app",
            "shutdown -t 0"
        ],
        correct: "taskkill"
    },
];

initUniqueSelection();