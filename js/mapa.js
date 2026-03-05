// --- Integração com Leaflet.js ---

const RIBEIRAO_PRETO = [-21.1767, -47.8208];
const ZOOM_INICIAL = 14;

let mapaAtual = null;
let marcadores = [];
let projetoAberto = null;

function inicializarMapa(containerId, centro, zoom) {
    // Destruir mapa anterior se existir
    if (mapaAtual) {
        mapaAtual.remove();
        mapaAtual = null;
    }
    marcadores = [];

    const lat = centro ? centro.lat : RIBEIRAO_PRETO[0];
    const lng = centro ? centro.lng : RIBEIRAO_PRETO[1];
    const z = zoom || ZOOM_INICIAL;

    mapaAtual = L.map(containerId).setView([lat, lng], z);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapaAtual);

    // Clique no mapa para adicionar ponto
    mapaAtual.on('click', function (e) {
        if (!projetoAberto) return;
        abrirPopupSelecao(e.latlng);
    });

    // Salvar posição ao mover o mapa
    mapaAtual.on('moveend', function () {
        if (!projetoAberto) return;
        const center = mapaAtual.getCenter();
        salvarCentroMapa(projetoAberto, center.lat, center.lng, mapaAtual.getZoom());
    });

    return mapaAtual;
}

function corrigirTamanhoMapa() {
    if (mapaAtual) {
        setTimeout(() => mapaAtual.invalidateSize(), 100);
    }
}

function criarIconeArvore(nomeArvore) {
    return L.divIcon({
        className: 'marker-arvore-wrapper',
        html: `<div class="marker-custom">${nomeArvore}</div>`,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
    });
}

function adicionarMarcadorNoMapa(ponto) {
    const arvore = arbores.find(a => a.id === ponto.arvoreId);
    if (!arvore) return;

    const marker = L.marker([ponto.lat, ponto.lng], {
        icon: criarIconeArvore(arvore.nomePopular)
    }).addTo(mapaAtual);

    const tooltipText = ponto.observacao
        ? `${arvore.nomePopular} - ${ponto.observacao}`
        : arvore.nomePopular;
    marker.bindTooltip(tooltipText);

    marker.pontoId = ponto.id;
    marcadores.push(marker);
}

function removerMarcadorDoMapa(pontoId) {
    const idx = marcadores.findIndex(m => m.pontoId === pontoId);
    if (idx !== -1) {
        mapaAtual.removeLayer(marcadores[idx]);
        marcadores.splice(idx, 1);
    }
}

function carregarPontosNoMapa(projetoId) {
    const projeto = obterProjeto(projetoId);
    if (!projeto) return;

    projeto.pontos.forEach(ponto => adicionarMarcadorNoMapa(ponto));
}

function abrirPopupSelecao(latlng) {
    let html = '<div class="popup-selecao">';
    html += '<h4>Escolha a árvore:</h4>';
    arbores.forEach(a => {
        html += `<button class="popup-arvore-btn" data-arvore-id="${a.id}">
            ${a.nomePopular} (Calçada: ${a.atributos.compatibilidade.nota}/5)
        </button>`;
    });
    html += '<input type="text" class="popup-obs-input" placeholder="Observação (opcional)">';
    html += '</div>';

    const popup = L.popup({ maxWidth: 250, closeOnClick: false })
        .setLatLng(latlng)
        .setContent(html)
        .openOn(mapaAtual);

    // Aguardar o popup ser adicionado ao DOM para adicionar event listeners
    setTimeout(() => {
        const botoes = document.querySelectorAll('.popup-arvore-btn');
        botoes.forEach(btn => {
            btn.addEventListener('click', function () {
                const arvoreId = parseInt(this.getAttribute('data-arvore-id'));
                const obsInput = document.querySelector('.popup-obs-input');
                const obs = obsInput ? obsInput.value : '';

                const ponto = adicionarPonto(projetoAberto, latlng.lat, latlng.lng, arvoreId, obs);
                if (ponto) {
                    adicionarMarcadorNoMapa(ponto);
                    renderListaPontos(projetoAberto);
                }
                mapaAtual.closePopup();
            });
        });
    }, 50);
}
