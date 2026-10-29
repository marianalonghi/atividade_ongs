import * as api from './api.js';
import { abrirModal, fecharModal, esc, fmtMoeda, toast } from './components.js';

const VALORES_RAPIDOS = [20, 50, 100, 200];

export function abrirDoacao({ animal, ong, perfil, doador = null, valorSugerido = null, aoConcluir }) {
  const necessidades = (animal.necessidades || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join('');

  abrirModal({
    titulo: `Doar para ${animal.nome}`,
    largo: true,
    conteudo: `
      <div class="donation-detail">
        <div>
          <p class="muted">${esc(animal.especie)} · ${esc(animal.idade)}</p>
          <p>${esc(animal.descricao)}</p>
          ${necessidades ? `<div class="needs"><h4>Necessidades</h4><ul class="needs-list">${necessidades}</ul></div>` : ''}
          <div class="pix-box">
            <span class="muted">Chave PIX — ${esc(ong.nome)}</span>
            <div class="pix-key">
              <code>${esc(ong.chavePix)}</code>
              <button type="button" class="btn btn-sm" data-copiar>Copiar</button>
            </div>
            <span class="muted">${esc(ong.tipoChavePix)}${ong.telefone ? ` · ${esc(ong.telefone)}` : ''}</span>
          </div>
        </div>

        <form id="form-doacao" class="donation-form">
          <label class="field">
            <span>Doador</span>
            <input name="doadorNome" value="${esc(doador?.nome || '')}" placeholder="Doador anônimo">
          </label>

          <div class="chips">
            ${VALORES_RAPIDOS.map((valor) => `<button type="button" class="chip" data-valor="${valor}">${fmtMoeda(valor)}</button>`).join('')}
          </div>

          <label class="field">
            <span>Valor (R$)</span>
            <input name="valor" type="number" min="1" step="0.01" required
                   value="${valorSugerido ?? ''}" placeholder="Digite o valor">
          </label>

          <button class="btn btn-primary btn-block" type="submit">Já fiz o PIX • Marcar como doado</button>
          <p class="hint small">Sem confirmação real de pagamento — o registro é feito por confiança (MVP).</p>
        </form>
      </div>`,
    onMount(modal) {
      modal.querySelector('[data-copiar]')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(ong.chavePix);
          toast('Chave PIX copiada.');
        } catch {
          toast('Não foi possível copiar. Selecione a chave manualmente.', 'erro');
        }
      });

      modal.querySelectorAll('.chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const input = modal.querySelector('input[name="valor"]');
          input.value = chip.dataset.valor;
          modal.querySelectorAll('.chip').forEach((outro) => outro.classList.toggle('active', outro === chip));
        });
      });

      const form = modal.querySelector('#form-doacao');
      const botao = form.querySelector('button[type="submit"]');

      form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const dados = new FormData(form);
        const valor = Number(dados.get('valor'));

        if (!(valor > 0)) {
          toast('Informe um valor de doação válido.', 'erro');
          return;
        }

        botao.disabled = true;
        botao.textContent = 'Registrando...';

        try {
          await api.criarDoacao({
            animalId: animal.id,
            perfil,
            padrinhoId: perfil === 'PADRINHO' ? doador?.id ?? null : null,
            doadorNome: String(dados.get('doadorNome') || '').trim() || 'Doador anônimo',
            valor
          });
          fecharModal();
          toast(`Doação de ${fmtMoeda(valor)} registrada. Obrigado!`);
          if (typeof aoConcluir === 'function') await aoConcluir();
        } catch (erro) {
          toast(erro.message, 'erro');
          botao.disabled = false;
          botao.textContent = 'Já fiz o PIX • Marcar como doado';
        }
      });
    }
  });
}
