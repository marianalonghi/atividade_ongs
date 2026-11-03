package br.com.ongs.atividadeongs.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


public enum TipoChavePix {

    CPF_CNPJ("CPF/CNPJ"),
    EMAIL("E-mail"),
    TELEFONE("Telefone"),
    CHAVE_ALEATORIA("Chave aleatória");

    private final String descricao;

    TipoChavePix(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static TipoChavePix fromValor(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        for (TipoChavePix tipo : values()) {
            if (tipo.descricao.equalsIgnoreCase(valor) || tipo.name().equalsIgnoreCase(valor)) {
                return tipo;
            }
        }

        throw new IllegalArgumentException("Tipo de chave PIX inválido: " + valor);
    }
}
