// --- BANCO DE DADOS FAKE (DADOS DE EXEMPLO) ---
        const mockData = {
            materias: [
                { id: 1, nome: "Algoritmos", desc: "Lógica de programação e estruturas de dados.", icone: "ph-code" },
                { id: 2, nome: "Web II", desc: "Desenvolvimento de aplicações web com frameworks.", icone: "ph-browser" },
                { id: 3, nome: "Sist. Distribuídos", desc: "Conceitos de sistemas distribuídos e microserviços.", icone: "ph-cloud" },
                { id: 4, nome: "Comércio Eletrônico", desc: "Estratégias e plataformas de e-commerce.", icone: "ph-shopping-cart-simple"}
            ],
            atividades: [
                { id: 1, titulo: "Implementar Fila", materiaId: 1, desc: "Criar uma estrutura de dados de Fila em Python.", dataEntrega: "2025-07-10" },
                { id: 2, titulo: "Criar API REST", materiaId: 2, desc: "Desenvolver uma API para um blog.", dataEntrega: "2025-07-05" },
                { id: 3, titulo: "Estudo de Caso", materiaId: 3, desc: "Analisar a arquitetura do Netflix.", dataEntrega: "2025-08-01" },
                { id: 4, titulo: "Plano de Negócios", materiaId: 4, desc: "Desenvolver um plano de negócios para uma loja virtual.", dataEntrega: "2025-07-20" },
            ],
            provas: [
                { id: 1, materiaId: 1, data: "2025-07-15", conteudo: "Complexidade de Algoritmos, Pilhas e Filas." },
                { id: 2, materiaId: 2, data: "2025-07-25", conteudo: "Hooks do React, State Management e Roteamento." }
            ]
        };

        // --- ESTADO DA APLICAÇÃO ---
        let state = {
            materias: JSON.parse(localStorage.getItem('faculdex_materias')) || mockData.materias,
            atividades: JSON.parse(localStorage.getItem('faculdex_atividades')) || mockData.atividades,
            provas: JSON.parse(localStorage.getItem('faculdex_provas')) || mockData.provas,
        };
        let activeScreen = 'screen-inicio';
        
        // --- SELETORES DO DOM ---
        const screens = document.querySelectorAll('.screen');
        const navButtons = document.querySelectorAll('.nav-button');
        const fabAddButton = document.getElementById('fab-add-button');

        // --- FUNÇÕES DE SALVAMENTO E UTILITÁRIOS ---
        function saveData() {
            localStorage.setItem('faculdex_materias', JSON.stringify(state.materias));
            localStorage.setItem('faculdex_atividades', JSON.stringify(state.atividades));
            localStorage.setItem('faculdex_provas', JSON.stringify(state.provas));
        }

        function generateId() {
            return Date.now();
        }

        // --- NAVEGAÇÃO ENTRE TELAS ---
        function showScreen(screenId) {
            screens.forEach(screen => screen.classList.add('hidden'));
            document.getElementById(screenId).classList.remove('hidden');
            activeScreen = screenId;

            navButtons.forEach(button => {
                const buttonScreen = button.getAttribute('data-screen');
                const icon = button.querySelector('i');
                if (`screen-${buttonScreen}` === screenId) {
                    button.classList.remove('text-slate-400');
                    button.classList.add('text-white');
                    icon.className = icon.className.replace(' ph', ' ph-fill');
                } else {
                    button.classList.add('text-slate-400');
                    button.classList.remove('text-white');
                    icon.className = icon.className.replace(' ph-fill', ' ph');
                }
            });

            // Gerenciar o botão de adicionar flutuante (FAB)
            fabAddButton.classList.add('hidden');
            if (screenId === 'screen-materias') {
                fabAddButton.onclick = openAddMateriaModal;
                fabAddButton.classList.remove('hidden');
            } else if (screenId === 'screen-atividades') {
                fabAddButton.onclick = openAddAtividadeModal;
                fabAddButton.classList.remove('hidden');
            } else if (screenId === 'screen-provas') {
                fabAddButton.onclick = openAddProvaModal;
                fabAddButton.classList.remove('hidden');
            }
            
            renderActiveScreen();
        }
        
        function renderActiveScreen() {
             switch(activeScreen) {
                case 'screen-inicio': renderInicio(); break;
                case 'screen-materias': renderMaterias(); break;
                case 'screen-atividades': renderAtividades(); break;
                case 'screen-provas': renderProvas(); break;
            }
        }

        // --- FUNÇÕES DE RENDERIZAÇÃO ---
        function renderInicio() {
            const today = new Date();
            document.getElementById('welcome-date').textContent = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

            const atividadesLista = document.getElementById('proximas-atividades-lista');
            const proximasAtividades = state.atividades
                .map(a => ({...a, dias: (new Date(a.dataEntrega) - today) / (1000 * 60 * 60 * 24)}))
                .filter(a => a.dias >= -1)
                .sort((a, b) => a.dias - b.dias)
                .slice(0, 3);
            
            atividadesLista.innerHTML = proximasAtividades.length > 0 ? proximasAtividades.map(atv => {
                 const materia = state.materias.find(m => m.id === atv.materiaId);
                 return `
                    <div class="bg-white p-3.5 rounded-lg shadow-sm border-l-4 border-acento flex justify-between items-center">
                        <div>
                            <p class="font-bold text-primaria text-sm">${atv.titulo}</p>
                            <p class="text-xs text-slate-500">${materia?.nome || 'Matéria não encontrada'}</p>
                        </div>
                        <div class="text-right flex-shrink-0 ml-2">
                            <p class="font-bold text-primaria text-sm">${new Date(atv.dataEntrega).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</p>
                            <p class="text-xs text-red-500 font-semibold">${Math.ceil(atv.dias)} dias</p>
                        </div>
                    </div>`;
            }).join('') : `<p class="text-slate-500 text-center text-sm p-4">Nenhuma atividade próxima. Descanse!</p>`;

            const materiasHomeLista = document.getElementById('inicio-materias-lista');
            materiasHomeLista.innerHTML = state.materias.slice(0, 4).map(mat => `
                <div class="bg-primaria text-white p-3 rounded-lg shadow-md flex flex-col justify-between aspect-square">
                    <i class="ph-bold ${mat.icone || 'ph-book'} text-2xl text-acento"></i>
                    <p class="font-bold text-sm mt-auto">${mat.nome}</p>
                </div>
            `).join('');
        }

        function renderMaterias() {
            const lista = document.getElementById('materias-lista');
            lista.innerHTML = state.materias.length > 0 ? state.materias.map(mat => {
                const hasAtividade = state.atividades.some(a => a.materiaId === mat.id && (new Date(a.dataEntrega) - new Date()) / (1000 * 60 * 60 * 24) <= 7);
                const hasProva = state.provas.some(p => p.materiaId === mat.id && (new Date(p.data) - new Date()) / (1000 * 60 * 60 * 24) <= 7);

                return `
                <div onclick="openMateriaModal(${mat.id})" class="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform">
                    <div class="flex items-center gap-3">
                        <i class="ph-bold ${mat.icone || 'ph-book'} text-xl text-primaria"></i>
                        <p class="font-bold text-primaria">${mat.nome}</p>
                    </div>
                    <div class="flex gap-3">
                        <i class="ph-bold ph-list-checks text-xl ${hasAtividade ? 'text-red-500' : 'text-slate-300'}"></i>
                        <i class="ph-bold ph-exam text-xl ${hasProva ? 'text-red-500' : 'text-slate-300'}"></i>
                    </div>
                </div>
            `}).join('') : `<p class="text-slate-500 text-center text-sm p-4">Nenhuma matéria adicionada ainda.</p>`;
        }
        
        function renderAtividades() {
            const lista = document.getElementById('atividades-lista');
             lista.innerHTML = state.atividades.length > 0 ? state.atividades.sort((a,b) => new Date(a.dataEntrega) - new Date(b.dataEntrega)).map(atv => {
                const materia = state.materias.find(m => m.id === atv.materiaId);
                 return `
                    <div onclick="openAtividadeModal(${atv.id})" class="bg-white p-3.5 rounded-lg shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                        <div class="flex justify-between items-start">
                             <div>
                                <p class="font-bold text-primaria">${atv.titulo}</p>
                                <span class="text-xs font-semibold bg-primaria text-white px-2 py-0.5 rounded-full mt-1 inline-block">${materia?.nome || 'N/A'}</span>
                            </div>
                            <p class="font-semibold text-acento text-sm">${new Date(atv.dataEntrega).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                        </div>
                    </div>
                 `
            }).join('') : `<p class="text-slate-500 text-center text-sm p-4">Nenhuma atividade adicionada ainda.</p>`;
        }
        
        function renderProvas() {
             const lista = document.getElementById('provas-lista');
             if(state.provas.length === 0) {
                 lista.innerHTML = `<p class="text-slate-500 text-center text-sm p-4">Nenhuma prova adicionada ainda.</p>`;
                 return;
             }
             const provasPorMateria = state.provas.reduce((acc, prova) => {
                 if (!acc[prova.materiaId]) acc[prova.materiaId] = [];
                 acc[prova.materiaId].push(prova);
                 return acc;
             }, {});

             lista.innerHTML = Object.keys(provasPorMateria).map(materiaId => {
                 const materia = state.materias.find(m => m.id == materiaId);
                 if (!materia) return ''; // Skip if materia was deleted
                 return `
                    <div>
                        <h3 class="font-bold text-base text-primaria mb-2">${materia.nome}</h3>
                        <div class="space-y-2">
                        ${provasPorMateria[materiaId].sort((a,b) => new Date(a.data) - new Date(b.data)).map(prova => `
                             <div onclick="openProvaModal(${prova.id})" class="bg-white p-3.5 rounded-lg shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform">
                                <p class="font-semibold text-slate-700">Prova</p>
                                <p class="font-bold text-acento text-sm">${new Date(prova.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                             </div>
                        `).join('')}
                        </div>
                    </div>
                 `;
             }).join('');
        }
        
        // --- FUNÇÕES DE MODAL (POP-UP) ---
        const modal = document.getElementById('modal');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');

        function openModal() {
            modalOverlay.classList.remove('hidden');
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.remove('translate-y-full'), 10);
        }

        function closeModal() {
            modal.classList.add('translate-y-full');
            setTimeout(() => {
                modalOverlay.classList.add('hidden');
                modal.classList.add('hidden');
                modalContent.innerHTML = ''; // Limpa o conteúdo ao fechar
            }, 300);
        }

        function openMateriaModal(id) {
            const materia = state.materias.find(m => m.id === id);
            modalContent.innerHTML = `
                <h2 class="text-xl font-bold text-primaria mb-2">${materia.nome}</h2>
                <p class="text-slate-600 text-sm">${materia.desc}</p>
                <div class="flex gap-2 mt-5">
                    <button onclick="confirmDeleteMateria(${id})" class="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg shadow hover:opacity-90">Apagar</button>
                </div>
            `;
            openModal();
        }
        
        function openAtividadeModal(id) {
            const atividade = state.atividades.find(a => a.id === id);
            const materia = state.materias.find(m => m.id === atividade.materiaId);
            modalContent.innerHTML = `
                <h2 class="text-xl font-bold text-primaria mb-1">${atividade.titulo}</h2>
                <span class="text-xs font-semibold bg-primaria text-white px-2 py-0.5 rounded-full">${materia?.nome || 'N/A'}</span>
                <p class="text-slate-600 my-3 text-sm">${atividade.desc}</p>
                <hr>
                <div class="mt-3">
                    <p class="font-bold text-primaria text-sm">Data de Entrega:</p>
                    <p class="text-acento font-bold">${new Date(atividade.dataEntrega).toLocaleDateString('pt-BR', {timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric'})}</p>
                </div>
                <div class="flex gap-2 mt-5">
                    <button onclick="deleteAtividade(${id})" class="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg shadow hover:opacity-90">Apagar</button>
                    <button onclick="showEditAtividadeForm(${id})" class="flex-1 bg-acento text-primaria font-bold py-2.5 rounded-lg shadow hover:opacity-90">Editar</button>
                </div>
            `;
            openModal();
        }

        function openProvaModal(id) {
            const prova = state.provas.find(p => p.id === id);
            const materia = state.materias.find(m => m.id === prova.materiaId);
            modalContent.innerHTML = `
                <h2 class="text-xl font-bold text-primaria mb-1">Prova de ${materia?.nome || 'N/A'}</h2>
                <div class="mt-3">
                    <p class="font-bold text-primaria text-sm">Data da Prova:</p>
                    <p class="text-acento font-bold">${new Date(prova.data).toLocaleDateString('pt-BR', {timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric'})}</p>
                </div>
                <hr class="my-3">
                <div>
                    <p class="font-bold text-primaria text-sm">Conteúdos:</p>
                    <p class="text-slate-600 text-sm">${prova.conteudo}</p>
                </div>
                <div class="flex gap-2 mt-5">
                    <button onclick="deleteProva(${id})" class="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg shadow hover:opacity-90">Apagar</button>
                    <button onclick="showEditProvaForm(${id})" class="flex-1 bg-acento text-primaria font-bold py-2.5 rounded-lg shadow hover:opacity-90">Editar</button>
                </div>
            `;
            openModal();
        }

        // --- FUNÇÕES DE ADICIONAR (abre o formulário no modal) ---
        function getFormHTML(type, id) {
            const isEdit = id !== undefined;
            let item, title, submitText, formAction;

            const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:border-acento focus:ring-1 ring-acento text-sm";
            const labelClasses = "block text-sm font-medium text-slate-700";
            const textareaClasses = `${inputClasses} min-h-[60px]`;
            
            let materiaOptions = state.materias.map(m => `<option value="${m.id}">${m.nome}</option>`).join('');

            switch(type) {
                case 'materia':
                    title = isEdit ? 'Editar Matéria' : 'Adicionar Matéria';
                    submitText = isEdit ? 'Salvar Alterações' : 'Salvar Matéria';
                    formAction = isEdit ? `updateMateria(event, ${id})` : `addMateria(event)`;
                    item = isEdit ? state.materias.find(m => m.id === id) : { nome: '', desc: '' };
                    return `
                        <h2 class="text-xl font-bold text-primaria mb-4">${title}</h2>
                        <form onsubmit="${formAction}" class="space-y-3">
                            <div>
                                <label class="${labelClasses}">Nome da Matéria</label>
                                <input type="text" name="nome" required value="${item.nome}" class="${inputClasses}">
                            </div>
                            <div>
                                <label class="${labelClasses}">Descrição</label>
                                <textarea name="desc" class="${textareaClasses}">${item.desc}</textarea>
                            </div>
                            <button type="submit" class="w-full bg-primaria text-white font-bold py-2.5 mt-2 rounded-lg shadow hover:opacity-90">${submitText}</button>
                        </form>
                    `;
                case 'atividade':
                    title = isEdit ? 'Editar Atividade' : 'Adicionar Atividade';
                    submitText = isEdit ? 'Salvar Alterações' : 'Salvar Atividade';
                    formAction = isEdit ? `updateAtividade(event, ${id})` : `addAtividade(event)`;
                    item = isEdit ? state.atividades.find(a => a.id === id) : { titulo: '', materiaId: '', desc: '', dataEntrega: '' };
                    materiaOptions = state.materias.map(m => `<option value="${m.id}" ${m.id === item.materiaId ? 'selected' : ''}>${m.nome}</option>`).join('');
                    return `
                        <h2 class="text-xl font-bold text-primaria mb-4">${title}</h2>
                        <form onsubmit="${formAction}" class="space-y-3">
                            <div><label class="${labelClasses}">Título</label><input type="text" name="titulo" required value="${item.titulo}" class="${inputClasses}"></div>
                            <div><label class="${labelClasses}">Matéria</label><select name="materiaId" required class="${inputClasses}">${materiaOptions}</select></div>
                            <div><label class="${labelClasses}">Descrição</label><textarea name="desc" class="${textareaClasses}">${item.desc}</textarea></div>
                            <div><label class="${labelClasses}">Data de Entrega</label><input type="date" name="dataEntrega" required value="${item.dataEntrega}" class="${inputClasses}"></div>
                            <button type="submit" class="w-full bg-primaria text-white font-bold py-2.5 mt-2 rounded-lg shadow hover:opacity-90">${submitText}</button>
                        </form>
                    `;
                case 'prova':
                    title = isEdit ? 'Editar Prova' : 'Adicionar Prova';
                    submitText = isEdit ? 'Salvar Alterações' : 'Salvar Prova';
                    formAction = isEdit ? `updateProva(event, ${id})` : `addProva(event)`;
                    item = isEdit ? state.provas.find(p => p.id === id) : { materiaId: '', data: '', conteudo: '' };
                    materiaOptions = state.materias.map(m => `<option value="${m.id}" ${m.id === item.materiaId ? 'selected' : ''}>${m.nome}</option>`).join('');
                    return `
                        <h2 class="text-xl font-bold text-primaria mb-4">${title}</h2>
                        <form onsubmit="${formAction}" class="space-y-3">
                            <div><label class="${labelClasses}">Matéria</label><select name="materiaId" required class="${inputClasses}">${materiaOptions}</select></div>
                            <div><label class="${labelClasses}">Data da Prova</label><input type="date" name="data" required value="${item.data}" class="${inputClasses}"></div>
                            <div><label class="${labelClasses}">Conteúdo</label><textarea name="conteudo" required class="${textareaClasses}">${item.conteudo}</textarea></div>
                            <button type="submit" class="w-full bg-primaria text-white font-bold py-2.5 mt-2 rounded-lg shadow hover:opacity-90">${submitText}</button>
                        </form>
                    `;
            }
        }
        
        function openAddMateriaModal() { modalContent.innerHTML = getFormHTML('materia'); openModal(); }
        function openAddAtividadeModal() {
            if (state.materias.length === 0) {
                modalContent.innerHTML = `<p class="text-center text-slate-600 text-sm py-4">Você precisa adicionar uma matéria primeiro.</p>`;
            } else {
                modalContent.innerHTML = getFormHTML('atividade');
            }
            openModal();
        }
        function openAddProvaModal() {
            if (state.materias.length === 0) {
                modalContent.innerHTML = `<p class="text-center text-slate-600 text-sm py-4">Você precisa adicionar uma matéria primeiro.</p>`;
            } else {
                modalContent.innerHTML = getFormHTML('prova');
            }
            openModal();
        }
        
        // --- FUNÇÕES DE EDIÇÃO (abre o formulário de edição no modal) ---
        function showEditAtividadeForm(id) { modalContent.innerHTML = getFormHTML('atividade', id); }
        function showEditProvaForm(id) { modalContent.innerHTML = getFormHTML('prova', id); }

        // --- FUNÇÕES DE LÓGICA (CRUD: Create, Read, Update, Delete) ---
        function addMateria(event) {
            event.preventDefault();
            const form = event.target;
            const newMateria = { id: generateId(), nome: form.nome.value, desc: form.desc.value, icone: 'ph-book-open' };
            state.materias.push(newMateria);
            saveData(); closeModal(); renderMaterias();
        }
        
        function addAtividade(event) {
            event.preventDefault();
            const form = event.target;
            const newAtividade = { id: generateId(), titulo: form.titulo.value, materiaId: parseInt(form.materiaId.value), desc: form.desc.value, dataEntrega: form.dataEntrega.value };
            state.atividades.push(newAtividade);
            saveData(); closeModal(); renderAtividades();
        }

        function addProva(event) {
            event.preventDefault();
            const form = event.target;
            const newProva = { id: generateId(), materiaId: parseInt(form.materiaId.value), data: form.data.value, conteudo: form.conteudo.value };
            state.provas.push(newProva);
            saveData(); closeModal(); renderProvas();
        }
        
        function updateAtividade(event, id) {
            event.preventDefault();
            const form = event.target;
            const atividadeIndex = state.atividades.findIndex(a => a.id === id);
            if (atividadeIndex > -1) {
                state.atividades[atividadeIndex] = { id: id, titulo: form.titulo.value, materiaId: parseInt(form.materiaId.value), desc: form.desc.value, dataEntrega: form.dataEntrega.value };
                saveData(); closeModal(); renderActiveScreen();
            }
        }

        function updateProva(event, id) {
            event.preventDefault();
            const form = event.target;
            const provaIndex = state.provas.findIndex(p => p.id === id);
            if (provaIndex > -1) {
                state.provas[provaIndex] = { id: id, materiaId: parseInt(form.materiaId.value), data: form.data.value, conteudo: form.conteudo.value };
                saveData(); closeModal(); renderActiveScreen();
            }
        }

        function deleteAtividade(id) {
            state.atividades = state.atividades.filter(a => a.id !== id);
            saveData(); closeModal(); renderActiveScreen();
        }

        function deleteProva(id) {
            state.provas = state.provas.filter(p => p.id !== id);
            saveData(); closeModal(); renderActiveScreen();
        }

        function confirmDeleteMateria(id) {
            const materia = state.materias.find(m => m.id === id);
            modalContent.innerHTML = `
                <h2 class="text-xl font-bold text-primaria mb-2">Confirmar Exclusão</h2>
                <p class="text-slate-600 text-sm mb-4">Tem a certeza de que quer apagar a matéria <strong class="text-primaria">${materia.nome}</strong>? Todas as atividades e provas associadas serão também apagadas permanentemente.</p>
                 <div class="flex gap-2 mt-5">
                    <button onclick="closeModal()" class="flex-1 bg-slate-200 text-slate-800 font-bold py-2.5 rounded-lg hover:opacity-90">Cancelar</button>
                    <button onclick="deleteMateria(${id})" class="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg shadow hover:opacity-90">Sim, Apagar</button>
                </div>
            `;
        }

        function deleteMateria(id) {
            state.materias = state.materias.filter(m => m.id !== id);
            state.atividades = state.atividades.filter(a => a.materiaId !== id);
            state.provas = state.provas.filter(p => p.materiaId !== id);
            saveData(); closeModal(); renderActiveScreen();
        }


        // --- INICIALIZAÇÃO E EVENT LISTENERS ---
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('nav-bar').addEventListener('click', (e) => {
                const targetButton = e.target.closest('.nav-button');
                if (targetButton) {
                    showScreen(`screen-${targetButton.dataset.screen}`);
                }
            });
            
            modalOverlay.addEventListener('click', closeModal);

            showScreen('screen-inicio');
            
            if (!localStorage.getItem('faculdex_materias')) {
                saveData();
            }
        });