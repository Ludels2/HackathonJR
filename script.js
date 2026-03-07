let totalCoins = 0;

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const tasksContainer = document.getElementById('tasks-container');
const coinCount = document.getElementById('coin-count');

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
                        text: `O usuário precisa fazer a tarefa: "${inputValue}". Quebre essa tarefa em micro-passos sequenciais, fáceis e focados na ação física. Analise a complexidade da tarefa e crie a quantidade ideal de passos necessários (geralmente entre 2 e 6 passos). Responda APENAS em formato JSON válido, sendo um array de strings, neste formato: ["passo 1", "passo 2", "passo N"]`
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

// FÁBRICA DE TAREFAS
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
            taskDiv.classList.add('removing');

            setTimeout(() => {
                taskDiv.remove();
            }, 500);

        } else {
            totalCoins -= 10;
            taskText.classList.remove('completed');
            coinCount.textContent = totalCoins;
        }
    });

    taskDiv.appendChild(taskText);
    taskDiv.appendChild(checkbox);
    tasksContainer.appendChild(taskDiv);
}

// ==========================================
// SISTEMA DA LOJA
// ==========================================
const buyDraculaBtn = document.getElementById('buy-dracula-btn');
// AQUI ESTÁ A MÁGICA: Em vez de procurar um ID novo, pegamos o gato que já existe!
const anakinPet = document.querySelector('.sprite-animacao'); 
let ownsDracula = false;

if (buyDraculaBtn && anakinPet) {
    buyDraculaBtn.addEventListener('click', () => {
        if (ownsDracula) {
            alert('Você já tem o Anakin Drácula!');
            return;
        }

        if (totalCoins >= 50) {
            totalCoins -= 50;
            coinCount.textContent = totalCoins;
            
            ownsDracula = true;
            // Isso vai colar a classe nova no gato principal!
            anakinPet.classList.add('dracula-equipped'); 
            
            buyDraculaBtn.textContent = '🧛 Equipado!';
            buyDraculaBtn.disabled = true;
            
            alert('Miau-haha! O Drácula chegou!');
        } else {
            const faltam = 50 - totalCoins;
            alert(`Faltam ${faltam} moedas!`);
        }
    });
}