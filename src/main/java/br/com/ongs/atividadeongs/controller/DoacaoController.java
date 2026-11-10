package br.com.ongs.atividadeongs.controller;

import br.com.ongs.atividadeongs.dto.DoacaoRequest;
import br.com.ongs.atividadeongs.dto.DoacaoResponse;
import br.com.ongs.atividadeongs.service.DoacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/doacoes")
public class DoacaoController {

    private final DoacaoService doacaoService;

    public DoacaoController(DoacaoService doacaoService) {
        this.doacaoService = doacaoService;
    }

    @GetMapping
    public ResponseEntity<List<DoacaoResponse>> listar() {
        return ResponseEntity.ok(doacaoService.listar());
    }

    @PostMapping
    public ResponseEntity<DoacaoResponse> criar(
            @RequestBody DoacaoRequest dados
    ) {
        DoacaoResponse criada = doacaoService.criar(dados);

        return ResponseEntity
                .created(URI.create("/api/doacoes/" + criada.id()))
                .body(criada);
    }
}