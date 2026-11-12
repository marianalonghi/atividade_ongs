package br.com.ongs.atividadeongs.dto;

/**
 * Corpo aceito por PUT /api/ong.
 * Campos nulos são ignorados (atualização parcial); os campos obrigatórios
 * são validados no controller.
 */
public record OngRequest(
        String nome,
        String descricao,
        String chavePix,
        String tipoChavePix,
        String telefone,
        String endereco
) {
}
