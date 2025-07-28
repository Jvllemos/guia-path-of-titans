// Adiciona um listener que espera todo o HTML ser carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================================
    // 1. VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
    // =================================================================================
    
    // Armazena a lista completa de dinossauros vinda do JSON
    let todosOsDinos = [];
    
    // Objeto que guarda os valores atuais dos filtros selecionados
    let filtrosAtivos = { dieta: 'Todos', tipo: 'Todos' };
    
    // String que guarda o texto digitado na barra de pesquisa
    let termoBusca = '';
    
    // String que guarda a opção de ordenação atual
    let ordemAtual = 'padrao';

    // Captura as referências para os elementos HTML que vamos manipular
    const galeriaContainer = document.getElementById('galeria-container');
    const barraPesquisa = document.getElementById('barra-pesquisa');
    const botoesFiltro = document.querySelectorAll('.grupo-filtro button');
    const seletorOrdem = document.getElementById('seletor-ordem');
    const botaoTopo = document.getElementById('botao-topo');
    
    // Referências específicas para o Modal de Detalhes
    const modalContainer = document.getElementById('modal-container');
    const modalCorpo = document.querySelector('.modal-corpo');
    const modalFechar = document.querySelector('.modal-fechar');

    // =================================================================================
    // 2. LÓGICA DE DADOS E RENDERIZAÇÃO
    // =================================================================================

    // Função assíncrona para buscar os dados do arquivo dinos.json
    async function carregarDadosDinos() {
        try {
            const resposta = await fetch('dinos.json');
            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
            todosOsDinos = await resposta.json();
            renderizarDinos(); // Chama a renderização inicial após carregar os dados
        } catch (erro) {
            galeriaContainer.innerHTML = `<p class="mensagem-nenhum-resultado">Falha ao carregar dados dos dinossauros.</p>`;
            console.error("Erro ao carregar dinos.json:", erro);
        }
    }

    // Função principal que processa e exibe os dinossauros na tela
    function renderizarDinos() {
        // Cria uma cópia do array original para não modificá-lo
        let dinosProcessados = [...todosOsDinos];

        // Etapa de Filtragem: aplica os filtros de busca, dieta e tipo
        if (termoBusca) {
            dinosProcessados = dinosProcessados.filter(dino => dino.name.toLowerCase().includes(termoBusca));
        }
        if (filtrosAtivos.dieta !== 'Todos') {
            dinosProcessados = dinosProcessados.filter(dino => dino.dieta === filtrosAtivos.dieta);
        }
        if (filtrosAtivos.tipo !== 'Todos') {
             dinosProcessados = dinosProcessados.filter(dino => dino.tipo === filtrosAtivos.tipo);
        }

        // Etapa de Ordenação: aplica a ordenação com base na seleção do usuário
        if (ordemAtual === 'nome-asc') {
            dinosProcessados.sort((a, b) => a.name.localeCompare(b.name));
        } else if (ordemAtual === 'dano-desc') {
            dinosProcessados.sort((a, b) => b.estatisticas.Dano.length - a.estatisticas.Dano.length);
        } else if (ordemAtual === 'defesa-desc') {
            dinosProcessados.sort((a, b) => b.estatisticas.Defesa.length - a.estatisticas.Defesa.length);
        } else if (ordemAtual === 'velocidade-desc') {
            dinosProcessados.sort((a, b) => b.estatisticas['Velocidade em terra'].length - a.estatisticas['Velocidade em terra'].length);
        }
        
        // Limpa o container antes de adicionar os novos cards
        galeriaContainer.innerHTML = "";

        // Etapa de Exibição: cria e insere o HTML dos cards no container
        if (dinosProcessados.length === 0) {
            galeriaContainer.innerHTML = `<p class="mensagem-nenhum-resultado">Nenhuma criatura encontrada.</p>`;
        } else {
            dinosProcessados.forEach(dino => {
                galeriaContainer.innerHTML += criarCardDino(dino);
            });
        }
    }

    // Função que gera o HTML de um único card de dinossauro (para a galeria)
    function criarCardDino(dino) {
        return `
            <div class="card-dino" data-name="${dino.name}">
                <div class="card-imagem-container">
                    <img class="dino-imagem" src="${dino.imagem}" alt="Arte do ${dino.name}">
                    <div class="dino-dieta dieta-${dino.dieta.toLowerCase()}">${dino.dieta}</div>
                    <div class="dino-tipo">${dino.tipo}</div>
                </div>
                <div class="card-body">
                    <h2 class="dino-name">${dino.name}</h2>
                    <p class="dino-descricao">${dino.descricao.substring(0, 100)}...</p>
                </div>
            </div>
        `;
    }

    // =================================================================================
    // 3. LÓGICA DO MODAL DE DETALHES
    // =================================================================================

    // Preenche o modal com os dados do dino clicado e o exibe
    function abrirModalDetalhes(dino) {
        let estatisticasHtml = '';
        for (const [stat, valor] of Object.entries(dino.estatisticas)) {
            estatisticasHtml += `<div class="stat"><span class="stat-name">${stat}</span><span class="stat-value">${valor}</span></div>`;
        }
        let subespeciesHtml = '';
        dino.subespecies.forEach(sub => {
            subespeciesHtml += `<li class="subspecie-item"><span class="subspecie-name">${sub.nome}</span><span class="subspecie-bonus">${sub.bonus}</span></li>`;
        });

        modalCorpo.innerHTML = `
            <div class="modal-imagem-container">
                <img src="${dino.imagem}" alt="Arte do ${dino.name}" class="modal-imagem">
            </div>
            <div class="modal-info">
                <h2>${dino.name}</h2>
                <div class="modal-tags">
                    <span class="modal-tag dieta-${dino.dieta.toLowerCase()}">${dino.dieta}</span>
                    <span class="modal-tag">${dino.tipo}</span>
                </div>
                <p class="modal-descricao">${dino.descricao}</p>
                <div class="separator"></div>
                <h3 class="section-title">Estatísticas</h3>
                <div class="stats-grid">${estatisticasHtml}</div>
                <div class="separator"></div>
                <h3 class="section-title">Subespécies</h3>
                <ul class="subespecies-lista">${subespeciesHtml}</ul>
            </div>
        `;
        
        modalContainer.classList.remove('modal-escondido');
        document.body.classList.add('modal-aberto');
    }

    // Esconde o modal e libera a rolagem da página
    function fecharModal() {
        modalContainer.classList.add('modal-escondido');
        document.body.classList.remove('modal-aberto');
    }

    // =================================================================================
    // 4. EVENT LISTENERS (Ouvintes de Eventos)
    // =================================================================================

    // Listener principal da galeria para abrir o modal de detalhes (delegação de evento)
    galeriaContainer.addEventListener('click', (evento) => {
        const card = evento.target.closest('.card-dino');
        if (card) {
            const nomeDoDino = card.dataset.name;
            const dinoSelecionado = todosOsDinos.find(d => d.name === nomeDoDino);
            if (dinoSelecionado) {
                abrirModalDetalhes(dinoSelecionado);
            }
        }
    });

    // Listeners para fechar o modal
    modalFechar.addEventListener('click', fecharModal);
    modalContainer.addEventListener('click', (evento) => {
        if (evento.target === modalContainer) {
            fecharModal();
        }
    });
    window.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && !modalContainer.classList.contains('modal-escondido')) {
            fecharModal();
        }
    });

    // Listener para a barra de pesquisa
    barraPesquisa.addEventListener('input', (evento) => {
        termoBusca = evento.target.value.toLowerCase();
        renderizarDinos();
    });

    // Listener para os botões de filtro
    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', () => {
            document.querySelectorAll(`button[data-filtro="${botao.dataset.filtro}"]`).forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            filtrosAtivos[botao.dataset.filtro] = botao.dataset.valor;
            renderizarDinos();
        });
    });

    // Listener para o seletor de ordenação
    seletorOrdem.addEventListener('change', (evento) => {
        ordemAtual = evento.target.value;
        renderizarDinos();
    });
    
    // Listener para mostrar/esconder o botão "Voltar ao Topo"
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            botaoTopo.classList.remove('escondido');
        } else {
            botaoTopo.classList.add('escondido');
        }
    });

    // Listener para o clique no botão "Voltar ao Topo"
    botaoTopo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // =================================================================================
    // 5. INICIALIZAÇÃO
    // =================================================================================
    
    // A primeira chamada que inicia todo o processo
    carregarDadosDinos();
});