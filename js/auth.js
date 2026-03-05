// --- Autenticação Simulada (localStorage) ---
// ATENÇÃO: Isso é apenas um protótipo. NÃO use btoa() como hash de senha em produção.

const AUTH_USERS_KEY = 'plantei_certo_users';
const AUTH_SESSAO_KEY = 'plantei_certo_sessao';

function getUsuarios() {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
}

function salvarUsuarios(users) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function cadastrarUsuario(nome, email, senha) {
    const users = getUsuarios();
    if (users.find(u => u.email === email)) {
        return { ok: false, erro: 'Este e-mail já está cadastrado.' };
    }
    const novoUser = {
        id: 'usr_' + Date.now(),
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: btoa(senha) // Apenas protótipo!
    };
    users.push(novoUser);
    salvarUsuarios(users);
    // Login automático após cadastro
    const sessao = { id: novoUser.id, nome: novoUser.nome, email: novoUser.email };
    localStorage.setItem(AUTH_SESSAO_KEY, JSON.stringify(sessao));
    return { ok: true, usuario: sessao };
}

function loginUsuario(email, senha) {
    const users = getUsuarios();
    const user = users.find(u => u.email === email.trim().toLowerCase() && u.senha === btoa(senha));
    if (!user) {
        return { ok: false, erro: 'E-mail ou senha incorretos.' };
    }
    const sessao = { id: user.id, nome: user.nome, email: user.email };
    localStorage.setItem(AUTH_SESSAO_KEY, JSON.stringify(sessao));
    return { ok: true, usuario: sessao };
}

function logoutUsuario() {
    localStorage.removeItem(AUTH_SESSAO_KEY);
}

function getUsuarioLogado() {
    const data = localStorage.getItem(AUTH_SESSAO_KEY);
    return data ? JSON.parse(data) : null;
}

function isLogado() {
    return getUsuarioLogado() !== null;
}
