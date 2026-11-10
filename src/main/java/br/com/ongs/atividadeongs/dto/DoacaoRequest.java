package br.com.ongs.atividadeongs.dto;

import br.com.ongs.atividadeongs.models.PerfilUsuario;

import java.math.BigDecimal;

public record DoacaoRequest(
        Long animalId,
        PerfilUsuario perfil,
        Long padrinhoId,
        String doadorNome,
        BigDecimal valor
) {
}