import * as api from '../api.js';
import {
  esc, fmtMoeda, fmtData, iniciais, barraProgresso, statusBadge
} from '../components.js';
import { abrirDoacao } from '../doacao-modal.js';

export async function renderPadrinho(app) {
  const usuarios = await api.getUsuarios();
  const padrinho = usuarios.padrinhoAtual;

  const [ong, afilhados, doacoes] = await Promise.all([
    api.getOng(),
    api.listarAfilhados(padrinho.id),
    api.listarDoacoes({ padrinhoId: padrinho.id })
  ]);

  const totalDoado = doacoes.reduce((soma, doacao) => soma + Number(doacao.valor || 0), 0);
  const mapaAfilhados = new Map(afilhados.map((animal) => [animal.id, animal.nome]));
  const primeiroNome = String(padrinho.nome).split(' ')[0];

  app.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Olá, ${esc(primeiroNome)}</h1>
        <p class="muted">Acompanhe seus afilhados e contribua mensalmente com cada um.</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat"><div class="stat-label">Afilhados</div><div class="stat-value">${afilhados.length}</div></div>
      <div class="stat"><div class="stat-label">Total doado</div><div class="stat-value">${fmtMoeda(totalDoado)}</div></div>
      <div class="stat"><div class="stat-label">Doações realizadas</div><div class="stat-value">${doacoes.length}</div></div>
    </div>

    <h2 class="section-title">Meus afilhados</h2>
    ${afilhados.length
      ? `<div class="grid">${afilhados.map((animal) => cardAfilhado(animal, ong)).join('')}</div>`
      : '<div class="empty-state"><p>Você ainda não apadrinhou nenhum animal.</p></div>'}

    <h2 class="section-title">Minhas doações</h2>
    ${doacoes.length
      ? tabelaMinhasDoacoes(doacoes, mapaAfilhados)
      : '<div class="empty-state"><p>Nenhuma doação registrada ainda.</p></div>'}`;

  app.querySelectorAll('[data-padrinhar]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const animal = afilhados.find((item) => item.id === botao.dataset.padrinhar);
      if (!animal) return;

      abrirDoacao({
        animal,
        ong,
        perfil: 'PADRINHO',
        doador: padrinho,
        valorSugerido: animal.mensalidadeSugerida ?? 50,
        aoConcluir: () => renderPadrinho(app)
      });
    });
  });
}

function cardAfilhado(animal, ong) {
  const inativo = animal.status !== 'ATIVO';
  const necessidades = (animal.necessidades || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join('') || '<li>Sem necessidades registradas.</li>';

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
      <div class="needs">
        <h4>Necessidades</h4>
        <ul class="needs-list">${necessidades}</ul>
      </div>
      <p class="muted small">Apadrinhado por você · ONG ${esc(ong.nome)}</p>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" type="button" data-padrinhar="${esc(animal.id)}" ${inativo ? 'disabled' : ''}>
          ${inativo
            ? 'Meta concluída'
            : `Doar mensalidade${animal.mensalidadeSugerida ? ` (${fmtMoeda(animal.mensalidadeSugerida)})` : ''}`}
        </button>
      </div>
    </article>`;
}

function tabelaMinhasDoacoes(doacoes, mapaAfilhados) {
  return `
    <div class="card table-wrap">
      <table class="table">
        <thead>
          <tr><th>Data</th><th>Animal</th><th>Valor</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${doacoes.map((doacao) => `
            <tr>
              <td>${fmtData(doacao.data)}</td>
              <td>${esc(mapaAfilhados.get(doacao.animalId) || '—')}</td>
              <td class="valor">${fmtMoeda(doacao.valor)}</td>
              <td><span class="badge badge-ok">Doado</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}
