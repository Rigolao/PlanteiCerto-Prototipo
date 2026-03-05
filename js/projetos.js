// --- CRUD de Projetos (localStorage) ---

const PROJETOS_KEY = 'plantei_certo_projetos';

function getProjetos() {
    return JSON.parse(localStorage.getItem(PROJETOS_KEY) || '[]');
}

function salvarProjetos(projetos) {
    localStorage.setItem(PROJETOS_KEY, JSON.stringify(projetos));
}

function listarProjetosDoUsuario(usuarioId) {
    return getProjetos().filter(p => p.usuarioId === usuarioId);
}

function criarProjeto(usuarioId, nome, descricao) {
    const projetos = getProjetos();
    const novo = {
        id: 'proj_' + Date.now(),
        usuarioId: usuarioId,
        nome: nome.trim(),
        descricao: descricao.trim(),
        dataCriacao: new Date().toISOString(),
        centroMapa: { lat: -21.1767, lng: -47.8208, zoom: 14 },
        pontos: []
    };
    projetos.push(novo);
    salvarProjetos(projetos);
    return novo;
}

function obterProjeto(projetoId) {
    return getProjetos().find(p => p.id === projetoId) || null;
}

function excluirProjeto(projetoId) {
    const projetos = getProjetos().filter(p => p.id !== projetoId);
    salvarProjetos(projetos);
}

function adicionarPonto(projetoId, lat, lng, arvoreId, observacao) {
    const projetos = getProjetos();
    const projeto = projetos.find(p => p.id === projetoId);
    if (!projeto) return null;

    const ponto = {
        id: 'pt_' + Date.now(),
        lat: lat,
        lng: lng,
        arvoreId: arvoreId,
        observacao: observacao || ''
    };
    projeto.pontos.push(ponto);
    salvarProjetos(projetos);
    return ponto;
}

function removerPonto(projetoId, pontoId) {
    const projetos = getProjetos();
    const projeto = projetos.find(p => p.id === projetoId);
    if (!projeto) return;

    projeto.pontos = projeto.pontos.filter(pt => pt.id !== pontoId);
    salvarProjetos(projetos);
}

function salvarCentroMapa(projetoId, lat, lng, zoom) {
    const projetos = getProjetos();
    const projeto = projetos.find(p => p.id === projetoId);
    if (!projeto) return;

    projeto.centroMapa = { lat, lng, zoom };
    salvarProjetos(projetos);
}
