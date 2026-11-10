package br.com.ongs.atividadeongs.dto;

import br.com.ongs.atividadeongs.models.PerfilUsuario;
import br.com.ongs.atividadeongs.models.StatusDoacao;

import java.math.BigDecimal;
import java.time.Instant;

public record DoacaoResponse(
        Long id,
        Long animalId,
        PerfilUsuario perfil,
        Long padrinhoId,
        String doadorNome,
        BigDecimal valor,
        Instant data,
        StatusDoacao status
) {
}