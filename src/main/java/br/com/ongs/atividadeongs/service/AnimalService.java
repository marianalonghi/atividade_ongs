package br.com.ongs.atividadeongs.service;

import br.com.ongs.atividadeongs.dto.AnimalRequest;
import br.com.ongs.atividadeongs.dto.AnimalResponse;
import br.com.ongs.atividadeongs.exception.RecursoNaoEncontradoException;
import br.com.ongs.atividadeongs.exception.RegraNegocioException;
import br.com.ongs.atividadeongs.models.Animal;
import br.com.ongs.atividadeongs.models.StatusAnimal;
import br.com.ongs.atividadeongs.models.StatusDoacao;
import br.com.ongs.atividadeongs.models.Usuario;
import br.com.ongs.atividadeongs.repository.AnimalRepository;
import br.com.ongs.atividadeongs.repository.DoacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final DoacaoRepository doacaoRepository;

    public AnimalService(AnimalRepository animalRepository, DoacaoRepository doacaoRepository) {
        this.animalRepository = animalRepository;
        this.doacaoRepository = doacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> listar() {
        return animalRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AnimalResponse buscar(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public AnimalResponse criar(AnimalRequest req) {
        if (req.nome() == null || req.nome().isBlank()) {
            throw new IllegalArgumentException("O nome é obrigatório.");
        }
        if (req.especie() == null || req.especie().isBlank()) {
            throw new IllegalArgumentException("A espécie é obrigatória.");
        }
        if (req.descricao() == null || req.descricao().isBlank()) {
            throw new IllegalArgumentException("A descrição é obrigatória.");
        }
        if (req.meta() == null || req.meta().signum() <= 0) {
            throw new IllegalArgumentException("A meta deve ser maior que zero.");
        }

        Animal animal = new Animal();
        animal.setNome(req.nome().trim());
        animal.setEspecie(req.especie().trim());
        animal.setIdade(req.idade());
        animal.setDescricao(req.descricao().trim());
        animal.setMeta(req.meta());
        animal.setMensalidadeSugerida(req.mensalidadeSugerida());
        if (req.necessidades() != null) {
            animal.setNecessidades(new ArrayList<>(req.necessidades()));
        }
        if (req.status() != null) {
            animal.setStatus(req.status());
        }
        return toResponse(animalRepository.save(animal));
    }

    @Transactional
    public AnimalResponse atualizarStatus(Long id, StatusAnimal novoStatus) {
        if (novoStatus == null) {
            throw new IllegalArgumentException("O status é obrigatório.");
        }
        Animal animal = buscarEntidade(id);
        if (novoStatus == StatusAnimal.INATIVO && !calcularMetaAtingida(animal)) {
            throw new RegraNegocioException("Só é possível inativar o animal quando a meta for atingida.");
        }
        animal.setStatus(novoStatus);
        return toResponse(animal);
    }

    private Animal buscarEntidade(Long id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Animal não encontrado."));
    }

    private BigDecimal arrecadado(Animal a) {
        return doacaoRepository.somarValorPorAnimal(a.getId(), StatusDoacao.CANCELADA);
    }

    private boolean calcularMetaAtingida(Animal a) {
        BigDecimal meta = a.getMeta();
        return meta != null && meta.signum() > 0 && arrecadado(a).compareTo(meta) >= 0;
    }

    private AnimalResponse toResponse(Animal a) {
        BigDecimal arrecadado = arrecadado(a);
        BigDecimal meta = a.getMeta();
        boolean temMeta = meta != null && meta.signum() > 0;
        boolean atingida = temMeta && arrecadado.compareTo(meta) >= 0;
        int percentual = temMeta
                ? arrecadado.multiply(BigDecimal.valueOf(100))
                .divide(meta, 0, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100)).intValue()
                : 0;

        List<Long> padrinhoIds = a.getPadrinhos().stream().map(Usuario::getId).toList();

        return new AnimalResponse(
                a.getId(), a.getNome(), a.getEspecie(), a.getIdade(), a.getDescricao(),
                a.getStatus(), meta, new ArrayList<>(a.getNecessidades()),
                padrinhoIds, a.getMensalidadeSugerida(),
                arrecadado, percentual, atingida);
    }
}