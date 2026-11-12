package br.com.ongs.atividadeongs.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {

    @GetMapping
    public ResponseEntity<List<Object>> listar() {
        // TODO: implementar
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Void> buscarPorId(@PathVariable Long id) {
        // TODO: implementar
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Void> criar(@RequestBody Map<String, Object> dados) {
        // TODO: implementar
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id, @RequestBody Map<String, Object> dados) {
        // TODO: implementar
        return ResponseEntity.noContent().build();
    }
}
