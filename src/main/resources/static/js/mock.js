import { CONFIG } from './config.js';

const MUTACOES_KEY = 'ong_mock_mutacoes_v1';
const cache = {};

async function carregarJson(nome) {
  if (!cache[nome]) {
    const resposta = await fetch(`${CONFIG.MOCK_DIR}/${nome}.json`, { cache: 'no-store' });
    if (!resposta.ok) {
      throw new Error(`Falha ao carregar ${nome}.json (${resposta.status}).`);
    }
    cache[nome] = await resposta.json();
  }
  return cache[nome];
}

function lerMutacoes() {
  const vazio = { animais: [], doacoes: [], statusAnimais: {}, ong: null };
  try {
    const bruto = localStorage.getItem(MUTACOES_KEY);
    return bruto ? { ...vazio, ...JSON.parse(bruto) } : vazio;
  } catch {
    return vazio;
  }
}

function salvarMutacoes(mutacoes) {
  localStorage.setItem(MUTACOES_KEY, JSON.stringify(mutacoes));
}

export function resetarMutacoes() {
  localStorage.removeItem(MUTACOES_KEY);
}

export async function obterOng() {
  const base = await carregarJson('ong');
  const mutacoes = lerMutacoes();
  return mutacoes.ong ? { ...base, ...mutacoes.ong } : { ...base };
}

export async function atualizarOng(dados) {
  const mutacoes = lerMutacoes();
  mutacoes.ong = { ...(mutacoes.ong || {}), ...dados };
  salvarMutacoes(mutacoes);
  return obterOng();
}

export async function obterUsuarios() {
  return carregarJson('usuarios');
}

export async function obterAnimaisBrutos() {
  const base = await carregarJson('animais');
  const mutacoes = lerMutacoes();
  return [...base, ...(mutacoes.animais || [])].map((animal) => {
    const statusForcado = mutacoes.statusAnimais?.[animal.id];
    return statusForcado ? { ...animal, status: statusForcado } : { ...animal };
  });
}

export async function obterDoacoesBrutas() {
  const base = await carregarJson('doacoes');
  const mutacoes = lerMutacoes();
  return [...(mutacoes.doacoes || []), ...base].map((doacao) => ({ ...doacao }));
}

export async function inserirAnimal(animal) {
  const mutacoes = lerMutacoes();
  mutacoes.animais = [animal, ...(mutacoes.animais || [])];
  salvarMutacoes(mutacoes);
  return animal;
}

export async function alterarStatusAnimal(id, status) {
  const mutacoes = lerMutacoes();
  mutacoes.statusAnimais = { ...(mutacoes.statusAnimais || {}), [id]: status };
  salvarMutacoes(mutacoes);
}

export async function inserirDoacao(doacao) {
  const mutacoes = lerMutacoes();
  mutacoes.doacoes = [doacao, ...(mutacoes.doacoes || [])];
  salvarMutacoes(mutacoes);
  return doacao;
}
