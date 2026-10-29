import * as api from '../api.js';
import {
  esc, fmtMoeda, fmtData, animalCard, abrirModal,
  toast, confirmar
} from '../components.js';

const ROTULOS_ABA = {
  animais: 'Animais',
  novo: 'Novo animal',
  doacoes: 'Doações',
  perfil: 'Perfil da ONG'
};

const PERFIL_DOADOR = {
  USUARIO: 'Doador',
  PADRINHO: 'Padrinho'
};

let abaAtiva = 'animais';

export async function renderAdm(app) {
  const [ong, animais, doacoes] = await Promise.all([
    api.getOng(),
    api.listarAnimais(),
    api.listarDoacoes()
  ]);

  app.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Painel da ONG</h1>
        <p class="muted">${esc(ong.nome)} · gestão de animais, necessidades e doações</p>
      </div>
    </div>

    <nav class="tabs">
      ${Object.keys(ROTULOS_ABA).map((aba) => `<button class="tab" type="button" data-aba="${aba}">${ROTULOS_ABA[aba]}</button>`).join('')}
    </nav>

    <section id="aba-conteudo"></section>`;

  const conteudo = app.querySelector('#aba-conteudo');
  const abas = [...app.querySelectorAll('.tab')];
  const contexto = { ong, animais, doacoes, app };

  const ativar = (aba) => {
    abaAtiva = aba;
    abas.forEach((botao) => botao.classList.toggle('active', botao.dataset.aba === aba));
    renderAba(conteudo, aba, contexto);
  };

  abas.forEach((botao) => botao.addEventListener('click', () => ativar(botao.dataset.aba)));
  ativar(abaAtiva);
}

function renderAba(container, aba, contexto) {
  if (aba === 'animais') return renderAnimais(container, contexto);
  if (aba === 'novo') return renderNovoAnimal(container, contexto);
  if (aba === 'doacoes') return renderDoacoes(container, contexto);
  return renderPerfilOng(container, contexto);
}

function renderAnimais(container, contexto) {
  const { animais, doacoes } = contexto;

  if (!animais.length) {
    container.innerHTML = '<div class="empty-state"><p>Nenhum animal cadastrado ainda.</p></div>';
    return;
  }

  container.innerHTML = `<div class="grid">${animais.map((animal) => animalCard(animal, {
    acoes: `
      <button class="btn btn-sm btn-ghost" type="button" data-ver="${esc(animal.id)}">Ver doações</button>
      ${animal.status === 'ATIVO'
        ? `<button class="btn btn-sm ${animal.metaAtingida ? 'btn-danger' : 'btn-disabled'}" type="button"
                  data-inativar="${esc(animal.id)}" ${animal.metaAtingida ? '' : 'disabled title="Disponível quando a meta for atingida"'}>Inativar</button>`
        : '<span class="badge badge-muted">Inativado</span>'}`
  })).join('')}</div>`;

  container.querySelectorAll('[data-ver]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const animal = animais.find((item) => item.id === botao.dataset.ver);
      const doacoesDoAnimal = doacoes.filter((doacao) => doacao.animalId === animal.id);
      abrirModal({
        titulo: `Doações para ${animal.nome}`,
        largo: true,
        conteudo: doacoesDoAnimal.length
          ? tabelaDoacoes(doacoesDoAnimal)
          : '<div class="empty-state"><p>Nenhuma doação registrada para este animal.</p></div>'
      });
    });
  });

  container.querySelectorAll('[data-inativar]').forEach((botao) => {
    botao.addEventListener('click', async () => {
      const animal = animais.find((item) => item.id === botao.dataset.inativar);
      const confirmou = await confirmar({
        titulo: 'Inativar animal',
        mensagem: `Inativar ${animal.nome}? Ele deixará de aparecer para novas doações, mas o histórico permanece.`,
        textoConfirmar: 'Inativar',
        perigo: true
      });
      if (!confirmou) return;

      try {
        await api.inativarAnimal(animal.id);
        toast(`${animal.nome} foi inativado.`);
        await renderAdm(contexto.app);
      } catch (erro) {
        toast(erro.message, 'erro');
      }
    });
  });
}

function renderNovoAnimal(container, contexto) {
  container.innerHTML = `
    <form class="card form" id="form-animal">
      <div class="form-grid">
        <label class="field"><span>Nome</span><input name="nome" required maxlength="60" placeholder="Ex.: Mel"></label>
        <label class="field"><span>Espécie</span><input name="especie" required maxlength="40" placeholder="Cachorro, Gato..."></label>
        <label class="field"><span>Idade</span><input name="idade" maxlength="30" placeholder="Ex.: 3 anos"></label>
        <label class="field"><span>Meta de arrecadação (R$)</span><input name="meta" type="number" min="1" step="0.01" required placeholder="1200"></label>
        <label class="field full"><span>Descrição</span><textarea name="descricao" required placeholder="História e situação do animal"></textarea></label>
        <label class="field full"><span>Necessidades (separadas por vírgula)</span><input name="necessidades" placeholder="Ração, consultas, castração"></label>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Cadastrar animal</button>
      </div>
    </form>`;

  container.querySelector('#form-animal').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.target));

    try {
      await api.criarAnimal({
        nome: dados.nome.trim(),
        especie: dados.especie.trim(),
        idade: String(dados.idade || '').trim() || 'Não informada',
        descricao: dados.descricao.trim(),
        meta: Number(dados.meta),
        necessidades: String(dados.necessidades || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        padrinhoIds: [],
        mensalidadeSugerida: 50
      });
      toast('Animal cadastrado com sucesso.');
      abaAtiva = 'animais';
      await renderAdm(contexto.app);
    } catch (erro) {
      toast(erro.message, 'erro');
    }
  });
}

function renderDoacoes(container, contexto) {
  const { doacoes, animais } = contexto;
  const total = doacoes.reduce((soma, doacao) => soma + Number(doacao.valor || 0), 0);
  const ativos = animais.filter((animal) => animal.status === 'ATIVO').length;
  const mapaAnimais = new Map(animais.map((animal) => [animal.id, animal.nome]));

  container.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat-label">Total recebido</div><div class="stat-value">${fmtMoeda(total)}</div></div>
      <div class="stat"><div class="stat-label">Doações</div><div class="stat-value">${doacoes.length}</div></div>
      <div class="stat"><div class="stat-label">Animais ativos</div><div class="stat-value">${ativos}</div></div>
    </div>
    ${doacoes.length
      ? tabelaDoacoes(doacoes, mapaAnimais)
      : '<div class="empty-state"><p>Nenhuma doação recebida ainda.</p></div>'}`;
}

function tabelaDoacoes(doacoes, mapaAnimais = null) {
  return `
    <div class="card table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            ${mapaAnimais ? '<th>Animal</th>' : ''}
            <th>Doador</th>
            <th>Perfil</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${doacoes.map((doacao) => `
            <tr>
              <td>${fmtData(doacao.data)}</td>
              ${mapaAnimais ? `<td>${esc(mapaAnimais.get(doacao.animalId) || '—')}</td>` : ''}
              <td>${esc(doacao.doadorNome || 'Anônimo')}</td>
              <td>${esc(PERFIL_DOADOR[doacao.perfil] || doacao.perfil)}</td>
              <td class="valor">${fmtMoeda(doacao.valor)}</td>
              <td><span class="badge badge-ok">${doacao.status === 'DOADO' ? 'Doado' : esc(doacao.status)}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderPerfilOng(container, contexto) {
  const { ong } = contexto;
  const tipos = ['CPF/CNPJ', 'E-mail', 'Telefone', 'Chave aleatória'];

  container.innerHTML = `
    <form class="card form" id="form-ong">
      <div class="form-grid">
        <label class="field"><span>Nome da ONG</span><input name="nome" required value="${esc(ong.nome)}"></label>
        <label class="field"><span>Telefone</span><input name="telefone" value="${esc(ong.telefone || '')}"></label>
        <label class="field full"><span>Descrição</span><textarea name="descricao">${esc(ong.descricao || '')}</textarea></label>
        <label class="field"><span>Chave PIX</span><input name="chavePix" required value="${esc(ong.chavePix || '')}"></label>
        <label class="field">
          <span>Tipo de chave PIX</span>
          <select name="tipoChavePix">
            ${tipos.map((tipo) => `<option ${ong.tipoChavePix === tipo ? 'selected' : ''}>${tipo}</option>`).join('')}
          </select>
        </label>
        <label class="field full"><span>Endereço</span><input name="endereco" value="${esc(ong.endereco || '')}"></label>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Salvar dados da ONG</button>
      </div>
    </form>`;

  container.querySelector('#form-ong').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.target));

    try {
      await api.atualizarOng(dados);
      toast('Dados da ONG atualizados.');
      await renderAdm(contexto.app);
    } catch (erro) {
      toast(erro.message, 'erro');
    }
  });
}
