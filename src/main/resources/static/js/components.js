export function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[caractere]));
}

export function iniciais(nome) {
  return String(nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

export function fmtMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function fmtData(valor) {
  if (!valor) return '—';
  const bruto = String(valor);
  const data = new Date(/^\d{4}-\d{2}-\d{2}$/.test(bruto) ? `${bruto}T12:00:00` : bruto);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleDateString('pt-BR');
}

export function statusBadge(status) {
  return status === 'ATIVO'
    ? '<span class="badge badge-ok">Ativo</span>'
    : '<span class="badge badge-muted">Inativo</span>';
}

export function barraProgresso(animal) {
  const percentual = animal.percentual ?? 0;
  return `
    <div class="progress-block">
      <div class="progress-info">
        <strong>${fmtMoeda(animal.arrecadado)}</strong>
        <span class="muted">de ${fmtMoeda(animal.meta)}</span>
        <span class="pct">${percentual}%</span>
      </div>
      <div class="progress ${percentual >= 100 ? 'full' : ''}" role="progressbar"
           aria-valuenow="${percentual}" aria-valuemin="0" aria-valuemax="100">
        <span style="width:${percentual}%"></span>
      </div>
    </div>`;
}

export function animalCard(animal, { acoes = '' } = {}) {
  return `
    <article class="card animal-card">
      <div class="animal-top">
        <div class="animal-avatar">${iniciais(animal.nome)}</div>
        <div class="animal-id">
          <h3>${esc(animal.nome)}</h3>
          <p class="muted">${esc(animal.especie)} · ${esc(animal.idade)}</p>
        </div>
        ${statusBadge(animal.status)}
      </div>
      <p class="animal-desc">${esc(animal.descricao)}</p>
      ${barraProgresso(animal)}
      ${acoes ? `<div class="card-actions">${acoes}</div>` : ''}
    </article>`;
}

export function abrirModal({ titulo, conteudo, largo = false, onMount }) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal ${largo ? 'modal-lg' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div class="modal-head">
          <h2 id="modal-titulo">${esc(titulo)}</h2>
          <button class="icon-btn" type="button" data-fechar aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body">${conteudo}</div>
      </div>
    </div>`;

  const overlay = root.querySelector('.modal-overlay');
  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) fecharModal();
  });
  root.querySelector('[data-fechar]').addEventListener('click', fecharModal);
  document.body.classList.add('modal-aberto');

  if (typeof onMount === 'function') onMount(root.querySelector('.modal'));
}

export function fecharModal() {
  document.getElementById('modal-root').innerHTML = '';
  document.body.classList.remove('modal-aberto');
}

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') fecharModal();
});

export function confirmar({ titulo = 'Confirmar', mensagem = '', textoConfirmar = 'Confirmar', perigo = false }) {
  return new Promise((resolver) => {
    abrirModal({
      titulo,
      conteudo: `
        <p>${esc(mensagem)}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" type="button" data-cancelar>Cancelar</button>
          <button class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" type="button" data-ok>${esc(textoConfirmar)}</button>
        </div>`,
      onMount(modal) {
        modal.querySelector('[data-cancelar]').addEventListener('click', () => {
          fecharModal();
          resolver(false);
        });
        modal.querySelector('[data-ok]').addEventListener('click', () => {
          fecharModal();
          resolver(true);
        });
      }
    });
  });
}

export function toast(mensagem, tipo = 'ok') {
  const root = document.getElementById('toast-root');
  const elemento = document.createElement('div');
  elemento.className = `toast toast-${tipo}`;
  elemento.textContent = mensagem;
  root.appendChild(elemento);

  setTimeout(() => {
    elemento.classList.add('toast-out');
    setTimeout(() => elemento.remove(), 250);
  }, 3200);
}
