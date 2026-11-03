package br.com.ongs.atividadeongs.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        // TODO: implementar
        // O front-end lê a propriedade "padrinhoAtual".
        return ResponseEntity.ok(Map.of("padrinhoAtual", Map.of()));
    }
}
