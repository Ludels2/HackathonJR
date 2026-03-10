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

// Atualiza a tela logo que abre o app
coinCount.textContent = totalCoins;

// Se já tiver o Drácula salvo, veste o gato imediatamente!
if (ownsDracula && anakinPet) {
    anakinPet.classList.add('dracula-equipped');
    if (buyDraculaBtn) {
        buyDraculaBtn.textContent = '🧛 Equipado!';
        buyDraculaBtn.disabled = true;
    }
}

// ==========================================
// GERAÇÃO DE TAREFAS COM IA
// ==========================================
addBtn.addEventListener('click', async () => {
    const inputValue = taskInput.value.trim();
    if (!inputValue) return;

    // Feedback visual de carregamento
    addBtn.textContent = '⌛';
    addBtn.disabled = true;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `O usuário precisa fazer a tarefa: "${inputValue}". Quebre essa tarefa em micro-passos sequenciais, fáceis e focados na ação física. Analise a complexidade da tarefa e crie a quantidade ideal de passos necessários (geralmente entre 2 e 6 passos coerentes que façam sentido). Responda APENAS em formato JSON válido, sendo um array de strings, neste formato: ["passo 1", "passo 2", "passo N"]`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const erroGoogle = await response.json();
            const motivoExato = erroGoogle.error ? erroGoogle.error.message : "Erro desconhecido";
            alert(`🚨 O Google barrou a gente! O motivo foi: \n\n${motivoExato}`);
            throw new Error(`Erro 404 real: ${motivoExato}`);
        }

        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text;

        // Limpar markdown da IA
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        const steps = JSON.parse(aiText);

        // PASSA A VASSOURA
        tasksContainer.innerHTML = '';

        // Renderizar passos
        steps.forEach(step => {
            createTaskElement(step);
        });

        taskInput.value = '';

    } catch (error) {
        console.error('Erro ao gerar tarefas:', error);
        createTaskElement(inputValue);
        taskInput.value = '';
    } finally {
        addBtn.textContent = '+';
        addBtn.disabled = false;
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// ==========================================
// FÁBRICA DE TAREFAS (Com salvamento de moedas)
// ==========================================
function createTaskElement(text) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = text;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            totalCoins += 10;
            taskText.classList.add('completed');
            coinCount.textContent = totalCoins;
            
            // Salva as moedas no celular do jurado!
            localStorage.setItem('anakinCoins', totalCoins);
            
            taskDiv.classList.add('removing');

            setTimeout(() => {
                taskDiv.remove();
            }, 500);

        } else {
            totalCoins -= 10;
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
// SISTEMA DA LOJA (PREÇO DE PITCH: 20 MOEDAS)
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
            
            // Salva a compra e o novo saldo!
            localStorage.setItem('anakinCoins', totalCoins);
            localStorage.setItem('anakinDracula', 'true');
            ownsDracula = true;
            
            // Isso vai colar a classe nova no gato principal!
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