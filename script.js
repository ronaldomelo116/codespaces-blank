// Gerenciamento de Estado
let userData = JSON.parse(localStorage.getItem('jsQuestData')) || {
    xp: 0,
    completedModules: []
};

let curriculum = [];
let currentModule = null;
let currentQuestionIndex = 0;
let selectedOptionIndex = null;
let acertosNoMiniProjeto = 0; // Nova variável para controlar o gráfico

// Configurações do Canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Elementos do DOM
const dashboard = document.getElementById('dashboard');
const modulesContainer = document.getElementById('modules-container');
const loadingState = document.getElementById('loading-state');
const exerciseArea = document.getElementById('exercise-area');
const btnCloseExercise = document.getElementById('btn-close-exercise');
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const btnVerify = document.getElementById('btn-verify');
const xpCounter = document.getElementById('xp-counter');
const progressBar = document.getElementById('exercise-progress');
const canvasContainer = document.getElementById('canvas-container');

// Inicialização e Fetch da "API"
async function init() {
    updateUI();
    try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula tempo de rede
        const response = await fetch('./dados.json');
        
        if (!response.ok) throw new Error("Falha ao carregar dados");
        
        curriculum = await response.json();
        
        loadingState.classList.add('hidden');
        modulesContainer.classList.remove('hidden');
        renderModules();
    } catch (error) {
        loadingState.innerHTML = `<p style="color: red;">Erro ao carregar os dados. Verifique se o arquivo dados.json está na mesma pasta e se você está usando um servidor local (Live Server).</p>`;
        console.error(error);
    }
}

function updateUI() {
    xpCounter.textContent = `${userData.xp} XP`;
}

function saveProgress() {
    localStorage.setItem('jsQuestData', JSON.stringify(userData));
    updateUI();
}

function renderModules() {
    modulesContainer.innerHTML = '';
    
    curriculum.forEach((mod, index) => {
        const isLocked = index > 0 && !userData.completedModules.includes(curriculum[index - 1].id);
        const isCompleted = userData.completedModules.includes(mod.id);
        
        const card = document.createElement('div');
        card.className = `module-card ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="module-info">
                <h3>${mod.title} ${isCompleted ? '<i class="bi bi-check-circle-fill" style="color: green;"></i>' : ''}</h3>
                <p>${mod.description}</p>
            </div>
            <div class="module-icon">
                <i class="bi ${isLocked ? 'bi-lock-fill' : mod.icon}"></i>
            </div>
        `;

        if (!isLocked) {
            card.addEventListener('click', () => startModule(mod));
        }
        modulesContainer.appendChild(card);
    });
}

function startModule(mod) {
    currentModule = mod;
    currentQuestionIndex = 0;
    acertosNoMiniProjeto = 0; // Zera os acertos ao iniciar
    dashboard.classList.add('hidden');
    exerciseArea.classList.remove('hidden');
    
    // Se for o mini-projeto do Dashboard, mostra o canvas
    if (mod.isMiniProject) {
        canvasContainer.classList.remove('hidden');
        drawDashboardChart(0); // Desenha o gráfico vazio
    } else {
        canvasContainer.classList.add('hidden');
    }

    loadQuestion();
}

// ==========================================
// NOVA LÓGICA DO CANVAS: GRÁFICO DE DASHBOARD
// ==========================================
function drawDashboardChart(acertos) {
    // 1. Limpa o canvas inteiro antes de desenhar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Desenha as linhas de base (Eixo X e Y do gráfico)
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 10); // Linha vertical (Y)
    ctx.lineTo(30, 130);
    ctx.lineTo(280, 130); // Linha horizontal (X)
    ctx.stroke();

    // 3. Adiciona as barras de vendas conforme o usuário acerta as questões
    if (acertos >= 1) {
        // Primeira Barra (Ex: Vendas de Janeiro)
        ctx.fillStyle = '#F7DF1E'; // Amarelo JS
        ctx.fillRect(50, 60, 40, 70); 
    }
    
    if (acertos >= 2) {
        // Segunda Barra (Ex: Vendas de Fevereiro)
        ctx.fillStyle = '#111111'; // Preto
        ctx.fillRect(110, 30, 40, 100);
    }

    if (acertos >= 3) {
        // Terceira Barra (Ex: Vendas de Março - Sucesso)
        ctx.fillStyle = '#28a745'; // Verde
        ctx.fillRect(170, 80, 40, 50);
    }
}
// ==========================================

function loadQuestion() {
    selectedOptionIndex = null;
    btnVerify.textContent = "Verificar";
    btnVerify.disabled = true;
    
    const progress = (currentQuestionIndex / currentModule.questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    const question = currentModule.questions[currentQuestionIndex];
    questionContainer.innerHTML = `<h2>${question.text}</h2>`;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => selectOption(index, btn));
        optionsContainer.appendChild(btn);
    });
}

function selectOption(index, btnElement) {
    selectedOptionIndex = index;
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
    btnVerify.disabled = false;
}

btnVerify.addEventListener('click', () => {
    const question = currentModule.questions[currentQuestionIndex];
    const optionsButtons = document.querySelectorAll('.option-btn');
    
    if (btnVerify.textContent === "Continuar") {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentModule.questions.length) {
            loadQuestion();
        } else {
            finishModule();
        }
        return;
    }

    if (selectedOptionIndex === question.correctAnswer) {
        optionsButtons[selectedOptionIndex].classList.add('correct');
        userData.xp += 25; 
        
        // Se for o mini projeto, atualiza o gráfico no Canvas
        if (currentModule.isMiniProject) {
            acertosNoMiniProjeto++;
            drawDashboardChart(acertosNoMiniProjeto); // Redesenha o gráfico adicionando barras
        }
    } else {
        optionsButtons[selectedOptionIndex].classList.add('wrong');
        optionsButtons[question.correctAnswer].classList.add('correct');
    }
    
    btnVerify.textContent = "Continuar";
});

function finishModule() {
    if (!userData.completedModules.includes(currentModule.id)) {
        userData.completedModules.push(currentModule.id);
    }
    saveProgress();
    closeExercise();
    renderModules();
}

function closeExercise() {
    dashboard.classList.remove('hidden');
    exerciseArea.classList.add('hidden');
}

btnCloseExercise.addEventListener('click', closeExercise);

// Executar
init();