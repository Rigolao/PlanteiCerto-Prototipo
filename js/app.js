// --- App Principal ---

let termoBusca = "";
let filtroAtivo = "todos";

// --- Elementos do DOM ---
const grid = document.getElementById('cardGrid');
const inputBusca = document.getElementById('searchInput');
const botoesFiltro = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('treeModal');
const btnCloseModal = document.getElementById('closeModal');

// Auth
const authArea = document.getElementById('authArea');
const authModal = document.getElementById('authModal');
const tabProjetos = document.getElementById('tabProjetos');

// Seções
const secaoArvores = document.getElementById('secaoArvores');
const secaoProjetos = document.getElementById('secaoProjetos');

// Drawer
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const hamburgerBtn = document.getElementById('hamburgerBtn');

// ===========================================
// DRAWER (Menu Hambúrguer)
// ===========================================

function abrirDrawer() {
    drawer.classList.add('active');
    drawerOverlay.classList.add('active');
    hamburgerBtn.classList.add('active');
}

function fecharDrawer() {
    drawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    hamburgerBtn.classList.remove('active');
}

hamburgerBtn.addEventListener('click', () => {
    if (drawer.classList.contains('active')) fecharDrawer();
    else abrirDrawer();
});
drawerOverlay.addEventListener('click', fecharDrawer);
document.getElementById('drawerFechar').addEventListener('click', fecharDrawer);

// ===========================================
// RENDERIZAÇÃO DOS CARDS DE ÁRVORES
// ===========================================

function calcularPorcentagem(nota) {
    return (nota / 5) * 100;
}

function gerarHTMLAtributos(atributos, isModal = false) {
    let html = '';
    const categorias = [
        { id: 'compatibilidade', label: 'Boa para Calçadas e Ruas' },
        { id: 'limpeza', label: 'Menos Sujeira na Rua' },
        { id: 'clima', label: 'Benefício para o Clima' }
    ];

    categorias.forEach(cat => {
        const attrData = atributos[cat.id];
        html += `
            <div class="attr-item">
                <div class="attr-label"><span>${cat.label}</span><span>${attrData.nota}/5</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width: ${calcularPorcentagem(attrData.nota)}%"></div></div>
        `;
        if (isModal) {
            html += `
                <details class="attr-details">
                    <summary>Ver parâmetros e legenda</summary>
                    <p><strong>Significado:</strong> ${attrData.legenda}</p>
                    <ul class="sub-params">
                        ${attrData.sub.map(s => `<li>• ${s}</li>`).join('')}
                    </ul>
                </details>
            `;
        }
        html += `</div>`;
    });
    return html;
}

function renderCards(dados) {
    grid.innerHTML = "";
    if (dados.length === 0) {
        grid.innerHTML = `<div class="empty-state">Nenhuma árvore encontrada com estes critérios.</div>`;
        return;
    }
    dados.forEach(arvore => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${arvore.imagem}" alt="${arvore.nomePopular}">
            </div>
            <div class="card-content">
                <h2 class="card-title">${arvore.nomePopular}</h2>
                <p class="card-subtitle">${arvore.nomeCientifico}</p>
                <div class="attributes">
                    ${gerarHTMLAtributos(arvore.atributos, false)}
                </div>
            </div>
        `;
        card.addEventListener('click', () => abrirModalArvore(arvore));
        grid.appendChild(card);
    });
}

// ===========================================
// MODAL DE DETALHES DA ÁRVORE
// ===========================================

function abrirModalArvore(arvore) {
    document.getElementById('modalImg').src = arvore.imagem;
    document.getElementById('modalTitle').textContent = arvore.nomePopular;
    document.getElementById('modalSubtitle').textContent = arvore.nomeCientifico;
    document.getElementById('modalDesc').textContent = arvore.descricao;
    document.getElementById('modalAltura').textContent = arvore.altura;
    document.getElementById('modalRaiz').textContent = arvore.raiz;
    document.getElementById('modalEspacamento').textContent = arvore.espacamento;
    document.getElementById('modalAttributes').innerHTML = gerarHTMLAtributos(arvore.atributos, true);

    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function fecharModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

btnCloseModal.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });

// ===========================================
// MODAL DE AUTENTICAÇÃO
// ===========================================

function abrirAuthModal() {
    authModal.classList.add('active');
    document.body.classList.add('modal-open');
    mostrarFormLogin();
}

function fecharAuthModal() {
    authModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.getElementById('authErro').style.display = 'none';
}

document.getElementById('closeAuthModal').addEventListener('click', fecharAuthModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) fecharAuthModal(); });

function mostrarFormLogin() {
    document.getElementById('authFormTitulo').textContent = 'Entrar';
    document.getElementById('authNomeGroup').style.display = 'none';
    document.getElementById('authSubmitBtn').textContent = 'Entrar';
    document.getElementById('authToggleLink').textContent = 'Não tem conta? Cadastre-se';
    document.getElementById('authFormEl').setAttribute('data-mode', 'login');
    document.getElementById('authErro').style.display = 'none';
}

function mostrarFormCadastro() {
    document.getElementById('authFormTitulo').textContent = 'Criar Conta';
    document.getElementById('authNomeGroup').style.display = 'block';
    document.getElementById('authSubmitBtn').textContent = 'Cadastrar';
    document.getElementById('authToggleLink').textContent = 'Já tem conta? Entre aqui';
    document.getElementById('authFormEl').setAttribute('data-mode', 'cadastro');
    document.getElementById('authErro').style.display = 'none';
}

document.getElementById('authToggleLink').addEventListener('click', function () {
    const mode = document.getElementById('authFormEl').getAttribute('data-mode');
    if (mode === 'login') mostrarFormCadastro();
    else mostrarFormLogin();
});

document.getElementById('authFormEl').addEventListener('submit', function (e) {
    e.preventDefault();
    const mode = this.getAttribute('data-mode');
    const email = document.getElementById('authEmail').value;
    const senha = document.getElementById('authSenha').value;
    const erroEl = document.getElementById('authErro');

    if (mode === 'login') {
        const res = loginUsuario(email, senha);
        if (!res.ok) {
            erroEl.textContent = res.erro;
            erroEl.style.display = 'block';
        } else {
            fecharAuthModal();
            atualizarUIAuth();
            this.reset();
        }
    } else {
        const nome = document.getElementById('authNome').value;
        if (!nome.trim()) {
            erroEl.textContent = 'Preencha seu nome.';
            erroEl.style.display = 'block';
            return;
        }
        const res = cadastrarUsuario(nome, email, senha);
        if (!res.ok) {
            erroEl.textContent = res.erro;
            erroEl.style.display = 'block';
        } else {
            fecharAuthModal();
            atualizarUIAuth();
            this.reset();
        }
    }
});

function atualizarUIAuth() {
    const user = getUsuarioLogado();
    if (user) {
        authArea.innerHTML = `
            <span class="nome-usuario">${user.nome}</span>
            <button class="btn-sair" id="btnSair">Sair</button>
        `;
        document.getElementById('btnSair').addEventListener('click', () => {
            logoutUsuario();
            atualizarUIAuth();
            trocarAba('arvores');
        });
        tabProjetos.style.display = 'block';
    } else {
        authArea.innerHTML = `<button class="btn-entrar" id="btnEntrar">Entrar</button>`;
        document.getElementById('btnEntrar').addEventListener('click', abrirAuthModal);
        tabProjetos.style.display = 'none';
        if (secaoProjetos.classList.contains('active')) {
            trocarAba('arvores');
        }
    }
}

// ===========================================
// NAVEGAÇÃO POR ABAS (via Drawer)
// ===========================================

function trocarAba(nomeAba) {
    // Desativar seções
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    // Desativar links do drawer
    document.querySelectorAll('.drawer-link').forEach(b => b.classList.remove('active'));

    if (nomeAba === 'projetos') {
        secaoProjetos.classList.add('active');
        document.querySelector('.drawer-link[data-tab="projetos"]').classList.add('active');
        renderListaProjetos();
        document.getElementById('arvoresControles').style.display = 'none';
    } else {
        secaoArvores.classList.add('active');
        document.querySelector('.drawer-link[data-tab="arvores"]').classList.add('active');
        document.getElementById('arvoresControles').style.display = 'block';
    }

    fecharDrawer();
}

document.querySelectorAll('.drawer-link').forEach(btn => {
    btn.addEventListener('click', function () {
        const tab = this.getAttribute('data-tab');
        if (tab === 'projetos' && !isLogado()) {
            abrirAuthModal();
            fecharDrawer();
            return;
        }
        trocarAba(tab);
    });
});

// ===========================================
// SEÇÃO MEUS PROJETOS
// ===========================================

const projetosGrid = document.getElementById('projetosGrid');
const editorProjeto = document.getElementById('editorProjeto');
const listagemProjetos = document.getElementById('listagemProjetos');
const novoProjetoModal = document.getElementById('novoProjetoModal');

function renderListaProjetos() {
    const user = getUsuarioLogado();
    if (!user) return;

    listagemProjetos.style.display = 'block';
    editorProjeto.classList.remove('active');
    projetoAberto = null;

    const projetos = listarProjetosDoUsuario(user.id);
    projetosGrid.innerHTML = '';

    if (projetos.length === 0) {
        projetosGrid.innerHTML = `<div class="empty-state">Você ainda não tem projetos. Clique em "+ Novo Projeto" para começar!</div>`;
        return;
    }

    projetos.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'projeto-card';
        const data = new Date(proj.dataCriacao).toLocaleDateString('pt-BR');
        card.innerHTML = `
            <h3>${proj.nome}</h3>
            <div class="projeto-info">
                <span>${proj.descricao || 'Sem descrição'}</span>
                <span>${proj.pontos.length} árvore(s) plantada(s)</span>
                <span>Criado em: ${data}</span>
            </div>
            <div class="projeto-acoes">
                <button class="btn-acao btn-abrir" data-id="${proj.id}">Abrir</button>
                <button class="btn-acao btn-excluir" data-id="${proj.id}">Excluir</button>
            </div>
        `;
        projetosGrid.appendChild(card);
    });

    projetosGrid.querySelectorAll('.btn-abrir').forEach(btn => {
        btn.addEventListener('click', () => abrirEditor(btn.getAttribute('data-id')));
    });
    projetosGrid.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este projeto?')) {
                excluirProjeto(btn.getAttribute('data-id'));
                renderListaProjetos();
            }
        });
    });
}

// --- Novo Projeto Modal ---
document.getElementById('btnNovoProjeto').addEventListener('click', () => {
    novoProjetoModal.classList.add('active');
    document.body.classList.add('modal-open');
});

document.getElementById('closeNovoProjetoModal').addEventListener('click', () => {
    novoProjetoModal.classList.remove('active');
    document.body.classList.remove('modal-open');
});
novoProjetoModal.addEventListener('click', (e) => {
    if (e.target === novoProjetoModal) {
        novoProjetoModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
});

document.getElementById('formNovoProjeto').addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = document.getElementById('projetoNome').value;
    const desc = document.getElementById('projetoDesc').value;
    const user = getUsuarioLogado();
    if (!user || !nome.trim()) return;

    criarProjeto(user.id, nome, desc);
    this.reset();
    novoProjetoModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    renderListaProjetos();
});

// ===========================================
// EDITOR DE PROJETO (MAPA)
// ===========================================

function abrirEditor(projetoId) {
    const projeto = obterProjeto(projetoId);
    if (!projeto) return;

    projetoAberto = projetoId;
    listagemProjetos.style.display = 'none';
    editorProjeto.classList.add('active');

    document.getElementById('editorTitulo').textContent = projeto.nome;

    const mapa = inicializarMapa('mapaEditor', projeto.centroMapa, projeto.centroMapa.zoom);
    corrigirTamanhoMapa();

    carregarPontosNoMapa(projetoId);
    renderListaPontos(projetoId);
}

document.getElementById('btnVoltarProjetos').addEventListener('click', () => {
    projetoAberto = null;
    renderListaProjetos();
});

function renderListaPontos(projetoId) {
    const projeto = obterProjeto(projetoId);
    const lista = document.getElementById('pontosLista');
    const titulo = document.getElementById('pontosTitulo');

    if (!projeto || projeto.pontos.length === 0) {
        titulo.textContent = 'Nenhuma árvore adicionada ainda';
        lista.innerHTML = '';
        return;
    }

    titulo.textContent = `Árvores plantadas (${projeto.pontos.length}):`;
    lista.innerHTML = '';

    projeto.pontos.forEach(ponto => {
        const arvore = arbores.find(a => a.id === ponto.arvoreId);
        const li = document.createElement('li');
        li.className = 'ponto-item';
        li.innerHTML = `
            <div class="ponto-info">
                <span class="ponto-nome">${arvore ? arvore.nomePopular : 'Árvore desconhecida'}</span>
                ${ponto.observacao ? `<span class="ponto-obs">${ponto.observacao}</span>` : ''}
            </div>
            <button class="btn-remover-ponto" data-ponto-id="${ponto.id}">Remover</button>
        `;
        lista.appendChild(li);
    });

    lista.querySelectorAll('.btn-remover-ponto').forEach(btn => {
        btn.addEventListener('click', () => {
            const pontoId = btn.getAttribute('data-ponto-id');
            removerPonto(projetoId, pontoId);
            removerMarcadorDoMapa(pontoId);
            renderListaPontos(projetoId);
        });
    });
}

// ===========================================
// FILTROS DE ÁRVORES
// ===========================================

function aplicarFiltros() {
    let dadosFiltrados = arbores;
    if (termoBusca) {
        dadosFiltrados = dadosFiltrados.filter(a =>
            a.nomePopular.toLowerCase().includes(termoBusca.toLowerCase())
        );
    }
    if (filtroAtivo !== "todos") {
        dadosFiltrados = dadosFiltrados.filter(a => a.atributos[filtroAtivo].nota === 5);
    }
    renderCards(dadosFiltrados);
}

inputBusca.addEventListener('input', (e) => { termoBusca = e.target.value; aplicarFiltros(); });
botoesFiltro.forEach(botao => {
    botao.addEventListener('click', (e) => {
        botoesFiltro.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        filtroAtivo = e.target.getAttribute('data-filter');
        aplicarFiltros();
    });
});

// ===========================================
// ESCAPE PARA FECHAR TUDO
// ===========================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (drawer.classList.contains('active')) fecharDrawer();
        if (modal.classList.contains('active')) fecharModal();
        if (authModal.classList.contains('active')) fecharAuthModal();
        if (novoProjetoModal.classList.contains('active')) {
            novoProjetoModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
});

// ===========================================
// INICIALIZAÇÃO
// ===========================================

renderCards(arbores);
atualizarUIAuth();
trocarAba('arvores');
