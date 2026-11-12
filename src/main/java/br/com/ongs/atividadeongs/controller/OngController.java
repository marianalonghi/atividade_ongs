package br.com.ongs.atividadeongs.controller;

import br.com.ongs.atividadeongs.dto.OngRequest;
import br.com.ongs.atividadeongs.dto.OngResponse;
import br.com.ongs.atividadeongs.models.Ong;
import br.com.ongs.atividadeongs.models.TipoChavePix;
import br.com.ongs.atividadeongs.repository.OngRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ong")
public class OngController {

    private final OngRepository ongRepository;

    //injeção de dependência do repository jpa
    public OngController(OngRepository ongRepository) {
        this.ongRepository = ongRepository;
    }

    @GetMapping
    public ResponseEntity<OngResponse> obter() {
        //metodos do Spring Data JPA via repository
        return ongRepository.findFirstByOrderByIdAsc()
                .map(OngResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<OngResponse> atualizar(@RequestBody OngRequest dados) {
        Ong ong = ongRepository.findFirstByOrderByIdAsc().orElseGet(Ong::new);
        boolean nova = ong.getId() == null;

        // Campos nulos não são enviados/alterados (atualização parcial).
        if (dados.nome() != null) {
            ong.setNome(obrigatorio(dados.nome(), "nome"));
        }
        if (dados.chavePix() != null) {
            ong.setChavePix(obrigatorio(dados.chavePix(), "chavePix"));
        }
        if (dados.tipoChavePix() != null) {
            TipoChavePix tipo = TipoChavePix.fromValor(dados.tipoChavePix());
            if (tipo == null) {
                throw new IllegalArgumentException("O campo 'tipoChavePix' é obrigatório.");
            }
            ong.setTipoChavePix(tipo);
        }
        if (dados.descricao() != null) {
            ong.setDescricao(dados.descricao().trim());
        }
        if (dados.telefone() != null) {
            ong.setTelefone(dados.telefone().trim());
        }
        if (dados.endereco() != null) {
            ong.setEndereco(dados.endereco().trim());
        }

        // Na criação (upsert), os campos NOT NULL precisam estar preenchidos.
        if (nova) {
            exigirPreenchido(ong.getNome(), "nome");
            exigirPreenchido(ong.getChavePix(), "chavePix");
            if (ong.getTipoChavePix() == null) {
                throw new IllegalArgumentException("O campo 'tipoChavePix' é obrigatório.");
            }
        }

        Ong salva = ongRepository.save(ong);
        return ResponseEntity.ok(OngResponse.from(salva));
    }

    private String obrigatorio(String valor, String campo) {
        String texto = valor == null ? "" : valor.trim();
        if (texto.isEmpty()) {
            throw new IllegalArgumentException("O campo '" + campo + "' é obrigatório.");
        }
        return texto;
    }

    private void exigirPreenchido(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("O campo '" + campo + "' é obrigatório.");
        }
    }

    // Erros de entrada viram 400 com a propriedade "mensagem", lida pelo api.js.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarErroDeEntrada(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("mensagem", ex.getMessage()));
    }
}
