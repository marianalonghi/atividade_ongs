package br.com.ongs.atividadeongs.dto;

import br.com.ongs.atividadeongs.models.StatusAnimal;

import java.math.BigDecimal;
import java.util.List;

public record AnimalResponse(
        Long id,
        String nome,
        String especie,
        String idade,
        String descricao,
        StatusAnimal status,
        BigDecimal meta,
        List<String> necessidades,
        List<Long> padrinhoIds,
        BigDecimal mensalidadeSugerida,
        BigDecimal arrecadado,
        int percentual,
        boolean metaAtingida) {
}