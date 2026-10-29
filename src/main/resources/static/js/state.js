const PERFIL_KEY = 'ong_perfil_ativo';

export const PERFIS = {
  ADM: {
    label: 'Administrador (ONG)',
    descricao: 'Cadastre animais, defina necessidades, acompanhe metas e veja todas as doações recebidas.'
  },
  USUARIO: {
    label: 'Doador',
    descricao: 'Faça doações via PIX para qualquer animal, no valor que quiser, e acompanhe as metas.'
  },
  PADRINHO: {
    label: 'Padrinho',
    descricao: 'Visualize seus afilhados, veja as necessidades e contribua mensalmente com cada um.'
  }
};

export function getPerfil() {
  return localStorage.getItem(PERFIL_KEY);
}

export function setPerfil(perfil) {
  if (perfil) localStorage.setItem(PERFIL_KEY, perfil);
  else localStorage.removeItem(PERFIL_KEY);
}

export function limparPerfil() {
  localStorage.removeItem(PERFIL_KEY);
}
