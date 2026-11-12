package br.com.ongs.atividadeongs.dto;

import br.com.ongs.atividadeongs.models.Ong;
import br.com.ongs.atividadeongs.models.TipoChavePix;

/**
 * Representação de Ong devolvida pela API.
 * O TipoChavePix continua sendo serializado como texto pelo @JsonValue do enum.
 */
public record OngResponse(
        Long id,
        String nome,
        String descricao,
        String chavePix,
        TipoChavePix tipoChavePix,
        String telefone,
        String endereco
) {

    public static OngResponse from(Ong ong) {
        return new OngResponse(
                ong.getId(),
                ong.getNome(),
                ong.getDescricao(),
                ong.getChavePix(),
                ong.getTipoChavePix(),
                ong.getTelefone(),
                ong.getEndereco()
        );
    }
}
