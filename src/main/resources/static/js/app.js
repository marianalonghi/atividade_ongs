import * as api from './api.js';
import { getPerfil, limparPerfil, PERFIS } from './state.js';
import { esc } from './components.js';
import { renderPerfil } from './views/perfil.js';
import { renderAdm } from './views/adm.js';
import { renderUsuario } from './views/usuario.js';
import { renderPadrinho } from './views/padrinho.js';

const app = document.getElementById('app');
const nomeOng = document.getElementById('ong-nome');
const perfilBadge = document.getElementById('perfil-badge');
const trocarPerfil = document.getElementById('trocar-perfil');

const ROTAS = {
  '': { perfil: null, render: renderPerfil },
  adm: { perfil: 'ADM', render: renderAdm },
  usuario: { perfil: 'USUARIO', render: renderUsuario },
  padrinho: { perfil: 'PADRINHO', render: renderPadrinho }
};

function rotaAtual() {
  return location.hash.replace(/^#\/?/, '').split('?')[0].trim();
}

function rotaDoPerfil(perfil) {
  return perfil ? perfil.toLowerCase() : '';
}

function atualizarHeader(rotaDePerfil) {
  const perfil = getPerfil();
  const exibir = Boolean(perfil && rotaDePerfil);
  perfilBadge.hidden = !exibir;
  trocarPerfil.hidden = !exibir;
  if (exibir) perfilBadge.textContent = PERFIS[perfil].label;
}

async function render() {
  const rota = rotaAtual();
  const destino = ROTAS[rota];

  if (!destino) {
    location.hash = '#/';
    return;
  }

  const perfil = getPerfil();
  if (destino.perfil && perfil !== destino.perfil) {
    location.hash = perfil ? `#/${rotaDoPerfil(perfil)}` : '#/';
    return;
  }

  atualizarHeader(destino.perfil);
  app.innerHTML = '<div class="loading">Carregando…</div>';

  try {
    await destino.render(app);
  } catch (erro) {
    app.innerHTML = `
      <div class="empty-state">
        <h2>Não foi possível carregar</h2>
        <p class="muted">${esc(erro.message)}</p>
        <p class="muted small">Dica: sirva a pasta <code>frontend/</code> via HTTP (ex.: <code>python -m http.server</code>). Abrir o arquivo direto (file://) bloqueia o fetch dos JSON.</p>
      </div>`;
  }
}

trocarPerfil.addEventListener('click', (evento) => {
  evento.preventDefault();
  limparPerfil();
  location.hash = '#/';
});

window.addEventListener('hashchange', render);

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const ong = await api.getOng();
    nomeOng.textContent = ong.nome;
  } catch {
    /* mantém o nome padrão */
  }

  if (!location.hash) {
    location.hash = '#/';
    return;
  }

  render();
});
