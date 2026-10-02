// Registro do Service Worker (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado com sucesso!', reg))
            .catch(err => console.error('Erro ao registrar Service Worker:', err));
    });
}

// Gerenciamento de Estado
let userData = JSON.parse(localStorage.getItem('jsQuestData')) || {
    xp: 0,
    completedModules: []
};

let curriculum = [];
let currentModule = null;
let currentQuestionIndex = 0;
let selectedOptionIndex = null;
let acertosNoMiniProjeto = 0;

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

const exerciseBox = document.getElementById('main-exercise-box');
const completionScreen = document.getElementById('completion-screen');
const completedModuleName = document.getElementById('completed-module-name');
const btnReturnDashboard = document.getElementById('btn-return-dashboard');

// Elementos de feedback
const feedbackPanel = document.getElementById('feedback-panel');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackText = document.getElementById('feedback-text');

const somClick = new Audio('./assets/sounds/click.mp3');
const somCorrect = new Audio('./assets/sounds/correct.mp3');
const somWrong = new Audio('./assets/sounds/wrong.mp3');
const somCompleted = new Audio('./assets/sounds/completed.mp3');

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
        // Bloqueia o módulo se o anterior não estiver concluído
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
    somClick.currentTime = 0;
    somClick.play();

    currentModule = mod;
    currentQuestionIndex = 0;
    acertosNoMiniProjeto = 0; // Zera os acertos ao iniciar a fase
    dashboard.classList.add('hidden');
    exerciseArea.classList.remove('hidden');
    
    // Se for o mini-projeto do Dashboard, mostra o canvas e zera o gráfico
    if (mod.isMiniProject) {
        canvasContainer.classList.remove('hidden');
        drawDashboardChart(0); 
    } else {
        canvasContainer.classList.add('hidden');
    }

    loadQuestion();
}

// ==========================================
// LÓGICA DO CANVAS: GRÁFICO DE DASHBOARD
// ==========================================
function drawDashboardChart(acertos) {
    // Limpa o quadro
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Eixo X e Y do gráfico
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, 130);
    ctx.lineTo(280, 130);
    ctx.stroke();

    // Adiciona as barras de acordo com o número de acertos
    if (acertos >= 1) {
        ctx.fillStyle = '#F7DF1E'; // Amarelo JS
        ctx.fillRect(50, 60, 40, 70); 
    }
    if (acertos >= 2) {
        ctx.fillStyle = '#111111'; // Preto
        ctx.fillRect(110, 30, 40, 100);
    }
    if (acertos >= 3) {
        ctx.fillStyle = '#28a745'; // Verde
        ctx.fillRect(170, 80, 40, 50);
    }
}
// ==========================================

function loadQuestion() {
    selectedOptionIndex = null;
    btnVerify.textContent = "Verificar";
    btnVerify.disabled = true;
    
    // Esconde o painel de feedback ao carregar a pergunta
    feedbackPanel.classList.add('hidden');
    feedbackPanel.classList.remove('success', 'error');

    // Atualiza a barra de progresso
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

    somClick.currentTime = 0;
    somClick.play();
    // Remove a marcação de todas as outras opções
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
    
    // Libera o botão de verificar
    btnVerify.disabled = false;
}

btnVerify.addEventListener('click', () => {
    const question = currentModule.questions[currentQuestionIndex];
    const optionsButtons = document.querySelectorAll('.option-btn');
    
    // Se o botão estiver como "Continuar", ele avança para a próxima tela
    if (btnVerify.textContent === "Continuar") {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentModule.questions.length) {
            loadQuestion();
        } else {
            finishModule();
        }
        return;
    }

    // ==========================================
    // Lógica ao clicar em "Verificar" (Avaliação)
    // ==========================================
    feedbackPanel.classList.remove('hidden', 'success', 'error');

    if (selectedOptionIndex === question.correctAnswer) {
        somCorrect.currentTime = 0;
        somCorrect.play();
        // Acertou
        optionsButtons[selectedOptionIndex].classList.add('correct');
        userData.xp += 25; 
        
        feedbackPanel.classList.add('success');
        feedbackTitle.innerHTML = '<i class="bi bi-check-circle-fill"></i> Mandou bem!';
        feedbackText.textContent = question.explanation || "Resposta exata! Você aplicou o conceito corretamente.";
        
        // Se for o projeto em canvas, aumenta o gráfico
        if (currentModule.isMiniProject) {
            acertosNoMiniProjeto++;
            drawDashboardChart(acertosNoMiniProjeto); 
        }
    } else {
        somWrong.currentTime = 0;
        somWrong.play();
        // Errou
        optionsButtons[selectedOptionIndex].classList.add('wrong');
        optionsButtons[question.correctAnswer].classList.add('correct'); // Mostra qual era a certa
        
        feedbackPanel.classList.add('error');
        feedbackTitle.innerHTML = '<i class="bi bi-x-circle-fill"></i> Ops, não foi dessa vez.';
        feedbackText.textContent = question.explanation || "A opção correta está destacada em verde. Fique atento à sintaxe!";
    }
    
    // Desabilita os botões para o usuário não mudar a resposta depois de verificar
    optionsButtons.forEach(btn => btn.style.pointerEvents = 'none');
    
    // Muda o texto do botão para avançar
    btnVerify.textContent = "Continuar";
});

function finishModule() {
    // 1. Salva o progresso
    if (!userData.completedModules.includes(currentModule.id)) {
        userData.completedModules.push(currentModule.id);
    }
    saveProgress();
    
    // 2. Dispara o som de vitória
    somCompleted.currentTime = 0;
    somCompleted.play();

    // 3. Oculta as perguntas e exibe a tela de vitória
    exerciseBox.classList.add('hidden');
    completedModuleName.textContent = currentModule.title;
    completionScreen.classList.remove('hidden');
}

// Botão da tela de vitória para voltar ao mapa
btnReturnDashboard.addEventListener('click', () => {
    somClick.currentTime = 0;
    somClick.play();
    closeExercise();
    renderModules(); // Re-renderiza para desbloquear o próximo módulo
});

function closeExercise() {
    somClick.currentTime = 0;
    somClick.play();
    dashboard.classList.remove('hidden');
    exerciseArea.classList.add('hidden');
    exerciseBox.classList.remove('hidden');
    completionScreen.classList.add('hidden');
}

// Fechar no "X"
btnCloseExercise.addEventListener('click', closeExercise);

// Executa a aplicação
init();