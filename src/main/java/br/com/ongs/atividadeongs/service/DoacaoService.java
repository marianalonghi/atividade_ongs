package br.com.ongs.atividadeongs.service;

import br.com.ongs.atividadeongs.dto.DoacaoRequest;
import br.com.ongs.atividadeongs.dto.DoacaoResponse;
import br.com.ongs.atividadeongs.models.*;
import br.com.ongs.atividadeongs.repository.AnimalRepository;
import br.com.ongs.atividadeongs.repository.DoacaoRepository;
import br.com.ongs.atividadeongs.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class DoacaoService {

    private final DoacaoRepository doacaoRepository;
    private final AnimalRepository animalRepository;
    private final UsuarioRepository usuarioRepository;

    public DoacaoService(
            DoacaoRepository doacaoRepository,
            AnimalRepository animalRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.doacaoRepository = doacaoRepository;
        this.animalRepository = animalRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<DoacaoResponse> listar() {
        return doacaoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DoacaoResponse criar(DoacaoRequest dados) {
        if (dados.animalId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o animal da doação."
            );
        }

        BigDecimal valor = dados.valor();

        if (valor == null || valor.signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O valor deve ser maior que zero."
            );
        }

        if (valor.stripTrailingZeros().scale() > 2
                || valor.compareTo(new BigDecimal("9999999999.99")) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um valor válido com até duas casas decimais."
            );
        }

        Animal animal = animalRepository.findById(dados.animalId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Animal não encontrado."
                ));

        if (animal.getStatus() != StatusAnimal.ATIVO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O animal está inativo."
            );
        }

        if (dados.perfil() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o perfil do doador."
            );
        }

        Usuario padrinho = null;

        if (dados.perfil() == PerfilUsuario.PADRINHO) {
            if (dados.padrinhoId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe o padrinho da doação."
                );
            }

            padrinho = usuarioRepository.findById(dados.padrinhoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Padrinho não encontrado."
                    ));

            if (padrinho.getPerfil() != PerfilUsuario.PADRINHO) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "O usuário informado não possui perfil de padrinho."
                );
            }
        } else if (dados.padrinhoId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Somente doações de padrinhos podem informar padrinhoId."
            );
        }

        String nome = dados.doadorNome();

        if (nome == null || nome.isBlank()) {
            nome = "Doador anônimo";
        } else {
            nome = nome.trim();
        }

        if (nome.length() > 120) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O nome do doador deve ter até 120 caracteres."
            );
        }

        Doacao doacao = new Doacao();
        doacao.setAnimal(animal);
        doacao.setPerfil(dados.perfil());
        doacao.setPadrinho(padrinho);
        doacao.setDoadorNome(nome);
        doacao.setValor(valor);
        doacao.setData(Instant.now());
        doacao.setStatus(StatusDoacao.DOADO);

        return toResponse(doacaoRepository.save(doacao));
    }

    private DoacaoResponse toResponse(Doacao doacao) {
        Long padrinhoId = doacao.getPadrinho() == null
                ? null
                : doacao.getPadrinho().getId();

        return new DoacaoResponse(
                doacao.getId(),
                doacao.getAnimal().getId(),
                doacao.getPerfil(),
                padrinhoId,
                doacao.getDoadorNome(),
                doacao.getValor(),
                doacao.getData(),
                doacao.getStatus()
        );
    }
}