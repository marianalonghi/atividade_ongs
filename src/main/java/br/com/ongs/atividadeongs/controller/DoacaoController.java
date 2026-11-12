package br.com.ongs.atividadeongs.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doacoes")
public class DoacaoController {

    @GetMapping
    public ResponseEntity<List<Object>> listar() {
        // TODO: implementar
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<Void> criar(@RequestBody Map<String, Object> dados) {
        // TODO: implementar
        return ResponseEntity.noContent().build();
    }
}
