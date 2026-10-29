
package br.com.ongs.atividadeongs.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/api/status")
    public Map<String, String> verificarStatus() {
        return Map.of(
                "mensagem", "API do Sistema de ONGs funcionando!"
        );
    }
}
