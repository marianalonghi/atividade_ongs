package br.com.ongs.atividadeongs.controller;

import br.com.ongs.atividadeongs.dto.AnimalRequest;
import br.com.ongs.atividadeongs.dto.AnimalResponse;
import br.com.ongs.atividadeongs.dto.AnimalStatusRequest;
import br.com.ongs.atividadeongs.service.AnimalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {

    private final AnimalService service;

    public AnimalController(AnimalService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AnimalResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    @PostMapping
    public ResponseEntity<AnimalResponse> criar(@RequestBody AnimalRequest dados) {
        AnimalResponse criado = service.criar(dados);
        return ResponseEntity.created(URI.create("/api/animais/" + criado.id())).body(criado);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AnimalResponse> alterarStatus(@PathVariable Long id,
                                                        @RequestBody AnimalStatusRequest dados) {
        return ResponseEntity.ok(service.atualizarStatus(id, dados.status()));
    }
}