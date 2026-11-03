package br.com.ongs.atividadeongs.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ong")
public class OngController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> obter() {
        // TODO: implementar
        return ResponseEntity.ok(Map.of());
    }

    @PutMapping
    public ResponseEntity<Void> atualizar(@RequestBody Map<String, Object> dados) {
        // TODO: implementar
        return ResponseEntity.noContent().build();
    }
}
