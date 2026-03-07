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
        // MUDANÇA AQUI: Usando o "flash-latest" para forçar o Google a achar o modelo
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `O usuário precisa fazer a tarefa: "${inputValue}". Quebre essa tarefa em micro-passos sequenciais, absurdamente fáceis e focados na ação física. Analise a complexidade da tarefa e crie a quantidade ideal de passos necessários (geralmente entre 2 e 6 passos). Responda APENAS em formato JSON válido, sendo um array de strings, neste formato: ["passo 1", "passo 2", "passo N"]`
                    }]
                }]
            })
        });

        // O NOVO DEDO-DURO: Vai mostrar o erro exato na sua tela se falhar!
        if (!response.ok) {
            const erroGoogle = await response.json();
            // Pega a mensagem de erro que estava escondida dentro do "Object"
            const motivoExato = erroGoogle.error ? erroGoogle.error.message : "Erro desconhecido";
            
            alert(`🚨 O Google barrou a gente! O motivo foi: \n\n${motivoExato}`);
            throw new Error(`Erro 404 real: ${motivoExato}`);
        }

        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text;
        
        // Limpar markdown da IA
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const steps = JSON.parse(aiText);
        
        // PASSA A VASSOURA: Limpa as sidequests antigas antes de colocar as novas!
        tasksContainer.innerHTML = '';
        
        // Renderizar passos
        steps.forEach(step => {
            createTaskElement(step);
        });

        taskInput.value = '';
        
    } catch (error) {
        console.error('Erro ao gerar tarefas:', error);
        
        // Fallback caso a API falhe
        createTaskElement(inputValue);
        taskInput.value = '';
    } finally {
        addBtn.textContent = '+';
        addBtn.disabled = false;
    }
});

// Permitir adicionar tarefa apertando Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

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
            // Ganha a moeda e risca o texto
            totalCoins += 10;
            taskText.classList.add('completed');
            coinCount.textContent = totalCoins;
            
            // A MÁGICA: Adiciona a classe que ativa a animação de saída
            taskDiv.classList.add('removing');
            
            // Espera 500 milissegundos (meio segundo) e deleta o item do HTML
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