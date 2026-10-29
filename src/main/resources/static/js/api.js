import { CONFIG } from './config.js';
import * as mock from './mock.js';

const USAR_MOCK = CONFIG.USE_MOCK;

async function http(caminho, opcoes = {}) {
  const resposta = await fetch(`${CONFIG.BASE_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  });

  if (!resposta.ok) {
    let mensagem = `Erro ${resposta.status} ao chamar ${caminho}.`;
    try {
      const corpo = await resposta.json();
      mensagem = corpo.mensagem || corpo.message || mensagem;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(mensagem);
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

function enriquecerAnimal(animal, doacoes) {
  const arrecadado = doacoes
    .filter((d) => d.animalId === animal.id && d.status !== 'CANCELADA')
    .reduce((soma, d) => soma + Number(d.valor || 0), 0);
  const meta = Number(animal.meta || 0);
  const percentual = meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0;

  return {
    ...animal,
    arrecadado,
    percentual,
    metaAtingida: meta > 0 && arrecadado >= meta
  };
}

export async function getOng() {
  return USAR_MOCK ? mock.obterOng() : http('/ong');
}

export async function atualizarOng(dados) {
  return USAR_MOCK
    ? mock.atualizarOng(dados)
    : http('/ong', { method: 'PUT', body: JSON.stringify(dados) });
}

export async function getUsuarios() {
  return USAR_MOCK ? mock.obterUsuarios() : http('/usuarios');
}

export async function listarAnimais(filtro = {}) {
  let animais;
  let doacoes;

  if (USAR_MOCK) {
    animais = await mock.obterAnimaisBrutos();
    doacoes = await mock.obterDoacoesBrutas();
  } else {
    animais = await http('/animais');
    doacoes = await http('/doacoes');
  }

  let lista = animais.map((animal) => enriquecerAnimal(animal, doacoes));
  if (filtro.status) lista = lista.filter((animal) => animal.status === filtro.status);
  return lista;
}

export async function obterAnimal(id) {
  const animais = await listarAnimais();
  return animais.find((animal) => animal.id === id) || null;
}

export async function criarAnimal(dados) {
  const payload = { ...dados, status: 'ATIVO' };

  if (USAR_MOCK) {
    const animal = { id: `animal-${Date.now()}`, ...payload };
    return mock.inserirAnimal(animal);
  }

  return http('/animais', { method: 'POST', body: JSON.stringify(payload) });
}

export async function inativarAnimal(id) {
  const animal = await obterAnimal(id);
  if (!animal) throw new Error('Animal não encontrado.');
  if (!animal.metaAtingida) {
    throw new Error('Só é possível inativar animais que atingiram a meta de doações.');
  }

  return USAR_MOCK
    ? mock.alterarStatusAnimal(id, 'INATIVO')
    : http(`/animais/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'INATIVO' }) });
}

export async function listarDoacoes(filtro = {}) {
  let doacoes = USAR_MOCK ? await mock.obterDoacoesBrutas() : await http('/doacoes');

  doacoes = [...doacoes].sort((a, b) => new Date(b.data) - new Date(a.data));
  if (filtro.animalId) doacoes = doacoes.filter((d) => d.animalId === filtro.animalId);
  if (filtro.padrinhoId) doacoes = doacoes.filter((d) => d.padrinhoId === filtro.padrinhoId);
  return doacoes;
}

export async function criarDoacao(dados) {
  const payload = { ...dados, status: 'DOADO' };

  if (USAR_MOCK) {
    const doacao = { id: `doacao-${Date.now()}`, data: new Date().toISOString(), ...payload };
    return mock.inserirDoacao(doacao);
  }

  return http('/doacoes', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listarAfilhados(padrinhoId) {
  const animais = await listarAnimais();
  return animais.filter((animal) => (animal.padrinhoIds || []).includes(padrinhoId));
}
