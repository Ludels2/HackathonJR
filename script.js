// ==========================================
// INICIALIZAÇÃO E MEMÓRIA (LocalStorage)
// ==========================================
let totalCoins = parseInt(localStorage.getItem('anakinCoins')) || 0;
let ownsDracula = localStorage.getItem('anakinDracula') === 'true';

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const tasksContainer = document.getElementById('tasks-container');
const coinCount = document.getElementById('coin-count');
const buyDraculaBtn = document.getElementById('buy-dracula-btn');
const anakinPet = document.querySelector('.sprite-animacao'); 

coinCount.textContent = totalCoins;

if (ownsDracula && anakinPet) {
    anakinPet.classList.add('dracula-equipped');
    if (buyDraculaBtn) {
        buyDraculaBtn.textContent = '🧛 Equipado!';
        buyDraculaBtn.disabled = true;
    }
}

// ==========================================
// GERAÇÃO DE TAREFAS COM IA (O GRANDE UPGRADE)
// ==========================================
// ==========================================
// GERAÇÃO DE TAREFAS COM IA (MODO DEBUG ATIVADO)
// ==========================================
addBtn.addEventListener('click', async () => {
    const inputValue = taskInput.value.trim();
    if (!inputValue) return;

    addBtn.textContent = '⌛';
    addBtn.disabled = true;

    try {
        console.log("1. Enviando para a IA: ", inputValue);
        
        // Voltamos pro seu modelo 2.5 flash que estava funcionando!
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                generationConfig: {
                    responseMimeType: "application/json"
                },
                contents: [{
                    parts: [{
                        text: `A missão do usuário é: "${inputValue}". Como um especialista em produtividade e TDAH, avalie a complexidade. Se for simples/doméstica, quebre em 2 a 4 passos físicos. Se for um objetivo complexo de longo prazo (como aprender a programar ou TCC), crie os primeiros passos práticos e estratégicos para começar sem sobrecarga (ex: 'Pesquisar vídeo de 5 min no YouTube', 'Criar conta em plataforma'). Defina uma recompensa justa em moedas para cada passo (entre 5 e 20). Retorne APENAS um array de objetos JSON: [{"texto": "Passo 1", "moedas": 10}, {"texto": "Passo 2", "moedas": 15}].`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("2. O Google recusou a requisição:", errorData);
            throw new Error("Erro na API do Google");
        }

        const data = await response.json();
        console.log("3. Resposta bruta da IA chegou:", data);

        let aiText = data.candidates[0].content.parts[0].text;
        console.log("4. Texto da IA antes de limpar:", aiText);

        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const steps = JSON.parse(aiText);
        
        console.log("5. JSON parseado com sucesso:", steps);

        tasksContainer.innerHTML = '';

        steps.forEach(step => {
            createTaskElement(step.texto, step.moedas);
        });

        taskInput.value = '';

    } catch (error) {
        // AQUI ESTÁ O NOSSO DETETIVE!
        console.error('🔥 DEU RUIM! O erro exato foi:', error);
        
        tasksContainer.innerHTML = '';
        
        const fallbackSteps = [
            { texto: `Levantar e preparar o ambiente`, moedas: 5 },
            { texto: `Fazer a 1ª micro-ação por 2 minutos`, moedas: 15 }
        ];
        
        fallbackSteps.forEach(step => createTaskElement(step.texto, step.moedas));
        taskInput.value = '';
    } finally {
        addBtn.textContent = '+';
        addBtn.disabled = false;
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

// ==========================================
// FÁBRICA DE TAREFAS (Agora aceita moedas dinâmicas!)
// ==========================================
function createTaskElement(text, rewardPoints) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    
    // Mostra pro usuário quanto vale aquela micro-tarefa específica
    taskText.textContent = `${text} (+${rewardPoints} 🪙)`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Soma o valor que a IA decidiu!
            totalCoins += rewardPoints;
            taskText.classList.add('completed');
            coinCount.textContent = totalCoins;
            localStorage.setItem('anakinCoins', totalCoins);
            
            taskDiv.classList.add('removing');
            setTimeout(() => {
                taskDiv.remove();
            }, 500);

        } else {
            // Se o usuário desmarcar antes de sumir
            totalCoins -= rewardPoints;
            taskText.classList.remove('completed');
            coinCount.textContent = totalCoins;
            localStorage.setItem('anakinCoins', totalCoins);
        }
    });

    taskDiv.appendChild(taskText);
    taskDiv.appendChild(checkbox);
    tasksContainer.appendChild(taskDiv);
}

// ==========================================
// SISTEMA DA LOJA
// ==========================================
if (buyDraculaBtn && anakinPet) {
    buyDraculaBtn.addEventListener('click', () => {
        if (ownsDracula) {
            alert('Você já tem o Anakin Drácula!');
            return;
        }

        if (totalCoins >= 20) {
            totalCoins -= 20;
            coinCount.textContent = totalCoins;
            
            localStorage.setItem('anakinCoins', totalCoins);
            localStorage.setItem('anakinDracula', 'true');
            ownsDracula = true;
            
            anakinPet.classList.add('dracula-equipped'); 
            
            buyDraculaBtn.textContent = '🧛 Equipado!';
            buyDraculaBtn.disabled = true;
            
            alert('Miau-haha! O Drácula chegou!');
        } else {
            const faltam = 20 - totalCoins;
            alert(`Faltam ${faltam} moedas!`);
        }
    });
}