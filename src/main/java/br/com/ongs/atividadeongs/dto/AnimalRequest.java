package br.com.ongs.atividadeongs.dto;

import br.com.ongs.atividadeongs.models.StatusAnimal;

import java.math.BigDecimal;
import java.util.List;

public record AnimalRequest(
        String nome,
        String especie,
        String idade,
        String descricao,
        BigDecimal meta,
        List<String> necessidades,
        BigDecimal mensalidadeSugerida,
        StatusAnimal status) {
}