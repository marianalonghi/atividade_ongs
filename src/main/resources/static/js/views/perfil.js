import { PERFIS, getPerfil, setPerfil } from '../state.js';
import { esc, toast } from '../components.js';
import { resetarMutacoes } from '../mock.js';

const ICONES = {
  ADM: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><path d="M2 21h20"/><path d="M8 7h4M8 11h4M8 15h4"/></svg>`,
  USUARIO: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1z"/></svg>`,
  PADRINHO: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>`
};

export function renderPerfil(app) {
  const atual = getPerfil();

  app.innerHTML = `
    <section class="perfil-hero">
      <h1>Qual perfil você é?</h1>
      <p class="muted">Escolha um perfil para explorar as funcionalidades. Este protótipo não possui login nem cadastro.</p>
    </section>

    <div class="perfil-grid">
      ${Object.entries(PERFIS).map(([chave, perfil]) => `
        <button class="perfil-card" type="button" data-perfil="${chave}">
          <span class="perfil-icon">${ICONES[chave]}</span>
          <span class="perfil-nome">${esc(perfil.label)}</span>
          <span class="perfil-desc">${esc(perfil.descricao)}</span>
          <span class="perfil-cta">${atual === chave ? 'Continuar' : 'Entrar'} &rarr;</span>
        </button>`).join('')}
    </div>

    <div class="perfil-foot">
      <p class="muted small">Dados fictícios, salvos apenas neste navegador.</p>
      <button class="link-btn" type="button" id="reset-demo">Resetar dados da demonstração</button>
    </div>`;

  app.querySelectorAll('[data-perfil]').forEach((botao) => {
    botao.addEventListener('click', () => {
      setPerfil(botao.dataset.perfil);
      location.hash = `#/${botao.dataset.perfil.toLowerCase()}`;
    });
  });

  app.querySelector('#reset-demo').addEventListener('click', () => {
    resetarMutacoes();
    toast('Dados da demonstração resetados.');
  });
}
