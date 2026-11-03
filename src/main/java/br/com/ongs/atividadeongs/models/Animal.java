package br.com.ongs.atividadeongs.models;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "animais")
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nome;

    @Column(nullable = false, length = 40)
    private String especie;

    @Column(length = 30)
    private String idade;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAnimal status = StatusAnimal.ATIVO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal meta = BigDecimal.ZERO;

    @ElementCollection
    @CollectionTable(name = "animal_necessidades", joinColumns = @JoinColumn(name = "animal_id"))
    @OrderColumn(name = "ordem")
    @Column(name = "necessidade", nullable = false, length = 120)
    private List<String> necessidades = new ArrayList<>();

    @Column(name = "mensalidade_sugerida", precision = 12, scale = 2)
    private BigDecimal mensalidadeSugerida;


    @ManyToMany
    @JoinTable(
            name = "animal_padrinhos",
            joinColumns = @JoinColumn(name = "animal_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private Set<Usuario> padrinhos = new LinkedHashSet<>();

    public Animal() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public String getIdade() {
        return idade;
    }

    public void setIdade(String idade) {
        this.idade = idade;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusAnimal getStatus() {
        return status;
    }

    public void setStatus(StatusAnimal status) {
        this.status = status;
    }

    public BigDecimal getMeta() {
        return meta;
    }

    public void setMeta(BigDecimal meta) {
        this.meta = meta;
    }

    public List<String> getNecessidades() {
        return necessidades;
    }

    public void setNecessidades(List<String> necessidades) {
        this.necessidades = necessidades;
    }

    public BigDecimal getMensalidadeSugerida() {
        return mensalidadeSugerida;
    }

    public void setMensalidadeSugerida(BigDecimal mensalidadeSugerida) {
        this.mensalidadeSugerida = mensalidadeSugerida;
    }

    public Set<Usuario> getPadrinhos() {
        return padrinhos;
    }

    public void setPadrinhos(Set<Usuario> padrinhos) {
        this.padrinhos = padrinhos;
    }
}
